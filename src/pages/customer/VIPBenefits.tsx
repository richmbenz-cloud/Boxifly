import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { VIPGradientBadge } from "@/components/VIPBadge";
import DashboardLayout from "@/components/DashboardLayout";
import { Crown, Gift, Truck, HeadphonesIcon, ShoppingBag, Calendar, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  expires_at: string | null;
  min_purchase_amount: number | null;
  used_count: number;
  max_uses: number | null;
}

export default function VIPBenefits() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch VIP tier information
  const { data: vipInfo, isLoading: loadingVipInfo } = useQuery({
    queryKey: ["vip-tier-info", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase.rpc("get_vip_tier_info", {
        p_user_id: user.id,
      });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!user,
  });

  // Fetch available coupons for the user
  const { data: coupons, isLoading: loadingCoupons } = useQuery({
    queryKey: ["user-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("is_active", true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Filter coupons that haven't reached max uses
      return (data as Coupon[]).filter(coupon => 
        !coupon.max_uses || coupon.used_count < coupon.max_uses
      );
    },
  });

  const tierBenefits: Record<string, { name: string; benefits: string[] }> = {
    bronce: {
      name: "Bronce",
      benefits: [
        "Acceso a puntos de fidelidad",
        "Soporte al cliente estándar",
        "Acceso a promociones regulares"
      ]
    },
    plata: {
      name: "Plata",
      benefits: [
        "Cupones exclusivos VIP",
        "Soporte al cliente prioritario",
        "Acceso anticipado a nuevos productos",
        "Notificaciones de ofertas especiales"
      ]
    },
    oro: {
      name: "Oro",
      benefits: [
        "Cupones VIP premium",
        "Envío gratuito en pedidos seleccionados",
        "Soporte al cliente VIP 24/7",
        "Acceso a productos exclusivos",
        "Invitaciones a eventos especiales"
      ]
    },
    platino: {
      name: "Platino",
      benefits: [
        "Cupones VIP de máximo valor",
        "Envío gratuito en todos los pedidos",
        "Gestor de cuenta personal",
        "Acceso VIP a lanzamientos exclusivos",
        "Regalos sorpresa por compras",
        "Prioridad absoluta en todos los servicios"
      ]
    }
  };

  const progressToNextTier = vipInfo?.points_to_next_tier 
    ? Math.min(100, ((vipInfo.lifetime_points / (vipInfo.lifetime_points + vipInfo.points_to_next_tier)) * 100))
    : 100;

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Código copiado",
      description: `El cupón ${code} ha sido copiado al portapapeles`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <DashboardLayout title="Beneficios VIP">
      <div className="space-y-6">
        {/* Current VIP Status Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Tu Nivel VIP</CardTitle>
                <CardDescription>
                  Continúa comprando para desbloquear más beneficios
                </CardDescription>
              </div>
              {vipInfo && (
                <VIPGradientBadge tier={vipInfo.tier || 'bronce'} size="lg" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Puntos totales acumulados
                </span>
                <span className="font-bold text-primary">
                  {vipInfo?.lifetime_points || 0} puntos
                </span>
              </div>
              {vipInfo?.next_tier && (
                <>
                  <Progress value={progressToNextTier} className="h-3" />
                  <p className="text-sm text-muted-foreground text-center">
                    Te faltan <span className="font-semibold text-primary">{vipInfo.points_to_next_tier}</span> puntos para alcanzar el nivel{" "}
                    <span className="font-semibold">{tierBenefits[vipInfo.next_tier]?.name}</span>
                  </p>
                </>
              )}
              {!vipInfo?.next_tier && (
                <p className="text-sm text-center text-primary font-semibold">
                  ¡Has alcanzado el nivel máximo!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Tier Benefits */}
        {vipInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Beneficios de tu nivel {tierBenefits[vipInfo.tier]?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {tierBenefits[vipInfo.tier]?.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Coupons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Cupones Disponibles
            </CardTitle>
            <CardDescription>
              Usa estos cupones en tu próxima compra
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCoupons ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : coupons && coupons.length > 0 ? (
              <div className="space-y-4">
                {coupons.map((coupon) => (
                  <Card key={coupon.id} className="border-dashed border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <code className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded">
                              {coupon.code}
                            </code>
                            {coupon.max_uses && (
                              <Badge variant="outline" className="text-xs">
                                {coupon.max_uses - coupon.used_count} usos restantes
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {coupon.discount_type === 'percentage' 
                              ? `${coupon.discount_value}% de descuento`
                              : `S/ ${coupon.discount_value} de descuento`}
                            {coupon.min_purchase_amount && (
                              <span> · Compra mínima: S/ {coupon.min_purchase_amount}</span>
                            )}
                          </p>
                          {coupon.expires_at && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Válido hasta {format(new Date(coupon.expires_at), "d 'de' MMMM, yyyy", { locale: es })}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyCoupon(coupon.code)}
                          className="flex-shrink-0"
                        >
                          {copiedCode === coupon.code ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No tienes cupones disponibles en este momento</p>
                <p className="text-sm mt-1">¡Sigue comprando para desbloquear nuevos cupones VIP!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Tiers Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Todos los Niveles VIP</CardTitle>
            <CardDescription>
              Descubre los beneficios de cada nivel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(tierBenefits).map(([tier, info]) => (
                <Card 
                  key={tier} 
                  className={`${
                    vipInfo?.tier === tier 
                      ? 'border-primary/50 bg-primary/5 shadow-lg' 
                      : 'border-border/50'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{info.name}</CardTitle>
                      {vipInfo?.tier === tier && (
                        <Badge variant="default">Nivel Actual</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {tier === 'bronce' && '0+ puntos'}
                      {tier === 'plata' && '300+ puntos'}
                      {tier === 'oro' && '750+ puntos'}
                      {tier === 'platino' && '1500+ puntos'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {info.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How to Earn Points */}
        <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              ¿Cómo ganar puntos?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Compra en nuestra tienda</p>
                <p className="text-sm text-muted-foreground">
                  Gana 1 punto por cada S/ 33 que gastes
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
                <Gift className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Sube de nivel VIP</p>
                <p className="text-sm text-muted-foreground">
                  Recibe cupones exclusivos al alcanzar nuevos niveles
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
                <Crown className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Disfruta tus beneficios</p>
                <p className="text-sm text-muted-foreground">
                  Los puntos acumulados nunca expiran y definen tu nivel VIP
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
