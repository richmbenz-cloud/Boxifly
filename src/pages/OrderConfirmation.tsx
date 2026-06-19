import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package, Truck, Gift, ArrowRight, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/lib/auth";

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const orderId = searchParams.get("orderId");
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              price,
              product_images (
                image_url,
                is_primary
              )
            )
          )
        `)
        .eq("id", orderId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  // Fetch user's loyalty points if authenticated
  const { data: pointsData } = useQuery({
    queryKey: ["loyalty-points", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .rpc("get_user_points_balance", { p_user_id: user.id });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (pointsData !== null && pointsData !== undefined) {
      setLoyaltyPoints(pointsData);
    }
  }, [pointsData]);

  // Fetch recommended products
  const { data: recommendedProducts } = useQuery({
    queryKey: ["recommended-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images (
            image_url,
            is_primary
          )
        `)
        .eq("is_active", true)
        .eq("featured", true)
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  const calculatePointsEarned = () => {
    if (!order) return 0;
    return Math.floor(order.total_amount / 33);
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3">Pedido no encontrado</h2>
            <p className="text-muted-foreground mb-6">
              No pudimos encontrar el pedido solicitado
            </p>
            <Button onClick={() => navigate("/shop")} className="w-full">
              Volver a la tienda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto animate-pulse space-y-6">
            <div className="h-64 bg-muted rounded-xl" />
            <div className="h-48 bg-muted rounded-xl" />
            <div className="h-96 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3">Error al cargar pedido</h2>
            <p className="text-muted-foreground mb-6">
              No pudimos cargar los detalles del pedido
            </p>
            <Button onClick={() => navigate("/shop")} className="w-full">
              Volver a la tienda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pointsEarned = calculatePointsEarned();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <Card className="mb-8 border-2 border-success/20 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-success/10 to-success/5 p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-success rounded-full mb-6 animate-bounce-slow">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                ¡Pedido confirmado!
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                Gracias por tu compra. Hemos recibido tu pedido y lo estamos procesando.
              </p>
              <div className="inline-flex items-center gap-2 bg-background px-6 py-3 rounded-full">
                <span className="text-sm text-muted-foreground">Pedido:</span>
                <Badge variant="secondary" className="text-base font-mono">
                  #{order.id.slice(0, 8).toUpperCase()}
                </Badge>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Order Summary Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Resumen del pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {order.order_items?.map((item: any) => {
                    const primaryImage = item.products?.product_images?.find((img: any) => img.is_primary);
                    const imageUrl = primaryImage?.image_url || item.products?.product_images?.[0]?.image_url;
                    
                    return (
                      <div key={item.id} className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        {imageUrl && (
                          <img 
                            src={imageUrl} 
                            alt={item.products?.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-base mb-1">
                            {item.products?.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Cantidad: {item.quantity}
                            </span>
                            <span className="font-semibold text-primary">
                              S/ {(Number(item.price) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>S/ {Number(order.total_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t-2">
                    <span>Total</span>
                    <span className="text-primary">
                      S/ {Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <Truck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Dirección de envío</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.shipping_address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.shipping_city}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loyalty Points & Info */}
            <div className="space-y-6">
              {user && (
                <Card className="border-2 border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Gift className="h-5 w-5 text-primary" />
                      Puntos de fidelidad
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-2">Has ganado</p>
                      <p className="text-4xl font-bold text-primary mb-2">
                        +{pointsEarned}
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">puntos con esta compra</p>
                      <Separator className="my-4" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total puntos:</span>
                        <span className="font-bold text-primary">{loyaltyPoints + pointsEarned} pts</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      Ganas 1 punto por cada S/33 gastados. Cada punto = S/1 de descuento en compras de tienda online. Los puntos se acreditarán cuando tu pedido sea entregado.
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">¿Qué sigue?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      1
                    </div>
                    <p className="text-muted-foreground pt-1">
                      Recibirás un email de confirmación
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      2
                    </div>
                    <p className="text-muted-foreground pt-1">
                      Prepararemos tu pedido
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      3
                    </div>
                    <p className="text-muted-foreground pt-1">
                      Lo enviaremos a tu dirección
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recommended Products */}
          {recommendedProducts && recommendedProducts.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Te podría interesar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendedProducts.map((product) => {
                    const primaryImage = product.product_images?.find((img: any) => img.is_primary);
                    const imageUrl = primaryImage?.image_url || product.product_images?.[0]?.image_url;
                    
                    return (
                      <Link 
                        key={product.id} 
                        to={`/product/${product.id}`}
                        className="group"
                      >
                        <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                          {imageUrl && (
                            <div className="aspect-square overflow-hidden bg-muted">
                              <img 
                                src={imageUrl} 
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                              {product.name}
                            </h3>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-primary">
                                S/ {Number(product.price).toFixed(2)}
                              </span>
                              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="flex-1"
              onClick={() => navigate("/track-order")}
            >
              <Package className="h-5 w-5 mr-2" />
              Rastrear pedido
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/shop")}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Seguir comprando
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}