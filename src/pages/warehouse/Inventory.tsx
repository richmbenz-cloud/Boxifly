import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Package, AlertTriangle, BarChart3, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InventoryStats {
  total: number;
  capacity: number;
  utilizationPercent: number;
  oldestPackageDate: string | null;
  averageDaysInWarehouse: number;
}

const WarehouseInventory = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<InventoryStats>({
    total: 0,
    capacity: 1000, // Capacidad máxima del warehouse
    utilizationPercent: 0,
    oldestPackageDate: null,
    averageDaysInWarehouse: 0,
  });
  
  const [packagesInWarehouse, setPackagesInWarehouse] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    // Fetch packages currently in warehouse
    const { data: packages, error } = await supabase
      .from('packages')
      .select('*')
      .in('current_status', ['received_warehouse', 'ready_consolidation', 'consolidated'])
      .order('created_at', { ascending: true });

    if (!error && packages) {
      setPackagesInWarehouse(packages);
      
      const total = packages.length;
      const capacity = 1000;
      const utilization = (total / capacity) * 100;
      
      // Calculate average days in warehouse
      const now = new Date();
      const totalDays = packages.reduce((sum, pkg) => {
        const createdDate = new Date(pkg.created_at);
        const daysInWarehouse = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + daysInWarehouse;
      }, 0);
      
      const avgDays = packages.length > 0 ? totalDays / packages.length : 0;
      
      // Find oldest package
      const oldest = packages[0]?.created_at || null;

      setStats({
        total,
        capacity,
        utilizationPercent: utilization,
        oldestPackageDate: oldest,
        averageDaysInWarehouse: avgDays,
      });

      // Generate alerts
      const newAlerts: string[] = [];
      if (utilization > 80) {
        newAlerts.push('⚠️ Capacidad del warehouse superior al 80%');
      }
      if (avgDays > 7) {
        newAlerts.push('⚠️ Tiempo promedio en warehouse superior a 7 días');
      }
      if (oldest) {
        const oldestDate = new Date(oldest);
        const daysOld = Math.floor((now.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysOld > 14) {
          newAlerts.push(`⚠️ Paquete más antiguo: ${daysOld} días en warehouse`);
        }
      }
      
      setAlerts(newAlerts);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      received_warehouse: { label: 'Recibido', className: 'bg-status-processing text-white' },
      ready_consolidation: { label: 'Listo', className: 'bg-success text-white' },
      consolidated: { label: 'Consolidado', className: 'bg-status-info text-white' },
    };

    const config = statusMap[status] || { label: status, className: 'bg-muted' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout title="Gestión de Inventario">
      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardDescription>Paquetes en Warehouse</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <Package className="h-8 w-8 text-primary opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="pb-3">
            <CardDescription>Capacidad</CardDescription>
            <CardTitle className="text-3xl font-bold text-secondary">{stats.capacity}</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart3 className="h-8 w-8 text-secondary opacity-50" />
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${stats.utilizationPercent > 80 ? 'border-l-status-error' : 'border-l-success'}`}>
          <CardHeader className="pb-3">
            <CardDescription>Utilización</CardDescription>
            <CardTitle className={`text-3xl font-bold ${stats.utilizationPercent > 80 ? 'text-status-error' : 'text-success'}`}>
              {stats.utilizationPercent.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertTriangle className={`h-8 w-8 ${stats.utilizationPercent > 80 ? 'text-status-error' : 'text-success'} opacity-50`} />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-warning">
          <CardHeader className="pb-3">
            <CardDescription>Promedio en Warehouse</CardDescription>
            <CardTitle className="text-3xl font-bold text-status-warning">
              {stats.averageDaysInWarehouse.toFixed(1)} días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar className="h-8 w-8 text-status-warning opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="mb-8 border-status-warning bg-status-warning/10">
          <CardHeader>
            <CardTitle className="text-status-warning flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {alerts.map((alert, idx) => (
                <li key={idx} className="text-sm">{alert}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Packages in Warehouse */}
      <Card>
        <CardHeader>
          <CardTitle>Paquetes en Warehouse</CardTitle>
          <CardDescription>
            {stats.total} paquetes actualmente en el warehouse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Tracking</th>
                  <th className="text-left p-3">Tienda</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3">Días en Warehouse</th>
                  <th className="text-left p-3">Peso</th>
                </tr>
              </thead>
              <tbody>
                {packagesInWarehouse.map((pkg) => {
                  const createdDate = new Date(pkg.created_at);
                  const now = new Date();
                  const daysInWarehouse = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={pkg.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-mono text-sm">{pkg.tracking_number}</td>
                      <td className="p-3">{pkg.store_name}</td>
                      <td className="p-3">{getStatusBadge(pkg.current_status)}</td>
                      <td className="p-3">
                        <Badge variant={daysInWarehouse > 7 ? 'destructive' : 'secondary'}>
                          {daysInWarehouse} días
                        </Badge>
                      </td>
                      <td className="p-3">{pkg.actual_weight || pkg.estimated_weight || '-'} kg</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default WarehouseInventory;
