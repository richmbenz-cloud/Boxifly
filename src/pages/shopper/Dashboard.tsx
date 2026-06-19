import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { KYCUpload } from '@/components/KYCUpload';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingCart, 
  DollarSign, 
  Package,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Star,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ShopperDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [stats, setStats] = useState({
    availableRequests: 0,
    activeRequests: 0,
    completedRequests: 0,
    totalEarnings: 0,
    pendingPayment: 0,
    averageCommission: 0,
    successRate: 0
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check verification status
      const { data: profile } = await supabase
        .from('profiles')
        .select('shopper_verified')
        .eq('id', user.id)
        .single();

      setIsVerified(profile?.shopper_verified || false);

      if (!profile?.shopper_verified) {
        setLoading(false);
        return;
      }

      // Get shopper's requests
      const { data: myRequests } = await supabase
        .from('shopping_requests')
        .select('*')
        .eq('shopper_id', user.id);

      // Get available requests count
      const { count: availableCount } = await supabase
        .from('shopping_requests')
        .select('*', { count: 'exact', head: true })
        .is('shopper_id', null)
        .eq('status', 'pending');

      // Calculate stats
      const activeRequests = myRequests?.filter(r => 
        ['in_purchase', 'purchased', 'shipped'].includes(r.status)
      ).length || 0;
      
      const completedRequests = myRequests?.filter(r => r.status === 'completed').length || 0;
      
      const totalEarnings = myRequests?.filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + Number(r.shopper_commission || 0), 0) || 0;
      
      const pendingPayment = myRequests?.filter(r => 
        r.status === 'completed' && r.payment_status === 'pending'
      ).reduce((sum, r) => sum + Number(r.shopper_commission || 0), 0) || 0;

      const averageCommission = completedRequests > 0 ? totalEarnings / completedRequests : 0;
      const totalRequests = myRequests?.length || 0;
      const successRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

      setStats({
        availableRequests: availableCount || 0,
        activeRequests,
        completedRequests,
        totalEarnings,
        pendingPayment,
        averageCommission,
        successRate
      });

      // Calculate monthly data for charts
      const monthlyStats = calculateMonthlyData(myRequests || []);
      setMonthlyData(monthlyStats);

      // Calculate status distribution
      const statusDist = calculateStatusDistribution(myRequests || []);
      setStatusDistribution(statusDist);

      // Get recent requests
      const { data: recent } = await supabase
        .from('shopping_requests')
        .select('*, profiles!shopping_requests_customer_id_fkey(full_name)')
        .eq('shopper_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentRequests(recent || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-status-warning',
      in_purchase: 'bg-status-processing',
      purchased: 'bg-status-info',
      shipped: 'bg-status-transit',
      completed: 'bg-status-delivered',
      cancelled: 'bg-status-error'
    };
    return colors[status] || 'bg-muted';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      in_purchase: 'En Compra',
      purchased: 'Comprado',
      shipped: 'Enviado',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const calculateMonthlyData = (requests: any[]) => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const monthlyStats = months.map((month, index) => {
      const monthRequests = requests.filter(r => {
        const date = new Date(r.created_at);
        return date.getMonth() === index;
      });
      
      return {
        month,
        solicitudes: monthRequests.length,
        completadas: monthRequests.filter(r => r.status === 'completed').length,
        comisiones: monthRequests
          .filter(r => r.status === 'completed')
          .reduce((sum, r) => sum + Number(r.shopper_commission || 0), 0)
      };
    });
    
    return monthlyStats;
  };

  const calculateStatusDistribution = (requests: any[]) => {
    const statusCount: Record<string, number> = {};
    requests.forEach(r => {
      statusCount[r.status] = (statusCount[r.status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([status, count]) => ({
      name: getStatusLabel(status),
      value: count
    }));
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--success))', 'hsl(var(--warning))'];

  if (loading) {
    return (
      <DashboardLayout title="Dashboard - Personal Shopper">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Show verification pending message and KYC upload
  if (isVerified === false) {
    return (
      <DashboardLayout title="Dashboard - Personal Shopper">
        <div className="space-y-6">
          <Alert className="bg-warning/10 border-warning">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning">
              Debes completar tu verificación KYC para comenzar a aceptar solicitudes de compra.
            </AlertDescription>
          </Alert>

          <KYCUpload userRole="shopper" />

          <Card>
            <CardHeader>
              <CardTitle>¿Qué sigue?</CardTitle>
              <CardDescription>
                Una vez que subas todos los documentos requeridos y sean aprobados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Podrás ver y aceptar solicitudes de compra</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Ganarás comisiones por cada compra completada</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Tendrás acceso al chat con clientes</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard - Personal Shopper">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary to-navy rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Bienvenido, Personal Shopper</h1>
          <p className="text-white/90">
            Gana comisiones comprando productos para clientes
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/shopper/available')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Solicitudes Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats.availableRequests}</p>
              <p className="text-xs text-muted-foreground mt-1">Listas para tomar</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4" />
                Compras Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">{stats.activeRequests}</p>
              <p className="text-xs text-muted-foreground mt-1">En proceso</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Compras Completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-success">{stats.completedRequests}</p>
              <p className="text-xs text-muted-foreground mt-1">Total histórico</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Comisiones Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-success">${stats.totalEarnings.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Acumulado</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pago Pendiente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">${stats.pendingPayment.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Por cobrar</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="pb-3">
            <CardDescription>Comisión Promedio</CardDescription>
            <CardTitle className="text-3xl font-bold text-accent">
              ${stats.averageCommission.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart3 className="h-8 w-8 text-accent opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardDescription>Tasa de Éxito</CardDescription>
            <CardTitle className="text-3xl font-bold text-success">
              {stats.successRate.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Star className="h-8 w-8 text-success opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Comisiones Mensuales</CardTitle>
            <CardDescription>Evolución de tus ganancias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="comisiones" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Comisiones ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solicitudes por Mes</CardTitle>
            <CardDescription>Completadas vs Total</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="solicitudes" fill="hsl(var(--primary))" name="Total" />
                <Bar dataKey="completadas" fill="hsl(var(--success))" name="Completadas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
            <CardDescription>Estado actual de tus solicitudes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendimiento Global</CardTitle>
            <CardDescription>Resumen de tu actividad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Total Solicitudes</span>
                <span className="text-2xl font-bold text-primary">
                  {stats.activeRequests + stats.completedRequests}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Tasa de Completado</span>
                <span className="text-2xl font-bold text-success">
                  {stats.successRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Ganancia Promedio</span>
                <span className="text-2xl font-bold text-accent">
                  ${stats.averageCommission.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Pendiente de Pago</span>
                <span className="text-2xl font-bold text-warning">
                  ${stats.pendingPayment.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Solicitudes Disponibles
              </CardTitle>
              <CardDescription>
                Encuentra solicitudes de compra de clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/shopper/available')}
                className="w-full"
              >
                Ver Solicitudes Disponibles
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                Mis Compras
              </CardTitle>
              <CardDescription>
                Gestiona tus compras activas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/shopper/my-requests')}
                variant="secondary"
                className="w-full"
              >
                Ver Mis Compras
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Solicitudes Recientes
            </CardTitle>
            <CardDescription>Tus últimas 5 compras</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Aún no tienes solicitudes asignadas</p>
                <Button 
                  onClick={() => navigate('/shopper/available')}
                  variant="outline"
                  className="mt-4"
                >
                  Ver Solicitudes Disponibles
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/shopper/request/${request.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{request.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Cliente: {request.profiles?.full_name || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Cantidad: {request.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                      <p className="font-semibold text-success">
                        ${Number(request.shopper_commission || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ShopperDashboard;
