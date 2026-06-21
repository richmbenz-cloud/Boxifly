import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { convertPenToUsd, type Currency } from "@/lib/currency";

// Genera una contraseña temporal criptográficamente aleatoria.
// El usuario nunca la usa: recibe un email para establecer la suya propia.
// Incluye mayúscula, minúscula, número y símbolo para cumplir requisitos de complejidad.
function generateSecurePassword(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const random = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `Bx${random}Aa1!`;
}

interface UseCheckoutOrderParams {
  user: any;
  cartItems: any[] | undefined;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  shippingAddress: string;
  shippingCity: string;
  notes: string;
  couponDiscount: number;
  pointsToUse: number;
  createAccount: boolean;
  // Selected charge currency and effective PEN->USD rate (from useExchangeRate).
  currency: Currency;
  exchangeRate?: number | null;
  validateField: (field: string, value: string) => boolean;
  initiatePayment: (data: any) => Promise<any>;
  renderPaymentForm: (formToken: string, containerId: string) => Promise<void>;
  clearGuestCart: () => void;
  toast: (opts: any) => void;
  navigate: (path: string) => void;
  setOrderId: (id: string | null) => void;
  setPaymentFormToken: (token: string | null) => void;
  setShowPaymentDialog: (show: boolean) => void;
}

