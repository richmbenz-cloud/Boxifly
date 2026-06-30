import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, TrendingDown, DollarSign, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

const B2BDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    savings: 0,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchPackages();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();

    if (data) setProfile(data);
  };

  const fetchPackages = async () => {
    const { data } = await supabase
      .from('packages')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setPackages(data);
      
      // Calculate savings based on B2B discount
      const totalSavings = data.reduce((sum, pkg) => {
        if (pkg.final_cost && profile?.b2b_discount) {
          return sum + (pkg.final_cost * profile.b2b_discount / 100);
        }
        return sum;
      }, 0);

      setStats({
        total: data.length,
        savings: totalSavings,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      prealerted: { label: 'Prealertado', className: 'bg-status-info text-white' },
      in_transit: { label: 'En Tránsito', className: 'bg-status-transit text-white' },
      delivered: { label: 'Entregado', className: 'bg-status-delivered text-white' },
    };

    const config = statusMap[status] || { label: status, className: 'bg-muted' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout title="Panel B2B - Aliado Comercial">
      {/* B2B Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardDescription>Total Envíos B2B</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <Package className="h-8 w-8 text-primary opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardDescription>Ahorro Total</CardDescription>
            <CardTitle className="text-3xl font-bold text-success">${stats.savings.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <DollarSign className="h-8 w-8 text-success opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="pb-3">
            <CardDescription>Descuento B2B</CardDescription>
            <CardTitle className="text-3xl font-bold text-secondary">{profile?.b2b_discount || 0}%</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendingDown className="h-8 w-8 text-secondary opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mb-6 flex gap-4">
        <Button className="bg-action-primary hover:bg-primary" size="lg" onClick={() => navigate('/new-prealert')}>
          <Plus className="mr-2 h-5 w-5" />
          Nueva Prealerta B2B
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => navigate('/b2b/bulk-upload')}
        >
          <Package className="mr-2 h-5 w-5" />
          Carga Masiva
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => navigate('/b2b/referrals')}
        >
          <Package className="mr-2 h-5 w-5" />
          Programa de Aliados
        </Button>
      </div>

      {/* B2B Benefits */}
      <Card className="mb-6 border-secondary">
        <CardHeader>
          <CardTitle className="text-secondary">Beneficios de tu Plan B2B</CardTitle>
          <CardDescription>Ventajas exclusivas para aliados comerciales</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-secondary"></div>
              <span>Tarifas preferenciales del {profile?.b2b_discount || 0}% en todos los envíos</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-secondary"></div>
              <span>Prioridad en procesamiento de paquetes</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-secondary"></div>
              <span>Reportes mensuales detallados</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-secondary"></div>
              <span>Soporte dedicado 24/7</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Packages */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Envíos B2B</CardTitle>
          <CardDescription>Gestiona tus paquetes comerciales</CardDescription>
        </CardHeader>
        <CardContent>
          {packages.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No tienes envíos B2B aún</p>
              <Button className="bg-action-primary hover:bg-primary">
                <Plus className="mr-2 h-4 w-4" />
                Crear primer envío
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy">{pkg.tracking_number}</p>
                      <p className="text-sm text-muted-foreground">{pkg.store_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(pkg.current_status)}
                    {pkg.final_cost && (
                      <div className="mt-1">
                        <p className="text-sm line-through text-muted-foreground">
                          ${pkg.final_cost.toFixed(2)}
                        </p>
                        <p className="text-sm font-semibold text-success">
                          ${(pkg.final_cost * (1 - (profile?.b2b_discount || 0) / 100)).toFixed(2)}
                        </p>
                      </div>
                    )}
                    {pkg.current_status === 'ready_delivery' && pkg.final_cost && (
                      <Button
                        size="sm"
                        className="mt-2 bg-action-primary hover:bg-primary"
                        onClick={() => navigate(`/payment/${pkg.id}`)}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pagar
                      </Button>
                    )}
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

export default B2BDashboard;
