import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, CheckCircle, AlertCircle, Archive, History, Plane } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface PackageData {
  id: string;
  tracking_number: string;
  store_name: string;
  current_status: string;
  estimated_weight: number;
  actual_weight: number | null;
  created_at: string;
}

const WarehouseDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    ready: 0,
  });
  
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);
  const [actualWeight, setActualWeight] = useState('');
  const [dimensions, setDimensions] = useState('');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .in('current_status', ['prealerted', 'received_warehouse', 'ready_consolidation'])
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPackages(data);
      
      setStats({
        pending: data.filter(p => p.current_status === 'prealerted').length,
        processing: data.filter(p => p.current_status === 'received_warehouse').length,
        ready: data.filter(p => p.current_status === 'ready_consolidation').length,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      prealerted: { label: 'Prealertado', className: 'bg-status-info text-white' },
      received_warehouse: { label: 'Procesando', className: 'bg-status-processing text-white' },
      ready_consolidation: { label: 'Listo', className: 'bg-success text-white' },
    };

    const config = statusMap[status] || { label: status, className: 'bg-muted' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleReceivePackage = (pkg: PackageData) => {
    setSelectedPackage(pkg);
    setActualWeight(pkg.estimated_weight?.toString() || '');
    setDimensions('');
    setReceiveDialogOpen(true);
  };

  const confirmReceive = async () => {
    if (!selectedPackage || !actualWeight) {
      toast({
        title: "Error",
        description: "Debes ingresar el peso real del paquete",
        variant: "destructive"
      });
      return;
    }

    try {
      // Importar calculadora de tarifas
      const { updatePackageCosts } = await import('@/lib/tariffCalculator');

      // Calcular costos automáticamente
      const result = await updatePackageCosts(
        selectedPackage.id,
        parseFloat(actualWeight),
        dimensions || null,
        0, // estimated_value se obtiene del paquete existente
        'pickup'
      );

      if (!result.success) {
        toast({
          title: "Advertencia",
          description: result.error || "No se pudo calcular la tarifa automáticamente",
          variant: "destructive"
        });
      }

      // Actualizar estado a recibido
      const { error } = await supabase
        .from('packages')
        .update({
          current_status: 'received_warehouse',
        })
        .eq('id', selectedPackage.id);

      if (error) throw error;

      toast({
        title: "Paquete Recibido",
        description: result.calculation 
          ? `${selectedPackage.tracking_number} - Costo calculado: $${result.calculation.final_cost.toFixed(2)}`
          : `${selectedPackage.tracking_number} marcado como recibido`
      });

      setReceiveDialogOpen(false);
      setSelectedPackage(null);
      setActualWeight('');
      setDimensions('');
      fetchPackages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleProcess = async (pkg: PackageData) => {
    // Verifica que el paquete tenga costo calculado; si no, abre el diálogo de
    // recepción para pesar y calcular el costo antes de avanzar.
    const { data: full, error: fetchError } = await supabase
      .from('packages')
      .select('final_cost')
      .eq('id', pkg.id)
      .single();

    if (fetchError) {
      toast({ title: 'Error', description: fetchError.message, variant: 'destructive' });
      return;
    }

    if (!full?.final_cost || full.final_cost <= 0) {
      toast({
        title: 'Falta calcular el costo',
        description: 'Ingresa el peso real para calcular el costo antes de procesar.',
      });
      handleReceivePackage(pkg);
      return;
    }

    // Avanza el paquete a "Listo para Entrega" → habilita el pago del cliente.
    const { error } = await supabase
      .from('packages')
      .update({ current_status: 'ready_delivery' })
      .eq('id', pkg.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({
      title: 'Paquete procesado',
      description: `${pkg.tracking_number} está listo para entrega y disponible para pago.`,
    });
    fetchPackages();
  };

  return (
    <DashboardLayout title="Warehouse Panel">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-status-warning">
          <CardHeader className="pb-3">
            <CardDescription>Pendientes de Recibir</CardDescription>
            <CardTitle className="text-3xl font-bold text-status-warning">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertCircle className="h-8 w-8 text-status-warning opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-processing">
          <CardHeader className="pb-3">
            <CardDescription>En Procesamiento</CardDescription>
            <CardTitle className="text-3xl font-bold text-status-processing">{stats.processing}</CardTitle>
          </CardHeader>
          <CardContent>
            <Package className="h-8 w-8 text-status-processing opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardDescription>Listos para Consolidar</CardDescription>
            <CardTitle className="text-3xl font-bold text-success">{stats.ready}</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckCircle className="h-8 w-8 text-success opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex gap-4">
        <Button 
          className="bg-action-primary hover:bg-primary" 
          size="lg"
          onClick={() => {
            const prealertedPackage = packages.find(p => p.current_status === 'prealerted');
            if (prealertedPackage) {
              handleReceivePackage(prealertedPackage);
            } else {
              toast({
                title: "Sin paquetes",
                description: "No hay paquetes prealertados pendientes",
              });
            }
          }}
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          Confirmar Llegada
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => navigate('/warehouse/consolidation')}
        >
          <Archive className="mr-2 h-5 w-5" />
          Consolidar Paquetes
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => navigate('/warehouse/international-tracking')}
        >
          <Plane className="mr-2 h-5 w-5" />
          Tracking Internacional
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => navigate('/warehouse/packages')}
        >
          <History className="mr-2 h-5 w-5" />
          Historial Completo
        </Button>
      </div>

      {/* New Operations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card
          onClick={() => navigate('/warehouse/inventory')}
          className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-primary"
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Gestión de Inventario</h3>
                <p className="text-sm text-muted-foreground">Capacidad y alertas del warehouse</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => navigate('/warehouse/incidents')}
          className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-status-error"
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-status-error" />
              <div>
                <h3 className="font-semibold">Registro de Incidencias</h3>
                <p className="text-sm text-muted-foreground">Daños, faltantes y retrasos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => navigate('/warehouse/consolidation')}
          className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-secondary"
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Archive className="h-8 w-8 text-secondary" />
              <div>
                <h3 className="font-semibold">Consolidación Avanzada</h3>
                <p className="text-sm text-muted-foreground">Agrupar múltiples paquetes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packages to Process */}
      <Card>
        <CardHeader>
          <CardTitle>Paquetes en Warehouse</CardTitle>
          <CardDescription>Gestiona los paquetes recibidos</CardDescription>
        </CardHeader>
        <CardContent>
          {packages.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No hay paquetes pendientes</p>
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
                      <p className="text-xs text-muted-foreground mt-1">
                        Peso Est: {pkg.estimated_weight}kg
                        {pkg.actual_weight && ` | Real: ${pkg.actual_weight}kg`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(pkg.current_status)}
                    <Button 
                      size="sm" 
                      className="bg-action-primary hover:bg-primary"
                      onClick={() =>
                        pkg.current_status === 'prealerted'
                          ? handleReceivePackage(pkg)
                          : handleProcess(pkg)
                      }
                      disabled={
                        pkg.current_status !== 'prealerted' &&
                        pkg.current_status !== 'received_warehouse'
                      }
                    >
                      {pkg.current_status === 'prealerted'
                        ? 'Recibir'
                        : pkg.current_status === 'received_warehouse'
                        ? 'Procesar'
                        : 'Listo'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receive Package Dialog */}
      <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Recepción de Paquete</DialogTitle>
          </DialogHeader>
          
          {selectedPackage && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-semibold">{selectedPackage.tracking_number}</p>
                <p className="text-sm text-muted-foreground">{selectedPackage.store_name}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualWeight">Peso Real (kg) *</Label>
                <Input
                  id="actualWeight"
                  type="number"
                  step="0.01"
                  value={actualWeight}
                  onChange={(e) => setActualWeight(e.target.value)}
                  placeholder="Ej: 2.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensiones (LxWxH en cm)</Label>
                <Input
                  id="dimensions"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="Ej: 30x20x15"
                />
                <p className="text-xs text-muted-foreground">
                  Opcional - Se calculará el peso volumétrico automáticamente
                </p>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
                <p className="text-blue-900 dark:text-blue-100">
                  💡 Los costos se calcularán automáticamente al confirmar
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-action-primary hover:bg-primary"
              onClick={confirmReceive}
            >
              Confirmar Recepción
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WarehouseDashboard;
