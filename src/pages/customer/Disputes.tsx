import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Plus, MessageSquare, Clock, CheckCircle2, XCircle, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DisputeData {
  id: string;
  package_id: string;
  dispute_type: string;
  status: string;
  priority: string;
  description: string;
  resolution_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  packages: {
    tracking_number: string;
    store_name: string;
  };
}

interface PackageOption {
  id: string;
  tracking_number: string;
  store_name: string;
  current_status: string;
}

const Disputes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<DisputeData[]>([]);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<DisputeData | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [disputeType, setDisputeType] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (user) {
      fetchDisputes();
      fetchPackages();
    }
  }, [user]);

  const fetchDisputes = async () => {
    const { data, error } = await supabase
      .from('disputes')
      .select(`
        *,
        packages(tracking_number, store_name)
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDisputes(data as any);
    }
  };

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from('packages')
      .select('id, tracking_number, store_name, current_status')
      .eq('user_id', user?.id)
      .neq('current_status', 'delivered')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPackages(data);
    }
  };

  const handleCreateDispute = async () => {
    if (!selectedPackageId || !disputeType || !description.trim()) {
      toast({
        title: "Error",
        description: "Debes completar todos los campos",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('disputes')
        .insert({
          package_id: selectedPackageId,
          user_id: user?.id,
          created_by: user?.id,
          dispute_type: disputeType,
          description: description.trim(),
          status: 'open',
          priority: 'medium'
        });

      if (error) throw error;

      toast({
        title: "Disputa Creada",
        description: "Tu disputa ha sido registrada. Nuestro equipo la revisará pronto.",
      });

      setCreateDialogOpen(false);
      resetForm();
      fetchDisputes();
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

  const resetForm = () => {
    setSelectedPackageId('');
    setDisputeType('');
    setDescription('');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; icon: any; className: string }> = {
      open: { label: 'Abierta', icon: AlertCircle, className: 'bg-status-warning text-white' },
      in_progress: { label: 'En Progreso', icon: Clock, className: 'bg-status-info text-white' },
      resolved: { label: 'Resuelta', icon: CheckCircle2, className: 'bg-success text-white' },
      closed: { label: 'Cerrada', icon: XCircle, className: 'bg-muted text-muted-foreground' },
    };

    const config = statusMap[status] || { label: status, icon: AlertCircle, className: 'bg-muted' };
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; className: string }> = {
      low: { label: 'Baja', className: 'bg-muted text-muted-foreground' },
      medium: { label: 'Media', className: 'bg-status-info text-white' },
      high: { label: 'Alta', className: 'bg-status-error text-white' },
      urgent: { label: 'Urgente', className: 'bg-status-error text-white animate-pulse' },
    };

    const config = priorityMap[priority] || { label: priority, className: 'bg-muted' };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const getDisputeTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      missing_item: 'Producto Faltante',
      damaged_item: 'Producto Dañado',
      wrong_weight: 'Peso Incorrecto',
      wrong_cost: 'Costo Incorrecto',
      delivery_delay: 'Retraso en Entrega',
      other: 'Otro'
    };
    return typeMap[type] || type;
  };

  const stats = {
    total: disputes.length,
    open: disputes.filter(d => d.status === 'open').length,
    inProgress: disputes.filter(d => d.status === 'in_progress').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
  };

  return (
    <DashboardLayout title="Mis Disputas">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardDescription>Total Disputas</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <MessageSquare className="h-8 w-8 text-primary opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-warning">
          <CardHeader className="pb-3">
            <CardDescription>Abiertas</CardDescription>
            <CardTitle className="text-3xl font-bold text-status-warning">{stats.open}</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertCircle className="h-8 w-8 text-status-warning opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-info">
          <CardHeader className="pb-3">
            <CardDescription>En Progreso</CardDescription>
            <CardTitle className="text-3xl font-bold text-status-info">{stats.inProgress}</CardTitle>
          </CardHeader>
          <CardContent>
            <Clock className="h-8 w-8 text-status-info opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardDescription>Resueltas</CardDescription>
            <CardTitle className="text-3xl font-bold text-success">{stats.resolved}</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckCircle2 className="h-8 w-8 text-success opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Create Button */}
      <div className="mb-6">
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-action-primary hover:bg-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Disputa
        </Button>
      </div>

      {/* Disputes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Historial de Disputas
          </CardTitle>
          <CardDescription>
            Gestiona y da seguimiento a tus disputas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {disputes.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-muted-foreground mb-4">No tienes disputas registradas</p>
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera Disputa
                </Button>
              </div>
            ) : (
              disputes.map((dispute) => (
                <div
                  key={dispute.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedDispute(dispute);
                    setDetailDialogOpen(true);
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm font-semibold">
                          {dispute.packages.tracking_number}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          - {dispute.packages.store_name}
                        </span>
                      </div>

                      <p className="font-semibold text-lg mb-2">
                        {getDisputeTypeLabel(dispute.dispute_type)}
                      </p>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {dispute.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(dispute.status)}
                        {getPriorityBadge(dispute.priority)}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(dispute.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                        </span>
                      </div>
                    </div>

                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Dispute Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Crear Nueva Disputa
            </DialogTitle>
            <DialogDescription>
              Describe tu problema para que nuestro equipo pueda ayudarte
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="package">Paquete *</Label>
              <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
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

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Disputa *</Label>
              <Select value={disputeType} onValueChange={setDisputeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="missing_item">Producto Faltante</SelectItem>
                  <SelectItem value="damaged_item">Producto Dañado</SelectItem>
                  <SelectItem value="wrong_weight">Peso Incorrecto</SelectItem>
                  <SelectItem value="wrong_cost">Costo Incorrecto</SelectItem>
                  <SelectItem value="delivery_delay">Retraso en Entrega</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                placeholder="Describe el problema con el mayor detalle posible..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Incluye toda la información relevante para ayudarnos a resolver tu caso
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                resetForm();
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateDispute}
              disabled={loading || !selectedPackageId || !disputeType || !description.trim()}
              className="bg-action-primary hover:bg-primary"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Crear Disputa
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Detalles de la Disputa
            </DialogTitle>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Paquete</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono font-semibold">
                      {selectedDispute.packages.tracking_number}
                    </span>
                    <span className="text-muted-foreground">-</span>
                    <span>{selectedDispute.packages.store_name}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p className="mt-1 font-semibold">
                    {getDisputeTypeLabel(selectedDispute.dispute_type)}
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Estado y Prioridad</Label>
                  <div className="flex gap-2 mt-1">
                    {getStatusBadge(selectedDispute.status)}
                    {getPriorityBadge(selectedDispute.priority)}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-muted-foreground">Descripción</Label>
                  <p className="mt-1 text-sm">{selectedDispute.description}</p>
                </div>

                {selectedDispute.resolution_notes && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground">Resolución</Label>
                      <div className="mt-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                        <p className="text-sm">{selectedDispute.resolution_notes}</p>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex justify-between text-xs text-muted-foreground">
                  <div>
                    <span className="font-semibold">Creada:</span>{' '}
                    {format(new Date(selectedDispute.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                  </div>
                  {selectedDispute.resolved_at && (
                    <div>
                      <span className="font-semibold">Resuelta:</span>{' '}
                      {format(new Date(selectedDispute.resolved_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)} variant="outline">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Disputes;
