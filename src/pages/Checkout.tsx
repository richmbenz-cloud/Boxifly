import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Package } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useGuestCart } from "@/hooks/useGuestCart";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useIzipay } from "@/hooks/useIzipay";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { convertPenToUsd, type Currency } from "@/lib/currency";
import { z } from "zod";
import { guestInfoSchema, shippingSchema } from "./checkout/schemas";
import { GuestInfoForm } from "./checkout/GuestInfoForm";
import { ShippingForm } from "./checkout/ShippingForm";
import { PaymentMethodCard } from "./checkout/PaymentMethodCard";
import { OrderSummary } from "./checkout/OrderSummary";
import { PaymentDialog } from "./checkout/PaymentDialog";
import { useCheckoutOrder } from "@/hooks/useCheckoutOrder";

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

  // Charge currency + daily SBS/SUNAT rate (with margin) for USD payments.
  const [currency, setCurrency] = useState<Currency>("PEN");
  const { data: fxRate, isLoading: fxLoading, isError: fxError } = useExchangeRate();
  const effectiveRate = fxRate?.effective_rate;

  const deliveryEstimate = getDeliveryEstimate(shippingCity || city);

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

  const handleDetectLocation = async () => {
    const location = await getCurrentLocation();
    if (location?.city) {
      setShippingCity(location.city);
      handleFieldChange("shippingCity", location.city, setShippingCity);
    }
  };

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

  const createOrder = useCheckoutOrder({
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
    exchangeRate: effectiveRate,
    validateField,
    initiatePayment,
    renderPaymentForm,
    clearGuestCart,
    toast,
    navigate,
    setOrderId,
    setPaymentFormToken,
    setShowPaymentDialog,
  });

  const subtotal = cartItems?.reduce((sum, item) => {
    return sum + (Number(item.products?.price || 0) * item.quantity);
  }, 0) || 0;

  const pointsDiscount = pointsToUse; // 1 point = S/1
  const total = subtotal - couponDiscount - pointsDiscount;
  const itemCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Total expressed in the selected charge currency (USD uses the daily rate + margin).
  const displayTotal =
    currency === "USD" && effectiveRate ? convertPenToUsd(total, effectiveRate) : total;

  // Calculate max points that can be used (can't exceed total after coupon discount)
  const maxPointsUsable = Math.min(userPoints || 0, Math.floor(subtotal - couponDiscount));

  const handleCouponApplied = (discount: number, code: string) => {
    setCouponDiscount(discount);
    setAppliedCoupon(code);
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
            {!user && (
              <GuestInfoForm
                guestName={guestName}
                guestEmail={guestEmail}
                guestPhone={guestPhone}
                createAccount={createAccount}
                touchedFields={touchedFields}
                validationErrors={validationErrors}
                setGuestName={setGuestName}
                setGuestEmail={setGuestEmail}
                setGuestPhone={setGuestPhone}
                setCreateAccount={setCreateAccount}
                handleFieldChange={handleFieldChange}
                handleFieldBlur={handleFieldBlur}
              />
            )}

            <ShippingForm
              shippingAddress={shippingAddress}
              shippingCity={shippingCity}
              notes={notes}
              city={city}
              locationLoading={locationLoading}
              deliveryEstimate={deliveryEstimate}
              touchedFields={touchedFields}
              validationErrors={validationErrors}
              setShippingAddress={setShippingAddress}
              setShippingCity={setShippingCity}
              setNotes={setNotes}
              setShippingCoordinates={setShippingCoordinates}
              handleFieldChange={handleFieldChange}
              handleFieldBlur={handleFieldBlur}
              handleDetectLocation={handleDetectLocation}
            />

            <PaymentMethodCard
              currency={currency}
              setCurrency={setCurrency}
              sbsVenta={fxRate?.sbs_venta}
              margin={fxRate?.margin}
              rateLoading={fxLoading}
              rateError={fxError}
            />
          </div>

          <OrderSummary
            cartItems={cartItems}
            currency={currency}
            displayTotal={displayTotal}
            user={user}
            userPoints={userPoints}
            maxPointsUsable={maxPointsUsable}
            pointsToUse={pointsToUse}
            setPointsToUse={setPointsToUse}
            showCoupon={showCoupon}
            setShowCoupon={setShowCoupon}
            subtotal={subtotal}
            couponDiscount={couponDiscount}
            pointsDiscount={pointsDiscount}
            total={total}
            itemCount={itemCount}
            isFormValid={isFormValid}
            isPending={createOrder.isPending}
            handleCouponApplied={handleCouponApplied}
            onPay={() => createOrder.mutate()}
          />
        </div>

        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          paymentFormRef={paymentFormRef}
        />
      </div>
    </div>
  );
}