export function useCheckoutOrder({
  user,
  cartItems,
  guestName,
  guestEmail,
  guestPhone,
  shippingAddress,
  shippingCity,
  notes,
  couponDiscount,
  pointsToUse,
  createAccount,
  currency,
  exchangeRate,
  validateField,
  initiatePayment,
  renderPaymentForm,
  clearGuestCart,
  toast,
  navigate,
  setOrderId,
  setPaymentFormToken,
  setShowPaymentDialog,
}: UseCheckoutOrderParams) {
    const createOrder = useMutation({
    mutationFn: async () => {
      if (!cartItems || cartItems.length === 0) return;

      // Validate all fields before submission
      const allValid = !user 
        ? validateField("guestName", guestName) &&
          validateField("guestEmail", guestEmail) &&
          validateField("guestPhone", guestPhone) &&
          validateField("shippingAddress", shippingAddress) &&
          validateField("shippingCity", shippingCity)
        : validateField("shippingAddress", shippingAddress) &&
          validateField("shippingCity", shippingCity);

      if (!allValid) {
        throw new Error("Por favor corrige los errores en el formulario");
      }

      const orderTotal = cartItems.reduce((sum, item) => {
        return sum + (Number(item.products?.price || 0) * item.quantity);
      }, 0);

      const pointsDiscount = pointsToUse; // 1 point = S/1
      const finalTotal = orderTotal - couponDiscount - pointsDiscount;

      // For guest checkout, store order with guest info in notes
      const guestInfo = !user ? `\nPedido de invitado:\nNombre: ${guestName}\nEmail: ${guestEmail}\nTeléfono: ${guestPhone}` : "";
      const orderNotes = notes + guestInfo;

      let order: { id: string };

      if (user) {
        // Authenticated user — direct insert (RLS: auth.uid() = user_id)
        const { data: inserted, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            total_amount: finalTotal,
            shipping_address: shippingAddress,
            shipping_city: shippingCity,
            notes: orderNotes,
            payment_method: "card",
            customer_email: user.email,
            customer_phone: null,
            payment_status: "pending",
          })
          .select()
          .single();

        if (orderError) throw orderError;
        order = inserted;

        const orderItems = cartItems.map(item => ({
          order_id: order.id,
          product_id: item.products?.id || item.product_id,
          quantity: item.quantity,
          price: item.products?.price || 0,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;
      } else {
        // Guest checkout — server-side RPC validates and inserts atomically
        const itemsPayload = cartItems.map(item => ({
          product_id: item.products?.id || item.product_id,
          quantity: item.quantity,
          price: Number(item.products?.price || 0),
        }));

        const { data: newOrderId, error: rpcError } = await supabase.rpc(
          "create_guest_order",
          {
            p_total_amount: finalTotal,
            p_shipping_address: shippingAddress,
            p_shipping_city: shippingCity,
            p_notes: orderNotes,
            p_customer_email: guestEmail,
            p_customer_phone: guestPhone,
            p_items: itemsPayload,
          }
        );

        if (rpcError) throw rpcError;
        order = { id: newOrderId as string };
      }

       // In this version, all payments se procesan con tarjeta (Izipay)
        {
         // The order total is always canonical in soles (finalTotal). If the
         // customer chose to pay in USD, convert using the effective rate
         // (SBS venta + margin) so the FX spread never causes a loss.
         let chargeAmount = finalTotal;
         let chargeCurrency: Currency = 'PEN';
         let appliedRate: number | null = null;

         if (currency === 'USD') {
           if (!exchangeRate || exchangeRate <= 0) {
             throw new Error('Tipo de cambio no disponible. Intenta nuevamente o paga en soles.');
           }
           chargeAmount = convertPenToUsd(finalTotal, exchangeRate);
           chargeCurrency = 'USD';
           appliedRate = exchangeRate;
         }

         const paymentData = {
           amount: chargeAmount,
           orderId: order.id,
           currency: chargeCurrency,
           exchangeRate: appliedRate,
           baseAmountPen: finalTotal,
           email: user ? user.email! : guestEmail,
           firstName: user ? (user.user_metadata?.full_name?.split(' ')[0] || guestName.split(' ')[0]) : guestName.split(' ')[0],
           lastName: user ? (user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '') : guestName.split(' ').slice(1).join(' '),
           description: `Pedido tienda online #${order.id.slice(0, 8)}`,
         };
 
         const paymentResponse = await initiatePayment(paymentData);
         
         if (!paymentResponse?.success || !paymentResponse.formToken) {
           throw new Error(paymentResponse?.error || 'Error al iniciar el pago con tarjeta');
         }
 
         // Store order ID and form token for later use
         setOrderId(order.id);
        setPaymentFormToken(paymentResponse.formToken);
        setShowPaymentDialog(true);

        // Wait a bit for the dialog DOM to render, then render the Izipay form
        setTimeout(async () => {
          try {
            await renderPaymentForm(paymentResponse.formToken!, 'izipay-payment-form');
          } catch (err) {
            console.error('Error rendering payment form:', err);
            toast({
              title: 'Error',
              description: 'No se pudo cargar el formulario de pago. Intenta nuevamente.',
              variant: 'destructive',
            });
            setShowPaymentDialog(false);
          }
        }, 300);
        
        // Don't complete order yet - wait for payment confirmation (vía webhook)
        return { order, requiresPayment: true };
      }

      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.products?.id || item.product_id,
        quantity: item.quantity,
        price: item.products?.price || 0,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Register points spent if applicable
      if (user && pointsToUse > 0) {
        const { error: pointsError } = await supabase
          .from("loyalty_points")
          .insert({
            user_id: user.id,
            order_id: order.id,
            points_spent: pointsToUse,
            points_balance: -pointsToUse,
            transaction_type: "spent",
            description: `Puntos usados en pedido #${order.id.slice(0, 8)}`,
          });

        if (pointsError) {
          console.error("Error registering points:", pointsError);
          // Don't fail the order if points registration fails
        }
      }

      // Send confirmation email
      try {
        const emailData = {
          orderId: order.id,
          customerEmail: user ? user.email : guestEmail,
          customerName: user ? (user.user_metadata?.full_name || guestName) : guestName,
          orderTotal: finalTotal,
          orderItems: cartItems.map(item => ({
            name: item.products?.name || '',
            quantity: item.quantity,
            price: item.products?.price || 0,
          })),
        };

        await supabase.functions.invoke('order-confirmation-email', {
          body: emailData,
        });
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Don't fail the order if email fails
      }

      // Clear cart
      if (user) {
        const { error: clearError } = await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id);
        if (clearError) throw clearError;
      } else {
        clearGuestCart();
      }

      // Create account if guest selected the option
      if (!user && createAccount && guestEmail && guestName) {
        try {
          const { error: signUpError } = await supabase.auth.signUp({
            email: guestEmail,
            password: generateSecurePassword(), // Contraseña aleatoria; el usuario la define por email
            options: {
              data: {
                full_name: guestName,
                role: 'customer',
              },
              emailRedirectTo: `${window.location.origin}/`,
            }
          });
          
          if (signUpError) {
            console.error("Error creating account:", signUpError);
          }
        } catch (error) {
          console.error("Error during account creation:", error);
        }
      }

      return { order, accountCreated: !user && createAccount, requiresPayment: false };
    },
    onSuccess: (data) => {
      // If payment is required (card), don't show success yet - wait for payment
      if (data?.requiresPayment) {
        return;
      }

      toast({
        title: "¡Pedido creado exitosamente!",
        description: data?.accountCreated 
          ? "Tu pedido ha sido procesado. Revisa tu email para activar tu cuenta y establecer tu contraseña."
          : user 
          ? "Tu pedido ha sido procesado y está en camino" 
          : "Recibirás un email de confirmación con los detalles de tu pedido",
      });
      
      // Navigate to order confirmation page
      navigate(`/order-confirmation?orderId=${data?.order.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear el pedido",
        description: error.message || "No se pudo procesar tu pedido. Intenta nuevamente",
        variant: "destructive",
      });
    },
  });

  return createOrder;
}
