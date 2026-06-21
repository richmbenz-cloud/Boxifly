import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, Clock, CheckCircle, Truck, AlertCircle, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import ImportCounter from '@/components/ImportCounter';

interface PackageData {
  id: string;
  tracking_number: string;
  store_name: string;
  current_status: string;
  estimated_value: number;
  final_cost: number | null;
  created_at: string;
}

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    inTransit: 0,
    delivered: 0,
    pending: 0,
  });

  useEffect(() => {
    if (user) {
      fetchPackages();
    }
  }, [user]);

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPackages(data);
      
      // Calculate stats
      setStats({
        total: data.length,
        inTransit: data.filter(p => ['in_transit', 'ready_international'].includes(p.current_status)).length,
        delivered: data.filter(p => p.current_status === 'delivered').length,
        pending: data.filter(p => ['prealerted', 'received_warehouse'].includes(p.current_status)).length,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      prealerted: { label: 'Prealertado', className: 'bg-status-info text-white' },
      received_warehouse: { label: 'Recibido', className: 'bg-status-processing text-white' },
      in_transit: { label: 'En Tránsito', className: 'bg-status-transit text-white' },
      delivered: { label: 'Entregado', className: 'bg-status-delivered text-white' },
      ready_delivery: { label: 'Listo para entrega', className: 'bg-success text-white' },
    };

    const config = statusMap[status] || { label: status, className: 'bg-muted' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout title="Mi Panel">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardDescription>Total de Paquetes</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <Package className="h-8 w-8 text-primary opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-transit">
          <CardHeader className="pb-3">
            <CardDescription>En Tránsito</CardDescription>
            <CardTitle className="text-3xl font-bold text-status-transit">{stats.inTransit}</CardTitle>
          </CardHeader>
          <CardContent>
            <Truck className="h-8 w-8 text-status-transit opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-delivered">
          <CardHeader className="pb-3">
            <CardDescription>Entregados</CardDescription>
            <CardTitle className="text-3xl font-bold text-status-delivered">{stats.delivered}</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckCircle className="h-8 w-8 text-status-delivered opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-warning">
          <CardHeader className="pb-3">
            <CardDescription>Pendientes</CardDescription>
            <CardTitle className="text-3xl font-bold text-status-warning">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <Clock className="h-8 w-8 text-status-warning opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Contador de importaciones SUNAT (Pilar #4) */}
      <div className="mb-8">
        <ImportCounter packages={packages} />
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Button 
          className="bg-action-primary hover:bg-primary" 
          size="lg"
          onClick={() => navigate('/new-prealert')}
        >
          <Plus className="mr-2 h-5 w-5" />
          Nueva Prealerta
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => navigate('/cliente/shopping-requests')}
        >
          <Package className="mr-2 h-5 w-5" />
          Compras por Encargo
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => navigate('/cliente/loyalty-points')}
          className="border-primary/20 hover:bg-primary/10"
        >
          <Gift className="mr-2 h-5 w-5" />
          Mis Puntos
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => navigate('/cliente/disputes')}
        >
          <AlertCircle className="mr-2 h-5 w-5" />
          Mis Disputas
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => navigate('/cliente/referrals')}
        >
          <Package className="mr-2 h-5 w-5" />
          Programa de Referidos
        </Button>
      </div>

      {/* Packages List */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Paquetes</CardTitle>
          <CardDescription>Tracking de todos tus envíos</CardDescription>
        </CardHeader>
        <CardContent>
          {packages.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No tienes paquetes aún</p>
              <Button 
                className="bg-action-primary hover:bg-primary"
                onClick={() => navigate('/new-prealert')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear primera prealerta
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/package/${pkg.id}`)}
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
                      <p className="text-sm font-semibold mt-1 text-navy">
                        ${pkg.final_cost.toFixed(2)}
                      </p>
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

export default CustomerDashboard;
