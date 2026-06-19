import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Gift, TrendingUp, TrendingDown, Calendar, Award, Crown, Star, Sparkles, Zap } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { VIPGradientBadge } from "@/components/VIPBadge";
import { Progress } from "@/components/ui/progress";

interface LoyaltyTransaction {
  id: string;
  created_at: string;
  transaction_type: string;
  points_earned: number;
  points_spent: number;
  points_balance: number;
  description: string | null;
  order_id: string | null;
  expires_at: string | null;
}

export default function LoyaltyPoints() {
  const { user } = useAuth();

  // Fetch user's current points balance
  const { data: pointsBalance } = useQuery({
    queryKey: ["loyalty-points-balance", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { data, error } = await supabase
        .rpc("get_user_points_balance", { p_user_id: user.id });

      if (error) throw error;
      return data || 0;
    },
    enabled: !!user,
  });

  // Fetch VIP tier information
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

  // Fetch all loyalty transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["loyalty-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("loyalty_points")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LoyaltyTransaction[];
    },
    enabled: !!user,
  });

  // Calculate statistics
  const totalEarned = transactions?.reduce((sum, t) => sum + t.points_earned, 0) || 0;
  const totalSpent = transactions?.reduce((sum, t) => sum + t.points_spent, 0) || 0;
  const activePoints = pointsBalance || 0;

  // VIP tier benefits
  const tierBenefits = {
    bronce: ["1 punto por cada S/ 33", "Acceso a ofertas exclusivas"],
    plata: ["5% descuento adicional", "Envío gratis en pedidos >S/ 200", "Soporte prioritario"],
    oro: ["10% descuento adicional", "Envío gratis en todos los pedidos", "Acceso anticipado a promociones", "Soporte VIP 24/7"],
    platino: ["15% descuento adicional", "Envío express gratis", "Regalos exclusivos", "Personal shopper dedicado", "Acceso a eventos especiales"],
  };

  const progressToNextTier = vipInfo?.points_to_next_tier 
    ? ((vipInfo.lifetime_points || 0) / ((vipInfo.lifetime_points || 0) + vipInfo.points_to_next_tier)) * 100
    : 100;

  return (
    <DashboardLayout title="Mis Puntos de Fidelidad">
      {/* VIP Tier Card */}
      {vipInfo && (
        <Card className="mb-8 overflow-hidden border-2 bg-gradient-to-br from-background via-background to-primary/5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2 flex items-center gap-3">
                  <Crown className="h-7 w-7 text-primary" />
                  Programa VIP
                </CardTitle>
                <CardDescription>
                  Nivel actual basado en {vipInfo.lifetime_points || 0} puntos acumulados históricamente
                </CardDescription>
              </div>
              <VIPGradientBadge tier={vipInfo.tier || 'bronce'} size="lg" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress to next tier */}
            {vipInfo.next_tier && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">
                    Progreso a {vipInfo.next_tier?.charAt(0).toUpperCase() + vipInfo.next_tier?.slice(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Faltan {vipInfo.points_to_next_tier} pts
                  </p>
                </div>
                <Progress value={progressToNextTier} className="h-2" />
              </div>
            )}

            {/* Current benefits */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Beneficios de tu nivel
              </h4>
              <div className="grid gap-2">
                {tierBenefits[vipInfo.tier as keyof typeof tierBenefits]?.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>


            {/* All tiers overview */}
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Niveles VIP</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`p-3 rounded-lg border-2 ${vipInfo.tier === 'bronce' ? 'border-amber-500 bg-amber-50' : 'border-muted bg-muted/30'}`}>
                  <Award className="h-5 w-5 text-amber-700 mb-1" />
                  <p className="text-xs font-bold">Bronce</p>
                  <p className="text-xs text-muted-foreground">0+ pts</p>
                </div>
                <div className={`p-3 rounded-lg border-2 ${vipInfo.tier === 'plata' ? 'border-slate-400 bg-slate-50' : 'border-muted bg-muted/30'}`}>
                  <Star className="h-5 w-5 text-slate-600 mb-1" />
                  <p className="text-xs font-bold">Plata</p>
                  <p className="text-xs text-muted-foreground">300+ pts</p>
                </div>
                <div className={`p-3 rounded-lg border-2 ${vipInfo.tier === 'oro' ? 'border-yellow-500 bg-yellow-50' : 'border-muted bg-muted/30'}`}>
                  <Sparkles className="h-5 w-5 text-yellow-600 mb-1" />
                  <p className="text-xs font-bold">Oro</p>
                  <p className="text-xs text-muted-foreground">750+ pts</p>
                </div>
                <div className={`p-3 rounded-lg border-2 ${vipInfo.tier === 'platino' ? 'border-purple-500 bg-purple-50' : 'border-muted bg-muted/30'}`}>
                  <Crown className="h-5 w-5 text-purple-600 mb-1" />
                  <p className="text-xs font-bold">Platino</p>
                  <p className="text-xs text-muted-foreground">1500+ pts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-primary shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Puntos Disponibles</CardDescription>
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-4xl font-bold text-primary">
              {activePoints}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Equivale a S/ {activePoints.toFixed(2)} en descuentos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total Ganado</CardDescription>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <CardTitle className="text-4xl font-bold text-success">
              {totalEarned}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Puntos acumulados históricamente
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total Canjeado</CardDescription>
              <TrendingDown className="h-5 w-5 text-orange-500" />
            </div>
            <CardTitle className="text-4xl font-bold text-orange-500">
              {totalSpent}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Puntos utilizados en descuentos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">¿Cómo funcionan los puntos?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Ganas <strong>1 punto por cada S/33 gastados</strong> en compras de la tienda online</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Cada punto equivale a <strong>S/1 de descuento</strong> en tus próximas compras</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Los puntos se acreditan cuando tu pedido es entregado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Los puntos expiran <strong>1 año</strong> después de ser ganados</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historial de Transacciones
          </CardTitle>
          <CardDescription>
            Todas tus transacciones de puntos de fidelidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-lg" />
              ))}
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-2">
                No tienes transacciones aún
              </p>
              <p className="text-sm text-muted-foreground">
                Realiza compras en la tienda online para empezar a ganar puntos
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction, index) => {
                const isEarned = transaction.transaction_type === "earned";
                const isSpent = transaction.transaction_type === "spent";
                
                return (
                  <div key={transaction.id}>
                    <div className="flex items-start justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`p-2 rounded-lg ${
                            isEarned
                              ? "bg-success/10"
                              : isSpent
                              ? "bg-orange-500/10"
                              : "bg-muted"
                          }`}
                        >
                          {isEarned ? (
                            <TrendingUp className="h-5 w-5 text-success" />
                          ) : isSpent ? (
                            <TrendingDown className="h-5 w-5 text-orange-500" />
                          ) : (
                            <Gift className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <p className="font-medium text-sm">
                                {transaction.description || 
                                  (isEarned ? "Puntos ganados" : "Puntos canjeados")}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(transaction.created_at), "PPP 'a las' p", { locale: es })}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <Badge
                                variant={isEarned ? "secondary" : "outline"}
                                className={`text-sm font-bold ${
                                  isEarned
                                    ? "bg-success/10 text-success border-success/20"
                                    : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                }`}
                              >
                                {isEarned ? "+" : "-"}
                                {isEarned ? transaction.points_earned : transaction.points_spent} pts
                              </Badge>
                              {transaction.order_id && (
                                <p className="text-xs text-muted-foreground mt-1 font-mono">
                                  #{transaction.order_id.slice(0, 8)}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {transaction.expires_at && new Date(transaction.expires_at) > new Date() && isEarned && (
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Expira el {format(new Date(transaction.expires_at), "PPP", { locale: es })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {index < transactions.length - 1 && <Separator className="my-2" />}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}