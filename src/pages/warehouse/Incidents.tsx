import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Plus, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Incident {
  id: string;
  package_id: string;
  action: string;
  details: any;
  created_at: string;
  packages?: {
    tracking_number: string;
    store_name: string;
  };
}

const WarehouseIncidents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    packageId: '',
    incidentType: '',
    description: '',
  });

  useEffect(() => {
    fetchIncidents();
    fetchPackages();
  }, []);

  const fetchIncidents = async () => {
    const { data, error } = await supabase
      .from('warehouse_logs')
      .select(`
        *,
        packages (
          tracking_number,
          store_name
        )
      `)
      .eq('action', 'INCIDENT_REPORTED')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setIncidents(data as any);
    }
  };

  const fetchPackages = async () => {
    const { data } = await supabase
      .from('packages')
      .select('id, tracking_number, store_name')
      .in('current_status', ['received_warehouse', 'ready_consolidation'])
      .order('tracking_number');

    if (data) setPackages(data);
  };

  const handleSubmit = async () => {
    if (!formData.packageId || !formData.incidentType || !formData.description) {
      toast({
        title: 'Error',
        description: 'Todos los campos son obligatorios',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('warehouse_logs').insert({
      package_id: formData.packageId,
      logged_by: user?.id,
      action: 'INCIDENT_REPORTED',
      details: {
        incident_type: formData.incidentType,
        description: formData.description,
        reported_at: new Date().toISOString(),
      },
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo registrar la incidencia',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Incidencia Registrada',
      description: 'La incidencia ha sido registrada exitosamente',
    });

    setDialogOpen(false);
    setFormData({ packageId: '', incidentType: '', description: '' });
    fetchIncidents();
  };

  const getIncidentTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; className: string }> = {
      damage: { label: 'Daño', className: 'bg-status-error text-white' },
      missing: { label: 'Faltante', className: 'bg-status-warning text-white' },
      delay: { label: 'Retraso', className: 'bg-status-info text-white' },
      other: { label: 'Otro', className: 'bg-muted' },
    };

    const config = typeMap[type] || { label: type, className: 'bg-muted' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout title="Gestión de Incidencias">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Registro de Incidencias</h2>
          <p className="text-muted-foreground">
            Gestiona daños, faltantes y retrasos en el warehouse
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-action-primary hover:bg-primary">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Incidencia
        </Button>
      </div>

      {/* Incidents Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-status-error">
          <CardHeader className="pb-3">
            <CardDescription>Daños Reportados</CardDescription>
            <CardTitle className="text-3xl font-bold text-status-error">
              {incidents.filter(i => i.details?.incident_type === 'damage').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertTriangle className="h-8 w-8 text-status-error opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-warning">
          <CardHeader className="pb-3">
            <CardDescription>Faltantes</CardDescription>
            <CardTitle className="text-3xl font-bold text-status-warning">
              {incidents.filter(i => i.details?.incident_type === 'missing').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Package className="h-8 w-8 text-status-warning opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-info">
          <CardHeader className="pb-3">
            <CardDescription>Total Incidencias</CardDescription>
            <CardTitle className="text-3xl font-bold text-status-info">
              {incidents.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertTriangle className="h-8 w-8 text-status-info opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Incidents List */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Incidencias</CardTitle>
          <CardDescription>Lista de todas las incidencias reportadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incidents.map((incident) => (
              <Card key={incident.id} className="border-l-4 border-l-status-warning">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {getIncidentTypeBadge(incident.details?.incident_type)}
                        <span className="font-mono text-sm">
                          {incident.packages?.tracking_number}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {incident.packages?.store_name}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(incident.created_at).toLocaleDateString('es-PE')}
                    </span>
                  </div>
                  <p className="text-sm">{incident.details?.description}</p>
                </CardContent>
              </Card>
            ))}
            {incidents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay incidencias registradas
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* New Incident Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Nueva Incidencia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="package">Paquete *</Label>
              <Select value={formData.packageId} onValueChange={(value) => setFormData({ ...formData, packageId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un paquete" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.tracking_number} - {pkg.store_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Tipo de Incidencia *</Label>
              <Select value={formData.incidentType} onValueChange={(value) => setFormData({ ...formData, incidentType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="damage">Daño</SelectItem>
                  <SelectItem value="missing">Faltante</SelectItem>
                  <SelectItem value="delay">Retraso</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe la incidencia en detalle..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-action-primary hover:bg-primary">
              Registrar Incidencia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WarehouseIncidents;
