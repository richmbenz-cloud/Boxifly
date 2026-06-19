import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Gift, Users, DollarSign, Check, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Referrals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  // Obtener o crear código de referido
  const { data: referralCode, isLoading: loadingCode } = useQuery({
    queryKey: ["referral-code", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Buscar código existente
      const { data: existing } = await supabase
        .from("referral_codes")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (existing) return existing;

      // Generar nuevo código
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

  // Obtener estadísticas de referidos
  const { data: stats } = useQuery({
    queryKey: ["referral-stats", user?.id],
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

      return {
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        totalEarned,
        availableRewards,
      };
    },
    enabled: !!user,
  });

  // Obtener lista de referidos
  const { data: referrals } = useQuery({
    queryKey: ["referrals-list", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Obtener perfiles de los referidos
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

  // Obtener recompensas
  const { data: rewards } = useQuery({
    queryKey: ["referral-rewards", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("referral_rewards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const copyReferralLink = () => {
    if (!referralCode) return;
    
    const link = `${window.location.origin}/auth?ref=${referralCode.code}`;
    navigator.clipboard.writeText(link);
    
    setCopied(true);
    toast({
      title: "¡Enlace copiado!",
      description: "Comparte este enlace con tus amigos",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { label: "Pendiente", variant: "secondary" },
      completed: { label: "Completado", variant: "default" },
    };
    
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRewardStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { label: "Disponible", variant: "default" },
      claimed: { label: "Usado", variant: "secondary" },
      expired: { label: "Expirado", variant: "destructive" },
    };
    
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout title="Programa de Referidos">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Programa de Referidos</h1>
          <p className="text-muted-foreground">
            Invita amigos y gana recompensas por cada envío que realicen
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Referidos
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
                Completados
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
                Pendientes
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
        </div>

        {/* Código de referido */}
        <Card>
          <CardHeader>
            <CardTitle>Tu Código de Referido</CardTitle>
            <CardDescription>
              Comparte este enlace con tus amigos. Recibirás S/ 20 por cada amigo que complete su primer envío.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingCode ? (
              <div className="h-10 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    value={referralCode ? `${window.location.origin}/auth?ref=${referralCode.code}` : ""}
                    readOnly
                    className="font-mono"
                  />
                  <Button onClick={copyReferralLink} className="gap-2">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "¡Copiado!" : "Copiar"}
                  </Button>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">¿Cómo funciona?</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Comparte tu enlace único con amigos y familiares</li>
                    <li>• Cuando se registren usando tu enlace, recibirán S/ 10 de descuento</li>
                    <li>• Cuando completen su primer envío, recibirás S/ 20 de descuento</li>
                    <li>• Tus descuentos son válidos por 90 días</li>
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Lista de referidos */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Referidos</CardTitle>
          </CardHeader>
          <CardContent>
            {referrals?.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aún no has referido a nadie</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Comparte tu enlace para comenzar a ganar recompensas
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals?.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell className="font-semibold">
                        {referral.profile?.full_name || "Usuario"}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recompensas */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Recompensas</CardTitle>
          </CardHeader>
          <CardContent>
            {rewards?.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tienes recompensas aún</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Expira</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards?.map((reward) => (
                    <TableRow key={reward.id}>
                      <TableCell className="font-semibold">
                        {reward.reward_type === "discount" ? "Descuento" : "Crédito"}
                      </TableCell>
                      <TableCell className="font-bold text-primary">
                        S/ {Number(reward.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getRewardStatusBadge(reward.status)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {reward.expires_at
                          ? format(new Date(reward.expires_at), "PP", { locale: es })
                          : "Sin expiración"}
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
