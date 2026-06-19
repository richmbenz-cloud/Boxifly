import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Clock, XCircle, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Dispute {
  id: string;
  package_id: string;
  user_id: string;
  created_by: string;
  dispute_type: string;
  status: string;
  priority: string;
  description: string;
  resolution_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  packages?: {
    tracking_number: string;
    store_name: string;
    current_status: string;
  };
  profiles?: {
    full_name: string;
    email: string;
  };
}

const DisputeManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [filteredDisputes, setFilteredDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [newDisputeData, setNewDisputeData] = useState({
    packageId: '',
    disputeType: 'other',
    priority: 'medium',
    description: '',
  });

  useEffect(() => {
    fetchDisputes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, priorityFilter, disputes]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      
      const { data: disputesData, error } = await supabase
        .from('disputes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch related data separately
      const packageIds = [...new Set(disputesData?.map(d => d.package_id) || [])];
      const userIds = [...new Set(disputesData?.map(d => d.user_id) || [])];

      const [packagesResult, profilesResult] = await Promise.all([
        supabase.from('packages').select('id, tracking_number, store_name, current_status').in('id', packageIds),
        supabase.from('profiles').select('id, full_name, email').in('id', userIds),
      ]);

      const disputesWithData = disputesData?.map(dispute => ({
        ...dispute,
        packages: packagesResult.data?.find(p => p.id === dispute.package_id),
        profiles: profilesResult.data?.find(p => p.id === dispute.user_id),
      })) || [];

      setDisputes(disputesWithData);
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las disputas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...disputes];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(d => d.priority === priorityFilter);
    }

    setFilteredDisputes(filtered);
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute || !resolutionNotes.trim()) {
      toast({
        title: "Error",
        description: "Debes agregar notas de resolución",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update dispute
      const { error: updateError } = await supabase
        .from('disputes')
        .update({
          status: 'resolved',
          resolution_notes: resolutionNotes,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', selectedDispute.id);

      if (updateError) throw updateError;

      // Add to history
      const { error: historyError } = await supabase
        .from('dispute_history')
        .insert({
          dispute_id: selectedDispute.id,
          action: 'resolved',
          old_status: selectedDispute.status,
          new_status: 'resolved',
          notes: resolutionNotes,
          created_by: user?.id,
        });

      if (historyError) throw historyError;

      toast({
        title: "Disputa Resuelta",
        description: "La disputa ha sido resuelta exitosamente",
      });

      setResolveDialogOpen(false);
      setResolutionNotes('');
      setSelectedDispute(null);
      fetchDisputes();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast({
        title: "Error",
        description: "No se pudo resolver la disputa",
        variant: "destructive"
      });
    }
  };

  const handleCreateDispute = async () => {
    if (!newDisputeData.packageId || !newDisputeData.description.trim()) {
      toast({
        title: "Error",
        description: "Debes completar todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get package user_id
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('user_id')
        .eq('id', newDisputeData.packageId)
        .single();

      if (packageError) throw packageError;

      const { error } = await supabase
        .from('disputes')
        .insert({
          package_id: newDisputeData.packageId,
          user_id: packageData.user_id,
          created_by: user?.id,
          dispute_type: newDisputeData.disputeType,
          priority: newDisputeData.priority,
          description: newDisputeData.description,
        });

      if (error) throw error;

      toast({
        title: "Disputa Creada",
        description: "La disputa ha sido creada exitosamente",
      });

      setCreateDialogOpen(false);
      setNewDisputeData({
        packageId: '',
        disputeType: 'other',
        priority: 'medium',
        description: '',
      });
      fetchDisputes();
    } catch (error) {
      console.error('Error creating dispute:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la disputa",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: any; variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      open: { icon: AlertTriangle, variant: "destructive", label: "Abierta" },
      in_progress: { icon: Clock, variant: "secondary", label: "En Progreso" },
      resolved: { icon: CheckCircle, variant: "default", label: "Resuelta" },
      closed: { icon: XCircle, variant: "outline", label: "Cerrada" },
    };

    const { icon: Icon, variant, label } = config[status] || config.open;
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500',
    };

    return (
      <Badge className={`${colors[priority]} text-white`}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const disputeTypeLabels: Record<string, string> = {
    weight_discrepancy: 'Discrepancia de Peso',
    damage: 'Daño',
    missing_items: 'Artículos Faltantes',
    cost_dispute: 'Disputa de Costo',
    delivery_issue: 'Problema de Entrega',
    other: 'Otro',
  };

  if (loading) {
    return (
      <DashboardLayout title="Gestión de Disputas">
        <div className="flex items-center justify-center h-64">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Gestión de Disputas">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Sistema de Resolución de Disputas
              </CardTitle>
              <CardDescription>
                Gestiona y resuelve disputas de paquetes
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Disputa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="open">Abierta</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="resolved">Resuelta</SelectItem>
                <SelectItem value="closed">Cerrada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisputes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No se encontraron disputas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDisputes.map((dispute) => (
                    <TableRow key={dispute.id}>
                      <TableCell className="font-mono">
                        {dispute.packages?.tracking_number || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{dispute.profiles?.full_name || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">{dispute.profiles?.email || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{disputeTypeLabels[dispute.dispute_type]}</TableCell>
                      <TableCell>{getPriorityBadge(dispute.priority)}</TableCell>
                      <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                      <TableCell>
                        {new Date(dispute.created_at).toLocaleDateString('es-PE')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/package/${dispute.package_id}`)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedDispute(dispute);
                                setResolveDialogOpen(true);
                              }}
                            >
                              Resolver
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Resolve Dispute Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Resolver Disputa</DialogTitle>
            <DialogDescription>
              Tracking: {selectedDispute?.packages?.tracking_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="font-semibold">Descripción de la Disputa</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedDispute?.description}
              </p>
            </div>
            <div>
              <Label htmlFor="resolution">Notas de Resolución *</Label>
              <Textarea
                id="resolution"
                placeholder="Describe cómo se resolvió la disputa..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleResolveDispute}>
              Resolver Disputa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dispute Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nueva Disputa</DialogTitle>
            <DialogDescription>
              Registra una nueva disputa para un paquete
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="packageId">ID del Paquete *</Label>
              <Input
                id="packageId"
                placeholder="UUID del paquete"
                value={newDisputeData.packageId}
                onChange={(e) => setNewDisputeData({ ...newDisputeData, packageId: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="disputeType">Tipo de Disputa *</Label>
              <Select
                value={newDisputeData.disputeType}
                onValueChange={(value) => setNewDisputeData({ ...newDisputeData, disputeType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(disputeTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Prioridad *</Label>
              <Select
                value={newDisputeData.priority}
                onValueChange={(value) => setNewDisputeData({ ...newDisputeData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                placeholder="Describe el problema..."
                value={newDisputeData.description}
                onChange={(e) => setNewDisputeData({ ...newDisputeData, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateDispute}>
              Crear Disputa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DisputeManagement;
