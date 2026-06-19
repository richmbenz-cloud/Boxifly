import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Package, Plane, Search, Upload, CheckCircle2, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PackageData {
  id: string;
  tracking_number: string;
  store_name: string;
  current_status: string;
  international_tracking: string | null;
  user_id: string;
  created_at: string;
}

const InternationalTracking = () => {
  const { toast } = useToast();
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<PackageData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);
  const [internationalTracking, setInternationalTracking] = useState('');
  const [carrier, setCarrier] = useState<string>('auto');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredPackages(
        packages.filter(pkg =>
          pkg.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.store_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredPackages(packages);
    }
  }, [searchTerm, packages]);

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .in('current_status', ['consolidated', 'ready_international', 'in_transit', 'arrived_peru'])
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPackages(data);
      setFilteredPackages(data);
    }
  };

  const handleOpenDialog = (pkg: PackageData) => {
    setSelectedPackage(pkg);
    setInternationalTracking(pkg.international_tracking || '');
    setCarrier('auto');
    setDialogOpen(true);
  };

  const handleSyncWithAfterShip = async () => {
    if (!selectedPackage || !internationalTracking.trim()) {
      toast({
        title: "Error",
        description: "Debes ingresar un número de tracking internacional",
        variant: "destructive"
      });
      return;
    }

    setSyncing(true);

    try {
      const { data, error } = await supabase.functions.invoke('aftership-tracking', {
        body: {
          packageId: selectedPackage.id,
          trackingNumber: internationalTracking.trim(),
          carrier: carrier !== 'auto' ? carrier : undefined,
        }
      });

      if (error) throw error;

      toast({
        title: "Sincronización Exitosa",
        description: `Se han registrado ${data.tracking?.events || 0} eventos de tracking desde Aftership`,
      });

      setDialogOpen(false);
      fetchPackages();
    } catch (error: any) {
      toast({
        title: "Error al Sincronizar",
        description: error.message || "No se pudo conectar con Aftership",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleUploadTracking = async () => {
    if (!selectedPackage || !internationalTracking.trim()) {
      toast({
        title: "Error",
        description: "Debes ingresar un número de tracking internacional",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Actualizar tracking internacional
      const { error: updateError } = await supabase
        .from('packages')
        .update({
          international_tracking: internationalTracking.trim(),
          current_status: 'in_transit',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPackage.id);

      if (updateError) throw updateError;

      // Crear notificación para el cliente
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedPackage.user_id,
          package_id: selectedPackage.id,
          title: 'Tracking Internacional Disponible',
          message: `Tu paquete ${selectedPackage.tracking_number} ya tiene tracking internacional: ${internationalTracking.trim()}. Está en tránsito a Perú.`,
          is_read: false
        });

      toast({
        title: "Tracking Actualizado",
        description: "El tracking internacional ha sido registrado exitosamente",
      });

      setDialogOpen(false);
      fetchPackages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      consolidated: { label: 'Consolidado', className: 'bg-status-processing text-white' },
      ready_international: { label: 'Listo Internacional', className: 'bg-status-info text-white' },
      in_transit: { label: 'En Tránsito', className: 'bg-status-transit text-white' },
      arrived_peru: { label: 'Llegó a Perú', className: 'bg-success text-white' },
    };

    const config = statusMap[status] || { label: status, className: 'bg-muted' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const stats = {
    total: packages.length,
    pending: packages.filter(p => !p.international_tracking).length,
    inTransit: packages.filter(p => p.current_status === 'in_transit').length,
    arrived: packages.filter(p => p.current_status === 'arrived_peru').length,
  };

  return (
    <DashboardLayout title="Tracking Internacional">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardDescription>Total Paquetes</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <Package className="h-8 w-8 text-primary opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-warning">
          <CardHeader className="pb-3">
            <CardDescription>Sin Tracking</CardDescription>
            <CardTitle className="text-3xl font-bold text-status-warning">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <Upload className="h-8 w-8 text-status-warning opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-transit">
          <CardHeader className="pb-3">
            <CardDescription>En Tránsito</CardDescription>
            <CardTitle className="text-3xl font-bold text-status-transit">{stats.inTransit}</CardTitle>
          </CardHeader>
          <CardContent>
            <Plane className="h-8 w-8 text-status-transit opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardDescription>Llegados a Perú</CardDescription>
            <CardTitle className="text-3xl font-bold text-success">{stats.arrived}</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckCircle2 className="h-8 w-8 text-success opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por tracking o tienda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Paquetes para Tracking Internacional
          </CardTitle>
          <CardDescription>
            Gestiona el tracking internacional USA → Perú
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPackages.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-muted-foreground">No hay paquetes disponibles</p>
              </div>
            ) : (
              filteredPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">{pkg.tracking_number}</p>
                        <p className="text-sm text-muted-foreground">{pkg.store_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2">
                      {getStatusBadge(pkg.current_status)}
                      {pkg.international_tracking && (
                        <div className="flex items-center gap-2 text-sm">
                          <Plane className="h-4 w-4 text-success" />
                          <span className="font-mono text-success">{pkg.international_tracking}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0">
                    <Button
                      onClick={() => handleOpenDialog(pkg)}
                      variant={pkg.international_tracking ? "outline" : "default"}
                      size="sm"
                      className="w-full md:w-auto"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {pkg.international_tracking ? 'Actualizar' : 'Agregar'} Tracking
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              Tracking Internacional USA → Perú
            </DialogTitle>
            <DialogDescription>
              Ingresa el número de tracking internacional para el paquete {selectedPackage?.tracking_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="international-tracking">Número de Tracking Internacional</Label>
              <Input
                id="international-tracking"
                placeholder="Ej: 1Z999AA10123456784"
                value={internationalTracking}
                onChange={(e) => setInternationalTracking(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Ingresa el tracking proporcionado por el courier internacional
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="carrier">Transportista (Opcional)</Label>
              <Select value={carrier} onValueChange={setCarrier}>
                <SelectTrigger id="carrier">
                  <SelectValue placeholder="Auto-detectar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detectar</SelectItem>
                  <SelectItem value="dhl">DHL Express</SelectItem>
                  <SelectItem value="fedex">FedEx</SelectItem>
                  <SelectItem value="usps">USPS</SelectItem>
                  <SelectItem value="ups">UPS</SelectItem>
                  <SelectItem value="olva-courier">Olva Courier</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Aftership puede auto-detectar el transportista
              </p>
            </div>

            {selectedPackage?.international_tracking && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Tracking actual:</p>
                <p className="font-mono font-semibold">{selectedPackage.international_tracking}</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={loading || syncing}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSyncWithAfterShip}
              disabled={syncing || loading || !internationalTracking.trim()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {syncing ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sincronizar con Aftership
                </>
              )}
            </Button>
            <Button
              onClick={handleUploadTracking}
              disabled={loading || syncing || !internationalTracking.trim()}
              className="bg-action-primary hover:bg-primary w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Guardar Tracking
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default InternationalTracking;
