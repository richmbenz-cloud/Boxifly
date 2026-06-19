import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Package, Search, ArrowLeft, Calendar, MapPin, CreditCard, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";

export default function TrackOrder() {
  const navigate = useNavigate();
  const breadcrumbs = useBreadcrumbs();
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["guest-order", email, orderId],
    queryFn: async () => {
      if (!email || !orderId) return null;

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq("id", orderId)
        .eq("customer_email", email)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        throw new Error("No se encontró ningún pedido con ese email y número de orden");
      }

      return data;
    },
    enabled: searchTriggered && !!email && !!orderId,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !orderId) {
      toast.error("Por favor ingresa tu email y número de orden");
      return;
    }
    setSearchTriggered(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      pending: { label: "Pendiente", variant: "secondary" },
      processing: { label: "Procesando", variant: "default" },
      shipped: { label: "Enviado", variant: "outline" },
      delivered: { label: "Entregado", variant: "default" },
      cancelled: { label: "Cancelado", variant: "destructive" },
    };
    const statusInfo = variants[status] || { label: status, variant: "default" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      pending: { label: "Pendiente", variant: "secondary" },
      paid: { label: "Pagado", variant: "default" },
      failed: { label: "Fallido", variant: "destructive" },
    };
    const statusInfo = variants[status] || { label: status, variant: "default" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="mb-4">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          )}
          
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Rastrear mi pedido</h1>
              <p className="text-sm text-muted-foreground">Ingresa tu email y número de orden para ver el estado</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Buscar pedido
            </CardTitle>
            <CardDescription>
              Usa el email y el número de orden que recibiste en tu confirmación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderId">Número de orden</Label>
                  <Input
                    id="orderId"
                    type="text"
                    placeholder="Ej: a1b2c3d4-..."
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Buscando..." : "Buscar pedido"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && searchTriggered && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive text-center">
                {(error as Error).message || "No se pudo encontrar el pedido. Verifica tu email y número de orden."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        {order && !isLoading && (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Pedido #{order.id.slice(0, 8)}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(order.created_at), "PPP", { locale: es })}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getStatusBadge(order.status)}
                    {getPaymentStatusBadge(order.payment_status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">Dirección de envío</p>
                        <p className="text-muted-foreground">{order.shipping_address}</p>
                        <p className="text-muted-foreground">{order.shipping_city}, {order.shipping_country}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start gap-2 text-sm">
                      <CreditCard className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">Método de pago</p>
                        <p className="text-muted-foreground">
                          {order.payment_method || "No especificado"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <>
                    <Separator />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Notas del pedido</p>
                      <p className="text-muted-foreground">{order.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Productos ({order.order_items?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.products?.name || "Producto"}</h4>
                        <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">S/ {item.price.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          S/ {(item.price * item.quantity).toFixed(2)} total
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total del pedido</span>
                    <span>S/ {order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm text-center">
                  ¿Necesitas ayuda con tu pedido?{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/landing#contacto")}>
                    Contáctanos aquí
                  </Button>
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
