import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Mail, Phone, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ShopperProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  shopper_verified: boolean;
  shopper_verified_at: string | null;
  shopper_verified_by: string | null;
  created_at: string;
  verified_by_name?: string;
}

const ShopperVerification = () => {
  const { toast } = useToast();
  const [shoppers, setShoppers] = useState<ShopperProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'verified' | 'all'>('pending');

  useEffect(() => {
    loadShoppers();
  }, [filter]);

  const loadShoppers = async () => {
    try {
      setLoading(true);
      
      // Get all users with shopper role
      const { data: shopperRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'shopper');

      if (!shopperRoles || shopperRoles.length === 0) {
        setShoppers([]);
        return;
      }

      const shopperIds = shopperRoles.map(r => r.user_id);

      // Get profiles for shoppers
      let query = supabase
        .from('profiles')
        .select('*')
        .in('id', shopperIds);

      if (filter === 'pending') {
        query = query.eq('shopper_verified', false);
      } else if (filter === 'verified') {
        query = query.eq('shopper_verified', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch verifier names for verified shoppers
      const withVerifierNames = await Promise.all((data || []).map(async (shopper) => {
        if (shopper.shopper_verified_by) {
          const { data: verifier } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', shopper.shopper_verified_by)
            .single();
          
          return { ...shopper, verified_by_name: verifier?.full_name };
        }
        return shopper;
      }));
      
      setShoppers(withVerifierNames || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los shoppers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyShoppper = async (shopperId: string, verified: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updateData: any = {
        shopper_verified: verified,
        shopper_verified_at: verified ? new Date().toISOString() : null,
        shopper_verified_by: verified ? user.id : null
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', shopperId);

      if (error) throw error;

      toast({
        title: verified ? "Shopper Verificado" : "Verificación Revocada",
        description: verified 
          ? "El shopper ahora puede aceptar solicitudes de compra"
          : "El shopper ya no puede aceptar solicitudes",
      });

      loadShoppers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStats = () => {
    const pending = shoppers.filter(s => !s.shopper_verified).length;
    const verified = shoppers.filter(s => s.shopper_verified).length;
    return { pending, verified, total: shoppers.length };
  };

  const stats = getStats();

  if (loading) {
    return (
      <DashboardLayout title="Verificación de Shoppers">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Verificación de Shoppers">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-3">
            <CardDescription>Pendientes</CardDescription>
            <CardTitle className="text-3xl font-bold text-warning">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <Clock className="h-8 w-8 text-warning opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardDescription>Verificados</CardDescription>
            <CardTitle className="text-3xl font-bold text-success">{stats.verified}</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckCircle className="h-8 w-8 text-success opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardDescription>Total Shoppers</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <User className="h-8 w-8 text-primary opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pendientes ({stats.pending})
        </Button>
        <Button
          variant={filter === 'verified' ? 'default' : 'outline'}
          onClick={() => setFilter('verified')}
        >
          Verificados ({stats.verified})
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Todos ({stats.total})
        </Button>
      </div>

      {/* Shoppers List */}
      <Card>
        <CardHeader>
          <CardTitle>Shoppers</CardTitle>
          <CardDescription>
            Gestiona la verificación de personal shoppers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shoppers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {filter === 'pending' 
                  ? 'No hay shoppers pendientes de verificación'
                  : filter === 'verified'
                  ? 'No hay shoppers verificados'
                  : 'No hay shoppers registrados'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {shoppers.map((shopper) => (
                <div
                  key={shopper.id}
                  className="p-6 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{shopper.full_name}</h3>
                        {shopper.shopper_verified ? (
                          <Badge className="bg-success text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        ) : (
                          <Badge className="bg-warning text-white">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendiente
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{shopper.email}</span>
                        </div>
                        {shopper.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{shopper.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Registrado hace{' '}
                        {formatDistanceToNow(new Date(shopper.created_at), {
                          locale: es,
                          addSuffix: false
                        })}
                      </div>

                      {shopper.shopper_verified && shopper.shopper_verified_at && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Verificado hace{' '}
                          {formatDistanceToNow(new Date(shopper.shopper_verified_at), {
                            locale: es,
                            addSuffix: false
                          })}
                          {shopper.verified_by_name && ` por ${shopper.verified_by_name}`}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {!shopper.shopper_verified ? (
                        <Button
                          onClick={() => verifyShoppper(shopper.id, true)}
                          className="bg-success hover:bg-success/90"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verificar
                        </Button>
                      ) : (
                        <Button
                          onClick={() => verifyShoppper(shopper.id, false)}
                          variant="destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Revocar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ShopperVerification;
