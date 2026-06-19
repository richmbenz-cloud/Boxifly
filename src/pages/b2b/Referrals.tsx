import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Gift, Users, DollarSign, Check, Clock, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function B2BReferrals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Obtener o crear código de referido
  const { data: referralCode, isLoading: loadingCode } = useQuery({
    queryKey: ["b2b-referral-code", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: existing } = await supabase
        .from("referral_codes")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (existing) return existing;

      const { data: newCode } = await supabase.rpc("generate_referral_code");
      
      if (newCode) {
        const { data: created, error } = await supabase
          .from("referral_codes")
          .insert({
            user_id: user.id,
            code: newCode,
          })
          .select()
          .single();

        if (error) throw error;
        return created;
      }

      return null;
    },
    enabled: !!user,
  });

  // Obtener estadísticas
  const { data: stats } = useQuery({
    queryKey: ["b2b-referral-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: referrals } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id);

      const { data: rewards } = await supabase
        .from("referral_rewards")
        .select("*")
        .eq("user_id", user.id);

      const totalReferrals = referrals?.length || 0;
      const completedReferrals = referrals?.filter(r => r.status === "completed").length || 0;
      const pendingReferrals = referrals?.filter(r => r.status === "pending").length || 0;
      const totalEarned = rewards?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      const availableRewards = rewards?.filter(r => r.status === "pending").reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      
      // Calcular comisión estimada mensual (asumiendo conversión del 30%)
      const estimatedMonthlyCommission = (completedReferrals * 50 * 0.3).toFixed(2);

      return {
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        totalEarned,
        availableRewards,
        estimatedMonthlyCommission,
      };
    },
    enabled: !!user,
  });

  // Obtener lista de referidos
  const { data: referrals } = useQuery({
    queryKey: ["b2b-referrals-list", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const referralsWithProfiles = await Promise.all(
        (data || []).map(async (referral) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", referral.referred_id)
            .single();
          
          return { ...referral, profile };
        })
      );

      return referralsWithProfiles;
    },
    enabled: !!user,
  });

  const copyReferralLink = () => {
    if (!referralCode) return;
    
    const link = `${window.location.origin}/auth?ref=${referralCode.code}&type=b2b`;
    navigator.clipboard.writeText(link);
    
    setCopied(true);
    toast({
      title: "¡Enlace copiado!",
      description: "Comparte este enlace con empresas asociadas",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { label: "Pendiente", variant: "secondary" },
      completed: { label: "Activo", variant: "default" },
    };
    
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout title="Programa de Aliados B2B">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Programa de Aliados Comerciales</h1>
          <p className="text-muted-foreground">
            Refiere empresas y gana comisiones recurrentes por sus envíos
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Empresas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-success" />
                <div className="text-2xl font-bold">{stats?.completedReferrals || 0}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                En Proceso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                <div className="text-2xl font-bold">{stats?.pendingReferrals || 0}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Ganado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-success" />
                <div className="text-2xl font-bold">S/ {stats?.totalEarned.toFixed(2) || "0.00"}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Disponible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                <div className="text-2xl font-bold">S/ {stats?.availableRewards.toFixed(2) || "0.00"}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Comisión Estimada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div className="text-2xl font-bold">S/ {stats?.estimatedMonthlyCommission || "0.00"}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">mensual</p>
            </CardContent>
          </Card>
        </div>

        {/* Código de referido B2B */}
        <Card>
          <CardHeader>
            <CardTitle>Tu Enlace de Aliado B2B</CardTitle>
            <CardDescription>
              Comparte este enlace con empresas. Ganarás comisiones recurrentes por todos sus envíos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingCode ? (
              <div className="h-10 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    value={referralCode ? `${window.location.origin}/auth?ref=${referralCode.code}&type=b2b` : ""}
                    readOnly
                    className="font-mono"
                  />
                  <Button onClick={copyReferralLink} className="gap-2">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "¡Copiado!" : "Copiar"}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <h4 className="font-semibold mb-2 text-primary">Beneficios para la Empresa Referida</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Tarifas preferenciales B2B</li>
                      <li>• Dashboard exclusivo</li>
                      <li>• Carga masiva de paquetes</li>
                      <li>• Reportes detallados</li>
                      <li>• Soporte prioritario</li>
                    </ul>
                  </div>

                  <div className="bg-success/5 p-4 rounded-lg border border-success/20">
                    <h4 className="font-semibold mb-2 text-success">Tus Beneficios como Aliado</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• 5% de comisión por cada envío</li>
                      <li>• Pagos mensuales automáticos</li>
                      <li>• Sin límite de referidos</li>
                      <li>• Panel de seguimiento en tiempo real</li>
                      <li>• Bonos por volumen</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Lista de empresas referidas */}
        <Card>
          <CardHeader>
            <CardTitle>Empresas Referidas</CardTitle>
          </CardHeader>
          <CardContent>
            {referrals?.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aún no has referido empresas</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Comparte tu enlace B2B para comenzar a ganar comisiones
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Comisiones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals?.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell className="font-semibold">
                        {referral.profile?.full_name || "Empresa"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {referral.profile?.email || "N/A"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(referral.created_at), "PP", { locale: es })}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(referral.status)}
                      </TableCell>
                      <TableCell className="font-bold text-primary">
                        S/ 0.00
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
