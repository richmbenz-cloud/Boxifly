import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle, Package, MapPin, Clock, Check, X, Gift, Crown } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { CouponInput } from "@/components/CouponInput";
import { useGuestCart } from "@/hooks/useGuestCart";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AddressMapPicker } from "@/components/AddressMapPicker";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { VIPBadge } from "@/components/VIPBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useIzipay } from "@/hooks/useIzipay";
import { z } from "zod";

// Validation schemas
const guestInfoSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100),
  email: z.string().email("Email inválido").max(255),
  phone: z.string().min(9, "Teléfono inválido").max(15),
});

const shippingSchema = z.object({
  address: z.string().min(10, "La dirección debe ser más específica").max(200),
  city: z.string().min(3, "Ciudad requerida").max(100),
});

export default function Checkout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { guestCart, clearGuestCart } = useGuestCart();
  const { getCurrentLocation, getDeliveryEstimate, city, loading: locationLoading } = useGeolocation();
  
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [createAccount, setCreateAccount] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingCoordinates, setShippingCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [notes, setNotes] = useState("");
   const [couponDiscount, setCouponDiscount] = useState(0);
   const [appliedCoupon, setAppliedCoupon] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  
  // Real-time validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Izipay payment states
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentFormToken, setPaymentFormToken] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const paymentFormRef = useRef<HTMLDivElement>(null);
  const { initiatePayment, renderPaymentForm, loading: izipayLoading } = useIzipay();

  const deliveryEstimate = getDeliveryEstimate(shippingCity || city);

  // Render Izipay payment form and attach events are handled directly
  // when the card payment is initiated in the createOrder mutation.


  // Real-time field validation
  const validateField = (field: string, value: string) => {
    try {
      if (field === "guestName" || field === "guestEmail" || field === "guestPhone") {
        const fieldName = field.replace("guest", "").toLowerCase();
        guestInfoSchema.pick({ [fieldName]: true } as any).parse({ [fieldName]: value });
      } else if (field === "shippingAddress" || field === "shippingCity") {
        const fieldName = field.replace("shipping", "").toLowerCase();
        shippingSchema.pick({ [fieldName]: true } as any).parse({ [fieldName]: value });
      }
      
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: error.issues[0].message
        }));
      }
      return false;
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const handleFieldChange = (field: string, value: string, setter: (val: string) => void) => {
    setter(value);
    if (touchedFields[field]) {
      validateField(field, value);
    }
  };

  // Handle location detection
  const handleDetectLocation = async () => {
    const location = await getCurrentLocation();
    if (location?.city) {
      setShippingCity(location.city);
      handleFieldChange("shippingCity", location.city, setShippingCity);
    }
  };

  // Guest cart items
  const { data: guestCartItems, isLoading: isLoadingGuest } = useQuery({
    queryKey: ["guest-cart-checkout", guestCart],
    queryFn: async () => {
      if (guestCart.length === 0) return [];
      
      const productIds = guestCart.map(item => item.productId);
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          stock,
          product_images (
            image_url,
            is_primary
          )
        `)
        .in("id", productIds)
        .eq("is_active", true);

      if (error) throw error;
      
      return guestCart.map(cartItem => ({
        id: cartItem.productId,
        product_id: cartItem.productId,
        quantity: cartItem.quantity,
        products: data?.find(p => p.id === cartItem.productId),
      }));
    },
    enabled: !user && guestCart.length > 0,
  });

  // Authenticated cart items
  const { data: authCartItems, isLoading: isLoadingAuth } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          products (
            id,
            name,
            price,
            stock,
            product_images (
              image_url,
              is_primary
            )
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const cartItems = user ? authCartItems : guestCartItems;
  const isLoading = user ? isLoadingAuth : isLoadingGuest;

  // Fetch user's loyalty points if authenticated
  const { data: userPoints } = useQuery({
    queryKey: ["loyalty-points", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { data, error } = await supabase
        .rpc("get_user_points_balance", { p_user_id: user.id });

      if (error) throw error;
      return data || 0;
    },
    enabled: !!user,
  });

  // Fetch VIP tier information for discount
  const { data: vipInfo } = useQuery({
    queryKey: ["vip-tier-info", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .rpc("get_vip_tier_info", { p_user_id: user.id });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!user,
  });

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
         const paymentData = {
           amount: finalTotal,
           orderId: order.id,
           currency: 'PEN',
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
            password: `Boxifly${Date.now()}`, // Generate temporary password
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

  const subtotal = cartItems?.reduce((sum, item) => {
    return sum + (Number(item.products?.price || 0) * item.quantity);
  }, 0) || 0;

  const pointsDiscount = pointsToUse; // 1 point = S/1
  const total = subtotal - couponDiscount - pointsDiscount;
  const itemCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Calculate max points that can be used (can't exceed total after coupon discount)
  const maxPointsUsable = Math.min(userPoints || 0, Math.floor(subtotal - couponDiscount));

  const handleCouponApplied = (discount: number, code: string) => {
    setCouponDiscount(discount);
    setAppliedCoupon(code);
  };

  // Validation icon component
  const ValidationIcon = ({ field }: { field: string }) => {
    if (!touchedFields[field]) return null;
    
    if (validationErrors[field]) {
      return <X className="h-4 w-4 text-destructive absolute right-3 top-1/2 -translate-y-1/2" />;
    }
    
    return <Check className="h-4 w-4 text-success absolute right-3 top-1/2 -translate-y-1/2" />;
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-16 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-3">Carrito vacío</h2>
            <p className="text-muted-foreground mb-8">
              No tienes productos en tu carrito para procesar
            </p>
            <Link to="/shop">
              <Button size="lg" className="w-full">Ir a la tienda</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-muted rounded" />
                <div className="h-48 bg-muted rounded" />
              </div>
              <div className="h-96 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isFormValid = user 
    ? shippingAddress && shippingCity && !Object.keys(validationErrors).length
    : guestName && guestEmail && guestPhone && shippingAddress && shippingCity && !Object.keys(validationErrors).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <Link to="/cart">
          <Button variant="ghost" className="mb-6 hover:bg-primary/10 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al carrito
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Finalizar Compra</h1>
          <p className="text-muted-foreground">
            Checkout rápido y seguro
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-4">
            {/* Guest Information */}
            {!user && (
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Tus datos</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Compra sin registrarte
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="relative">
                      <Label htmlFor="guest-name" className="text-sm font-medium">Nombre completo</Label>
                      <Input
                        id="guest-name"
                        value={guestName}
                        onChange={(e) => handleFieldChange("guestName", e.target.value, setGuestName)}
                        onBlur={() => handleFieldBlur("guestName")}
                        placeholder="Juan Pérez"
                        required
                        className={`mt-1.5 pr-10 transition-colors ${
                          touchedFields.guestName && validationErrors.guestName 
                            ? "border-destructive focus-visible:ring-destructive" 
                            : touchedFields.guestName && !validationErrors.guestName
                            ? "border-success focus-visible:ring-success"
                            : ""
                        }`}
                      />
                      <ValidationIcon field="guestName" />
                      {touchedFields.guestName && validationErrors.guestName && (
                        <p className="text-xs text-destructive mt-1 animate-fade-in">{validationErrors.guestName}</p>
                      )}
                    </div>
                    
                    <div className="relative">
                      <Label htmlFor="guest-email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="guest-email"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => handleFieldChange("guestEmail", e.target.value, setGuestEmail)}
                        onBlur={() => handleFieldBlur("guestEmail")}
                        placeholder="tu@email.com"
                        required
                        className={`mt-1.5 pr-10 transition-colors ${
                          touchedFields.guestEmail && validationErrors.guestEmail 
                            ? "border-destructive focus-visible:ring-destructive" 
                            : touchedFields.guestEmail && !validationErrors.guestEmail
                            ? "border-success focus-visible:ring-success"
                            : ""
                        }`}
                      />
                      <ValidationIcon field="guestEmail" />
                      {touchedFields.guestEmail && validationErrors.guestEmail && (
                        <p className="text-xs text-destructive mt-1 animate-fade-in">{validationErrors.guestEmail}</p>
                      )}
                    </div>

                    <div className="relative">
                      <Label htmlFor="guest-phone" className="text-sm font-medium">Teléfono</Label>
                      <Input
                        id="guest-phone"
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => handleFieldChange("guestPhone", e.target.value, setGuestPhone)}
                        onBlur={() => handleFieldBlur("guestPhone")}
                        placeholder="+51 999 999 999"
                        required
                        className={`mt-1.5 pr-10 transition-colors ${
                          touchedFields.guestPhone && validationErrors.guestPhone 
                            ? "border-destructive focus-visible:ring-destructive" 
                            : touchedFields.guestPhone && !validationErrors.guestPhone
                            ? "border-success focus-visible:ring-success"
                            : ""
                        }`}
                      />
                      <ValidationIcon field="guestPhone" />
                      {touchedFields.guestPhone && validationErrors.guestPhone && (
                        <p className="text-xs text-destructive mt-1 animate-fade-in">{validationErrors.guestPhone}</p>
                      )}
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg border border-primary/20 transition-all hover:bg-primary/10">
                    <Checkbox 
                      id="create-account" 
                      checked={createAccount}
                      onCheckedChange={(checked) => setCreateAccount(checked as boolean)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor="create-account" 
                        className="text-sm font-medium cursor-pointer leading-tight"
                      >
                        Crear cuenta para seguimiento de pedidos
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Recibirás un email para establecer tu contraseña
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipping Information */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Dirección de envío</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">Entrega en todo Perú</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 relative">
                    <Label htmlFor="address" className="text-sm font-medium">Dirección completa</Label>
                    <Input
                      id="address"
                      value={shippingAddress}
                      onChange={(e) => handleFieldChange("shippingAddress", e.target.value, setShippingAddress)}
                      onBlur={() => handleFieldBlur("shippingAddress")}
                      placeholder="Av. Principal 123, Dpto 4B"
                      required
                      className={`mt-1.5 pr-10 transition-colors ${
                        touchedFields.shippingAddress && validationErrors.shippingAddress 
                          ? "border-destructive focus-visible:ring-destructive" 
                          : touchedFields.shippingAddress && !validationErrors.shippingAddress
                          ? "border-success focus-visible:ring-success"
                          : ""
                      }`}
                    />
                    <ValidationIcon field="shippingAddress" />
                    {touchedFields.shippingAddress && validationErrors.shippingAddress && (
                      <p className="text-xs text-destructive mt-1 animate-fade-in">{validationErrors.shippingAddress}</p>
                    )}
                  </div>
                  
                  <div className="relative">
                    <Label htmlFor="city" className="text-sm font-medium flex items-center justify-between">
                      Ciudad
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleDetectLocation}
                        disabled={locationLoading}
                        className="h-auto py-1 px-2 text-xs"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        {locationLoading ? "..." : "Detectar"}
                      </Button>
                    </Label>
                    <Input
                      id="city"
                      value={shippingCity}
                      onChange={(e) => handleFieldChange("shippingCity", e.target.value, setShippingCity)}
                      onBlur={() => handleFieldBlur("shippingCity")}
                      placeholder="Lima"
                      required
                      className={`mt-1.5 pr-10 transition-colors ${
                        touchedFields.shippingCity && validationErrors.shippingCity 
                          ? "border-destructive focus-visible:ring-destructive" 
                          : touchedFields.shippingCity && !validationErrors.shippingCity
                          ? "border-success focus-visible:ring-success"
                          : ""
                      }`}
                    />
                    <ValidationIcon field="shippingCity" />
                    {touchedFields.shippingCity && validationErrors.shippingCity && (
                      <p className="text-xs text-destructive mt-1 animate-fade-in">{validationErrors.shippingCity}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">País</Label>
                    <Input value="Perú" disabled className="mt-1.5 bg-muted/50" />
                  </div>
                </div>

                {/* Delivery Estimate Alert */}
                {(shippingCity || city) && (
                  <Alert className="bg-primary/5 border-primary/20">
                    <Clock className="h-4 w-4 text-primary" />
                    <AlertDescription className="ml-2">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sm">Entrega: {deliveryEstimate.days}</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {deliveryEstimate.expressAvailable && (
                            <Badge variant="secondary" className="text-xs">
                              Express disponible
                            </Badge>
                          )}
                          {deliveryEstimate.pickupAvailable && deliveryEstimate.nearestStore && (
                            <Badge variant="outline" className="text-xs">
                              Retiro en {deliveryEstimate.nearestStore}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Interactive Address Map */}
                <div className="mt-4">
                  <AddressMapPicker
                    address={shippingAddress}
                    city={shippingCity}
                    onAddressChange={setShippingAddress}
                    onCityChange={setShippingCity}
                    onCoordinatesChange={(lat, lng) => setShippingCoordinates({ lat, lng })}
                  />
                </div>

                <div className="mt-4">
                  <Label htmlFor="notes" className="text-sm font-medium">Notas adicionales (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Referencias de entrega, horarios preferidos, etc."
                    className="mt-1.5"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method - only Izipay (cards) */}
             <Card className="shadow-md hover:shadow-lg transition-shadow">
               <CardHeader className="pb-4">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-primary/10 rounded-lg">
                     <CreditCard className="h-5 w-5 text-primary" />
                   </div>
                   <div>
                     <CardTitle className="text-xl">Método de pago</CardTitle>
                     <p className="text-sm text-muted-foreground mt-0.5">
                       Pago seguro con tarjeta de crédito o débito procesado por Izipay
                     </p>
                   </div>
                 </div>
               </CardHeader>
               <CardContent>
                 <div className="flex items-center space-x-3 p-3 border-2 rounded-lg">
                   <div className="p-2 rounded-lg bg-primary/10">
                     <CreditCard className="h-5 w-5 text-primary" />
                   </div>
                   <div className="flex-1">
                     <div className="font-semibold text-sm">Tarjeta de crédito/débito</div>
                     <div className="text-xs text-muted-foreground">
                       Visa, Mastercard y Amex a través de la pasarela segura de Izipay
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground p-3 bg-muted/30 rounded-lg">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs">
                Datos protegidos con encriptación SSL
              </span>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar">
                  {cartItems.map(item => {
                    const product = item.products;
                    const primaryImage = product?.product_images?.find((img: any) => img.is_primary);
                    
                    return (
                      <div key={item.id} className="flex gap-3 pb-3 border-b last:border-0">
                        <div className="relative w-14 h-14 rounded overflow-hidden shrink-0">
                          {primaryImage ? (
                            <img
                              src={primaryImage.image_url}
                              alt={product?.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                            {item.quantity}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2 mb-1">
                            {product?.name}
                          </p>
                          <p className="text-sm font-bold text-primary">
                            S/ {(Number(product?.price || 0) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <Separator />
                
                {/* Loyalty Points Redemption */}
                {user && userPoints > 0 && (
                  <div className="space-y-3 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">Puntos de fidelidad</span>
                      </div>
                      <Badge variant="secondary" className="font-mono">
                        {userPoints} pts
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Usar puntos (1 punto = S/1)</span>
                        <span>Máximo: {maxPointsUsable} pts</span>
                      </div>
                      
                      <Slider
                        value={[pointsToUse]}
                        onValueChange={(value) => setPointsToUse(value[0])}
                        max={maxPointsUsable}
                        step={1}
                        className="w-full"
                        disabled={maxPointsUsable === 0}
                      />
                      
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-muted-foreground">
                          Puntos a usar:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">
                            {pointsToUse}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            pts
                          </span>
                        </div>
                      </div>
                      
                      {pointsToUse > 0 && (
                        <div className="flex justify-between text-xs pt-2 border-t">
                          <span className="text-success font-medium">Descuento:</span>
                          <span className="text-success font-bold">-S/ {pointsToUse.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Los puntos usados se descontarán después de confirmar tu pedido
                    </p>
                  </div>
                )}

                {/* Coupon Input - Discrete */}
                {!showCoupon ? (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCoupon(true)}
                    className="w-full text-xs h-8 text-muted-foreground hover:text-foreground"
                  >
                    ¿Tienes un cupón?
                  </Button>
                ) : (
                  <div className="animate-fade-in">
                    <CouponInput 
                      subtotal={subtotal}
                      onCouponApplied={handleCouponApplied}
                    />
                  </div>
                )}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                    </span>
                    <span className="font-medium">S/ {subtotal.toFixed(2)}</span>
                  </div>
                  
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-success animate-fade-in">
                      <span>Descuento cupón</span>
                      <span className="font-medium">-S/ {couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {pointsToUse > 0 && (
                    <div className="flex justify-between text-sm text-success animate-fade-in">
                      <span className="flex items-center gap-1">
                        <Gift className="h-3 w-3" />
                        Descuento puntos
                      </span>
                      <span className="font-medium">-S/ {pointsDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <Badge variant="secondary" className="text-xs">Incluido</Badge>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between text-xl">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary">S/ {total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                    <span>Productos auténticos</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                    <span>30 días devoluciones</span>
                  </div>
                </div>

                <Button 
                  size="lg"
                  className="w-full shadow-lg hover:shadow-xl h-12 text-base transition-all"
                  onClick={() => createOrder.mutate()}
                  disabled={!isFormValid || createOrder.isPending}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {createOrder.isPending ? "Procesando..." : `Pagar S/ ${total.toFixed(2)}`}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  Compra 100% segura
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Izipay Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Pagar con tarjeta</DialogTitle>
              <DialogDescription>
                Completa tus datos de pago de forma segura
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div 
                id="izipay-payment-form" 
                ref={paymentFormRef}
                className="min-h-[400px]"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
