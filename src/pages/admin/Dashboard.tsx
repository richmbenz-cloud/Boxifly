import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Users, DollarSign, TrendingUp, Settings, TrendingDown, History, MessageSquare, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPackages: 0,
    totalUsers: 0,
    revenue: 0,
    activePackages: 0,
  });

  const [recentPackages, setRecentPackages] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentPackages();
  }, []);

  const fetchStats = async () => {
    // Fetch total packages
    const { count: packagesCount } = await supabase
      .from('packages')
      .select('*', { count: 'exact', head: true });

    // Fetch total users
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Fetch revenue (sum of paid packages)
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('amount')
      .eq('payment_status', 'paid');

    const totalRevenue = paymentsData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // Fetch active packages
    const { count: activeCount } = await supabase
      .from('packages')
      .select('*', { count: 'exact', head: true })
      .neq('current_status', 'delivered');

    setStats({
      totalPackages: packagesCount || 0,
      totalUsers: usersCount || 0,
      revenue: totalRevenue,
      activePackages: activeCount || 0,
    });
  };

  const fetchRecentPackages = async () => {
    const { data } = await supabase
      .from('packages')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(10);

    setRecentPackages(data || []);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      prealerted: { label: 'Prealertado', className: 'bg-status-info text-white' },
      received_warehouse: { label: 'Recibido', className: 'bg-status-processing text-white' },
      in_transit: { label: 'En Tránsito', className: 'bg-status-transit text-white' },
      delivered: { label: 'Entregado', className: 'bg-status-delivered text-white' },
    };

    const config = statusMap[status] || { label: status, className: 'bg-muted' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout title="Panel de Administración">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardDescription>Total Paquetes</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{stats.totalPackages}</CardTitle>
          </CardHeader>
          <CardContent>
            <Package className="h-8 w-8 text-primary opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="pb-3">
            <CardDescription>Total Usuarios</CardDescription>
            <CardTitle className="text-3xl font-bold text-secondary">{stats.totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <Users className="h-8 w-8 text-secondary opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardDescription>Ingresos Totales</CardDescription>
            <CardTitle className="text-3xl font-bold text-success">${stats.revenue.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <DollarSign className="h-8 w-8 text-success opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-warning">
          <CardHeader className="pb-3">
            <CardDescription>Paquetes Activos</CardDescription>
            <CardTitle className="text-3xl font-bold text-status-warning">{stats.activePackages}</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendingUp className="h-8 w-8 text-status-warning opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Button 
          className="h-24 bg-action-primary hover:bg-primary" 
          size="lg"
          onClick={() => window.location.href = '/admin/users'}
        >
          <Users className="mr-3 h-6 w-6" />
          Gestionar Usuarios
        </Button>
        <Button 
          className="h-24 bg-action-primary hover:bg-primary" 
          size="lg"
          onClick={() => window.location.href = '/admin/b2b-rates'}
        >
          <TrendingDown className="mr-3 h-6 w-6" />
          Tarifas B2B
        </Button>
        <Button 
          className="h-24 bg-primary hover:bg-secondary" 
          size="lg"
          onClick={() => window.location.href = '/admin/packages'}
        >
          <History className="mr-3 h-6 w-6" />
          Historial de Paquetes
        </Button>
        <Button 
          className="h-24 bg-navy hover:bg-navy/90" 
          size="lg"
          onClick={() => window.location.href = '/admin/tariffs'}
        >
          <DollarSign className="mr-3 h-6 w-6" />
          Gestionar Tarifas
        </Button>
      </div>

      {/* Additional Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Button 
          className="h-20 bg-success hover:bg-success/90" 
          size="lg"
          onClick={() => window.location.href = '/admin/whatsapp'}
        >
          <MessageSquare className="mr-3 h-6 w-6" />
          Simulador WhatsApp
        </Button>
        <Button 
          className="h-20 bg-secondary hover:bg-secondary/90" 
          size="lg"
          onClick={() => window.location.href = '/admin/packages'}
        >
          <History className="mr-3 h-6 w-6" />
          Historial Completo
        </Button>
        <Button 
          className="h-20 bg-destructive hover:bg-destructive/90" 
          size="lg"
          onClick={() => window.location.href = '/admin/disputes'}
        >
          <AlertTriangle className="mr-3 h-6 w-6" />
          Gestión de Disputas
        </Button>
      </div>

      {/* New Admin Tools */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Button 
          className="h-20 bg-primary hover:bg-primary/90" 
          size="lg"
          onClick={() => window.location.href = '/admin/reports'}
        >
          <TrendingUp className="mr-3 h-6 w-6" />
          Reportes y Analítica
        </Button>
        <Button 
          className="h-20 bg-secondary hover:bg-secondary/90" 
          size="lg"
          onClick={() => window.location.href = '/admin/audit-logs'}
        >
          <History className="mr-3 h-6 w-6" />
          Auditoría y Logs
        </Button>
        <Button 
          className="h-20 bg-accent hover:bg-accent/90" 
          size="lg"
          onClick={() => window.location.href = '/admin/shopper-verification'}
        >
          <Users className="mr-3 h-6 w-6" />
          Verificación Shoppers
        </Button>
        <Button 
          className="h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white" 
          size="lg"
          onClick={() => window.location.href = '/izipay-test'}
        >
          <DollarSign className="mr-3 h-6 w-6" />
          Prueba Izipay
        </Button>
      </div>

      {/* Recent Packages */}
      <Card>
        <CardHeader>
          <CardTitle>Paquetes Recientes</CardTitle>
          <CardDescription>Últimos 10 paquetes registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPackages.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No hay paquetes aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPackages.map((pkg) => (
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
                      <p className="text-sm text-muted-foreground">
                        {pkg.profiles?.full_name || 'Usuario'} • {pkg.store_name}
                      </p>
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

export default AdminDashboard;
