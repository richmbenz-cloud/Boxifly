import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, ShoppingBag, ExternalLink, DollarSign, Clock, CheckCircle, 
  XCircle, MessageSquare, AlertTriangle, Truck, Package, MapPin,
  Send, Calendar, Tag, FileText, CreditCard, Link2, Lock, User,
  History, Shield, AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import PSFinancialSummary from './PSFinancialSummary';
import PSOrderTimeline from './PSOrderTimeline';
import PSMessageThread from './PSMessageThread';
import PSApprovalLog from './PSApprovalLog';
import PSQuotesManager from './PSQuotesManager';

interface PSShopperOrderDetailProps {
  orderId: string;
  onBack: () => void;
}

const PSShopperOrderDetail = ({ orderId, onBack }: PSShopperOrderDetailProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [showIncidentForm, setShowIncidentForm] = useState(false);

  // Fetch order with request details
  const { data: order, isLoading } = useQuery({
    queryKey: ['ps-order-detail', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ps_orders')
        .select(`
          *,
          ps_requests!inner(
            descripcion_producto,
            categoria,
            prioridad,
            tipo_servicio,
            cliente_id,
            especificaciones,
            presupuesto_max,
            presupuesto_min,
            url_referencia,
            notas_cliente
          )
        `)
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return data as any;
    },
  });

  // Fetch client profile
  const { data: clientProfile } = useQuery({
    queryKey: ['client-profile', order?.ps_requests?.cliente_id],
    queryFn: async () => {
      if (!order?.ps_requests?.cliente_id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, city, country')
        .eq('id', order.ps_requests.cliente_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!order?.ps_requests?.cliente_id,
  });

  // Fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ['ps-messages', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ps_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  // Fetch status history
  const { data: statusHistory = [] } = useQuery({
    queryKey: ['ps-order-history', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ps_order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  // Fetch client approvals
  const { data: approvals = [] } = useQuery({
    queryKey: ['ps-approvals', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ps_client_approvals')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  // Fetch decision log
  const { data: decisionLog = [] } = useQuery({
    queryKey: ['ps-decision-log', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ps_decision_log')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  // Fetch payments
  const { data: payments = [] } = useQuery({
    queryKey: ['ps-payments', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ps_payments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  // Fetch incidents
  const { data: incidents = [] } = useQuery({
    queryKey: ['ps-incidents', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ps_incidents')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!user) throw new Error('No user');
      const { error } = await supabase
        .from('ps_messages')
        .insert({
          order_id: orderId,
          emisor_id: user.id,
          mensaje: message,
          tipo: 'texto',
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['ps-messages', orderId] });
      toast.success('Mensaje enviado');
    },
    onError: () => {
      toast.error('Error al enviar mensaje');
    },
  });

  // Create incident mutation
  const createIncidentMutation = useMutation({
    mutationFn: async (description: string) => {
      if (!user) throw new Error('No user');
      const { error } = await supabase
        .from('ps_incidents')
        .insert({
          order_id: orderId,
          reportado_por: user.id,
          tipo: 'problema_shopper',
          descripcion: description,
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      setIncidentDescription('');
      setShowIncidentForm(false);
      queryClient.invalidateQueries({ queryKey: ['ps-incidents', orderId] });
      toast.success('Incidente reportado');
    },
    onError: () => {
      toast.error('Error al reportar incidente');
    },
  });

  // Log decision mutation (for PS to register client decisions)
  const logDecisionMutation = useMutation({
    mutationFn: async (data: { tipo: string; descripcion: string; contexto?: any }) => {
      if (!user) throw new Error('No user');
      const { error } = await supabase
        .from('ps_decision_log')
        .insert({
          order_id: orderId,
          actor_id: user.id,
          actor_tipo: 'shopper',
          tipo_decision: data.tipo,
          descripcion: data.descripcion,
          contexto: data.contexto,
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ps-decision-log', orderId] });
      toast.success('Decisión registrada');
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      solicitud_recibida: { label: 'Nueva', className: 'bg-status-info text-white' },
      en_revision: { label: 'En Revisión', className: 'bg-status-processing text-white' },
      aprobado_cliente: { label: 'Aprobado', className: 'bg-status-delivered text-white' },
      compra_en_proceso: { label: 'Comprando', className: 'bg-primary text-white' },
      producto_comprado: { label: 'Comprado', className: 'bg-status-delivered text-white' },
      en_almacen_usa: { label: 'En Almacén', className: 'bg-status-processing text-white' },
      en_transito: { label: 'En Tránsito', className: 'bg-status-transit text-white' },
      en_aduanas: { label: 'En Aduanas', className: 'bg-status-warning text-foreground' },
      en_reparto: { label: 'En Reparto', className: 'bg-primary text-white' },
      entregado: { label: 'Entregado', className: 'bg-status-delivered text-white' },
    };
    const config = statusMap[status] || { label: status, className: 'bg-muted' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      moda: 'Moda', electronica: 'Electrónica', bebes: 'Bebés',
      hogar: 'Hogar', deportes: 'Deportes', belleza: 'Belleza',
      juguetes: 'Juguetes', otros: 'Otros',
    };
    return labels[category] || category;
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Detalle del Pedido">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout title="Pedido no encontrado">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontró el pedido</p>
          <Button onClick={onBack} className="mt-4">Volver</Button>
        </div>
      </DashboardLayout>
    );
  }

  const specs = order.ps_requests?.especificaciones as any;
  const isBlocked = order.requires_client_approval;

  return (
    <DashboardLayout title="Detalle del Pedido PS">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver a mis pedidos
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-navy">Pedido PS</h2>
              {getStatusBadge(order.estado)}
              {isBlocked && (
                <Badge variant="outline" className="border-status-warning text-status-warning">
                  <Lock className="h-3 w-3 mr-1" />
                  Requiere Aprobación
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Creado el {format(new Date(order.created_at), "dd 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
        </div>
      </div>

      {/* Blocked Alert */}
      {isBlocked && (
        <Alert className="mb-6 border-status-warning bg-status-warning/10">
          <Lock className="h-4 w-4 text-status-warning" />
          <AlertDescription>
            <strong>Acción bloqueada:</strong> {order.blocked_reason || 'Esperando aprobación del cliente para continuar.'}
            <br />
            <span className="text-sm">No puedes avanzar el estado hasta que el cliente acepte.</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Financial Summary */}
      <div className="mb-6">
        <PSFinancialSummary 
          totalCotizado={order.total_cliente || 0}
          payments={payments}
          orderStatus={order.estado}
        />
      </div>

      <Tabs defaultValue="quotes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-7">
          <TabsTrigger value="quotes" className="gap-1">
            <FileText className="h-3 w-3 hidden sm:inline" />
            Cotizaciones
          </TabsTrigger>
          <TabsTrigger value="info">Solicitud</TabsTrigger>
          <TabsTrigger value="client">Cliente</TabsTrigger>
          <TabsTrigger value="tracking">Seguimiento</TabsTrigger>
          <TabsTrigger value="messages">
            Mensajes {messages.length > 0 && `(${messages.length})`}
          </TabsTrigger>
          <TabsTrigger value="approvals">
            Aprobaciones {approvals.length > 0 && `(${approvals.length})`}
          </TabsTrigger>
          <TabsTrigger value="incidents">
            Incidentes {incidents.length > 0 && `(${incidents.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Quotes Tab - First tab for PS to manage quotes */}
        <TabsContent value="quotes" className="space-y-6">
          <PSQuotesManager
            requestId={order.request_id}
            requestDescription={order.ps_requests?.descripcion_producto || ''}
            requestStatus={order.estado}
            presupuestoMax={order.ps_requests?.presupuesto_max || 0}
            presupuestoMin={order.ps_requests?.presupuesto_min}
            canCreateQuote={['solicitud_recibida', 'en_revision'].includes(order.estado)}
          />
        </TabsContent>

        {/* Request Info Tab */}
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Información de la Solicitud
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Categoría</p>
                  <p className="font-medium">{getCategoryLabel(order.ps_requests?.categoria)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Servicio</p>
                  <p className="font-medium capitalize">{order.ps_requests?.tipo_servicio}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Presupuesto</p>
                  <p className="font-medium">
                    {order.ps_requests?.presupuesto_min ? `$${order.ps_requests.presupuesto_min} - ` : ''}
                    ${order.ps_requests?.presupuesto_max}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monto del Producto</p>
                  <p className="font-medium">${order.monto_producto?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Descripción del Producto</p>
                <p className="text-navy">{order.ps_requests?.descripcion_producto}</p>
              </div>

              {order.ps_requests?.url_referencia && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">URL de Referencia</p>
                  <a 
                    href={order.ps_requests.url_referencia} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver producto
                  </a>
                </div>
              )}

              {specs?.urls && specs.urls.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">URLs Adicionales</p>
                  <div className="space-y-2">
                    {specs.urls.map((url: string, idx: number) => (
                      <a 
                        key={idx}
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 text-sm"
                      >
                        <Link2 className="h-3 w-3" />
                        {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {(specs?.country || specs?.city) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Ubicación de Compra</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{specs.city && `${specs.city}, `}{specs.country}</span>
                  </div>
                </div>
              )}

              {order.ps_requests?.notas_cliente && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Notas del Cliente</p>
                  <p className="text-navy bg-muted/50 p-3 rounded-lg">{order.ps_requests.notas_cliente}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking Numbers */}
          {(order.tracking_usa || order.tracking_internacional) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Números de Seguimiento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.tracking_usa && (
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Tracking USA</span>
                    <code className="font-mono text-sm">{order.tracking_usa}</code>
                  </div>
                )}
                {order.tracking_internacional && (
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Tracking Internacional</span>
                    <code className="font-mono text-sm">{order.tracking_internacional}</code>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Client Info Tab (sin datos financieros sensibles) */}
        <TabsContent value="client" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Cliente
              </CardTitle>
              <CardDescription>
                Datos básicos del cliente (sin información financiera)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{clientProfile?.full_name || 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ubicación</p>
                  <p className="font-medium">
                    {clientProfile?.city && clientProfile?.country 
                      ? `${clientProfile.city}, ${clientProfile.country}`
                      : clientProfile?.country || 'No especificada'
                    }
                  </p>
                </div>
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Por seguridad, los datos financieros y de contacto directo del cliente 
                  no son visibles. Toda comunicación debe realizarse a través de la plataforma.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Timeline del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PSOrderTimeline 
                currentStatus={order.estado}
                statusHistory={statusHistory}
                isCancelled={order.estado === 'cancelada'}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <PSMessageThread 
            messages={messages}
            currentUserId={user?.id || ''}
            onSendMessage={(msg) => sendMessageMutation.mutate(msg)}
            isSending={sendMessageMutation.isPending}
          />
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-6">
          <PSApprovalLog 
            approvals={approvals}
            decisionLog={decisionLog}
          />
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Incidentes
                </CardTitle>
                {!showIncidentForm && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowIncidentForm(true)}
                  >
                    Reportar Incidente
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showIncidentForm && (
                <div className="p-4 border rounded-lg space-y-3">
                  <Textarea
                    placeholder="Describe el incidente..."
                    value={incidentDescription}
                    onChange={(e) => setIncidentDescription(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => createIncidentMutation.mutate(incidentDescription)}
                      disabled={!incidentDescription.trim() || createIncidentMutation.isPending}
                    >
                      Enviar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowIncidentForm(false);
                        setIncidentDescription('');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {incidents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay incidentes registrados
                </p>
              ) : (
                <div className="space-y-3">
                  {incidents.map((incident: any) => (
                    <div key={incident.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant={incident.estado === 'abierta' ? 'destructive' : 'secondary'}>
                            {incident.estado === 'abierta' ? 'Abierta' : 
                             incident.estado === 'en_proceso' ? 'En Proceso' : 'Resuelta'}
                          </Badge>
                          <p className="mt-2 text-sm">{incident.descripcion}</p>
                          {incident.resolucion && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              <strong>Resolución:</strong> {incident.resolucion}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(incident.created_at), "dd MMM HH:mm", { locale: es })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default PSShopperOrderDetail;
