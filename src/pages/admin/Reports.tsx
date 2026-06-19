import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Download, TrendingUp, Package, DollarSign, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  packagesByStatus: Record<string, number>;
  packagesByMonth: Array<{ month: string; count: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  topCustomers: Array<{ name: string; packages: number; revenue: number }>;
  averageDeliveryTime: number;
  disputeRate: number;
}

const AdminReports = () => {
  const { toast } = useToast();
  const [reportData, setReportData] = useState<ReportData>({
    packagesByStatus: {},
    packagesByMonth: [],
    revenueByMonth: [],
    topCustomers: [],
    averageDeliveryTime: 0,
    disputeRate: 0,
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    // Fetch packages by status
    const { data: packages } = await supabase
      .from('packages')
      .select('current_status, created_at');

    const statusCounts: Record<string, number> = {};
    if (packages) {
      packages.forEach((pkg) => {
        statusCounts[pkg.current_status] = (statusCounts[pkg.current_status] || 0) + 1;
      });
    }

    // Fetch revenue data
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, created_at, user_id')
      .eq('payment_status', 'paid');

    let totalRevenue = 0;
    const revenueByMonth: Record<string, number> = {};
    const revenueByUser: Record<string, number> = {};

    if (payments) {
      payments.forEach((payment) => {
        totalRevenue += payment.amount;
        const month = new Date(payment.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'short' });
        revenueByMonth[month] = (revenueByMonth[month] || 0) + payment.amount;
        revenueByUser[payment.user_id] = (revenueByUser[payment.user_id] || 0) + payment.amount;
      });
    }

    // Fetch user data for top customers
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name');

    const topCustomers = profiles
      ?.map((profile) => ({
        name: profile.full_name,
        packages: packages?.filter((p: any) => p.user_id === profile.id).length || 0,
        revenue: revenueByUser[profile.id] || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5) || [];

    // Fetch dispute rate
    const { count: disputeCount } = await supabase
      .from('disputes')
      .select('*', { count: 'exact', head: true });

    const totalPackages = packages?.length || 1;
    const disputeRate = ((disputeCount || 0) / totalPackages) * 100;

    setReportData({
      packagesByStatus: statusCounts,
      packagesByMonth: Object.entries(revenueByMonth).map(([month, count]) => ({ month, count })),
      revenueByMonth: Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })),
      topCustomers,
      averageDeliveryTime: 0, // To be calculated based on package timeline
      disputeRate,
    });
  };

  const exportToCSV = () => {
    let csvContent = 'Reporte de Analítica Boxifly\n\n';
    
    csvContent += 'Paquetes por Estado\n';
    csvContent += 'Estado,Cantidad\n';
    Object.entries(reportData.packagesByStatus).forEach(([status, count]) => {
      csvContent += `${status},${count}\n`;
    });
    
    csvContent += '\nIngresos por Mes\n';
    csvContent += 'Mes,Ingresos\n';
    reportData.revenueByMonth.forEach(({ month, revenue }) => {
      csvContent += `${month},${revenue}\n`;
    });
    
    csvContent += '\nTop 5 Clientes\n';
    csvContent += 'Cliente,Paquetes,Ingresos\n';
    reportData.topCustomers.forEach(({ name, packages, revenue }) => {
      csvContent += `${name},${packages},${revenue}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_boxifly_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Reporte Exportado',
      description: 'El reporte ha sido exportado exitosamente',
    });
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      prealerted: 'Prealertado',
      received_warehouse: 'Recibido',
      ready_consolidation: 'Listo Consolidación',
      consolidated: 'Consolidado',
      in_transit: 'En Tránsito',
      arrived_peru: 'Llegó Perú',
      ready_delivery: 'Listo Entrega',
      delivered: 'Entregado',
    };
    return labels[status] || status;
  };

  return (
    <DashboardLayout title="Reportes y Analítica">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analítica del Sistema</h2>
          <p className="text-muted-foreground">
            Visualiza métricas clave y tendencias de tu operación
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardDescription>Total Paquetes</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">
              {Object.values(reportData.packagesByStatus).reduce((a, b) => a + b, 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Package className="h-8 w-8 text-primary opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardDescription>Ingresos Totales</CardDescription>
            <CardTitle className="text-3xl font-bold text-success">
              ${reportData.revenueByMonth.reduce((sum, m) => sum + m.revenue, 0).toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DollarSign className="h-8 w-8 text-success opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="pb-3">
            <CardDescription>Top Clientes</CardDescription>
            <CardTitle className="text-3xl font-bold text-secondary">
              {reportData.topCustomers.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Users className="h-8 w-8 text-secondary opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-warning">
          <CardHeader className="pb-3">
            <CardDescription>Tasa de Disputas</CardDescription>
            <CardTitle className="text-3xl font-bold text-status-warning">
              {reportData.disputeRate.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendingUp className="h-8 w-8 text-status-warning opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Packages by Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribución de Paquetes por Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(reportData.packagesByStatus).map(([status, count]) => {
              const total = Object.values(reportData.packagesByStatus).reduce((a, b) => a + b, 0);
              const percentage = (count / total) * 100;
              
              return (
                <div key={status} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{getStatusLabel(status)}</span>
                    <span className="text-sm text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Clientes</CardTitle>
          <CardDescription>Clientes con mayor volumen e ingresos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.topCustomers.map((customer, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.packages} paquetes</p>
                  </div>
                </div>
                <Badge className="bg-success text-white">
                  ${customer.revenue.toFixed(2)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminReports;
