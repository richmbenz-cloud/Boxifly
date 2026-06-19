import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, ShoppingBag, ExternalLink, DollarSign, Clock, CheckCircle, 
  XCircle, MessageSquare, AlertTriangle, Truck, Package, MapPin,
  Send, Calendar, Tag, FileText, CreditCard, Link2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

// Componentes PS específicos
import PSFinancialSummary from './PSFinancialSummary';
import PSLegalDisclaimer from './PSLegalDisclaimer';
import PSOrderTimeline from './PSOrderTimeline';
import PSEdgeCaseBanner from './PSEdgeCaseBanner';
import PSNewSimilarRequest from './PSNewSimilarRequest';
import PSQuoteCard from './PSQuoteCard';
import { usePSQuotes } from '@/hooks/usePSQuotes';

interface PSRequestDetailProps {
  requestId: string;
  onBack: () => void;
}

const PSRequestDetail = ({ requestId, onBack }: PSRequestDetailProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [showIncidentForm, setShowIncidentForm] = useState(false);

  // Fetch request details
  const { data: request, isLoading } = useQuery({
    queryKey: ['ps-request', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ps_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch quotes using the formal hook
  const { quotes, isLoading: quotesLoading } = usePSQuotes(requestId);

  // Fetch order if exists
  const { data: order } = useQuery({
    queryKey: ['ps-order-by-request', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ps_orders')
        .select('*')
        .eq('request_id', requestId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!requestId,
  });

  // Fetch messages if order exists
  const { data: messages = [] } = useQuery({
    queryKey: ['ps-messages', order?.id],
    queryFn: async () => {
      if (!order) return [];
      const { data, error } = await supabase
        .from('ps_messages')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!order?.id,
  });

  // Fetch payments if order exists
  const { data: payments = [] } = useQuery({
    queryKey: ['ps-payments', order?.id],
    queryFn: async () => {
      if (!order) return [];
      const { data, error } = await supabase
        .from('ps_payments')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!order?.id,
  });

  // Fetch incidents if order exists
  const { data: incidents = [] } = useQuery({
    queryKey: ['ps-incidents', order?.id],
    queryFn: async () => {
      if (!order) return [];
      const { data, error } = await supabase
        .from('ps_incidents')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!order?.id,
  });

  // Fetch order status history
  const { data: statusHistory = [] } = useQuery({
    queryKey: ['ps-order-history', order?.id],
    queryFn: async () => {
      if (!order) return [];
      const { data, error } = await supabase
        .from('ps_order_status_history')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!order?.id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!order || !user) throw new Error('No order or user');
      const { error } = await supabase
        .from('ps_messages')
        .insert({
          order_id: order.id,
          emisor_id: user.id,
          mensaje: message,
          tipo: 'texto',
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['ps-messages', order?.id] });
      toast.success('Mensaje enviado');
    },
    onError: () => {
      toast.error('Error al enviar mensaje');
    },
  });

  // Create incident mutation
  const createIncidentMutation = useMutation({
    mutationFn: async (description: string) => {
      if (!order || !user) throw new Error('No order or user');
      const { error } = await supabase
        .from('ps_incidents')
        .insert({
          order_id: order.id,
          reportado_por: user.id,
          tipo: 'problema_cliente',
          descripcion: description,
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      setIncidentDescription('');
      setShowIncidentForm(false);
      queryClient.invalidateQueries({ queryKey: ['ps-incidents', order?.id] });
      toast.success('Incidente reportado correctamente');
    },
    onError: () => {
      toast.error('Error al reportar incidente');
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      recibida: { label: 'Recibida', className: 'bg-status-info text-white' },
      en_revision: { label: 'En Revisión', className: 'bg-status-processing text-white' },
      cotizada: { label: 'Cotizada', className: 'bg-primary text-white' },
      aprobada: { label: 'Aprobada', className: 'bg-status-delivered text-white' },
      rechazada: { label: 'Rechazada', className: 'bg-destructive text-white' },
      cancelada: { label: 'Cancelada', className: 'bg-muted text-muted-foreground' },
      solicitud_recibida: { label: 'Solicitud Recibida', className: 'bg-status-info text-white' },
      aprobado_cliente: { label: 'Aprobado', className: 'bg-status-delivered text-white' },
      compra_en_proceso: { label: 'Comprando', className: 'bg-status-processing text-white' },
      producto_comprado: { label: 'Comprado', className: 'bg-primary text-white' },
      en_almacen_usa: { label: 'En Almacén USA', className: 'bg-status-processing text-white' },
      en_transito: { label: 'En Tránsito', className: 'bg-status-transit text-white' },
      en_aduanas: { label: 'En Aduanas', className: 'bg-status-warning text-foreground' },
      en_reparto: { label: 'En Reparto', className: 'bg-primary text-white' },
      entregado: { label: 'Entregado', className: 'bg-status-delivered text-white' },
      pendiente: { label: 'Pendiente', className: 'bg-status-warning text-foreground' },
      procesando: { label: 'Procesando', className: 'bg-status-processing text-white' },
      completado: { label: 'Pagado', className: 'bg-status-delivered text-white' },
      fallido: { label: 'Fallido', className: 'bg-destructive text-white' },
      abierta: { label: 'Abierta', className: 'bg-status-warning text-foreground' },
      en_proceso: { label: 'En Proceso', className: 'bg-status-processing text-white' },
      resuelta: { label: 'Resuelta', className: 'bg-status-delivered text-white' },
    };
    const config = statusMap[status] || { label: status, className: 'bg-muted' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      moda: 'Moda',
      electronica: 'Electrónica',
      bebes: 'Bebés',
      hogar: 'Hogar',
      deportes: 'Deportes',
      belleza: 'Belleza',
      juguetes: 'Juguetes',
      otros: 'Otros',
    };
    return labels[category] || category;
  };

  const getPriorityLabel = (priority: number | null) => {
    switch (priority) {
      case 3: return 'Urgente';
      case 2: return 'Prioritario';
      default: return 'Normal';
    }
  };

  const getOrderStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      solicitud_recibida: 'Solicitud Recibida',
      en_revision: 'En Revisión',
      aprobado_cliente: 'Aprobado por Cliente',
      compra_en_proceso: 'Compra en Proceso',
      producto_comprado: 'Producto Comprado',
      en_almacen_usa: 'En Almacén USA',
      en_transito: 'En Tránsito Internacional',
      en_aduanas: 'En Aduanas',
      en_reparto: 'En Reparto',
      entregado: 'Entregado',
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Detalle de Solicitud">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </DashboardLayout>
    );
  }

  if (!request) {
    return (
      <DashboardLayout title="Solicitud no encontrada">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontró la solicitud</p>
          <Button onClick={onBack} className="mt-4">Volver</Button>
        </div>
      </DashboardLayout>
    );
  }

  const selectedQuote = quotes.find(q => q.es_seleccionada);
  const specs = request.especificaciones as any;

  // Detectar edge cases basados en el estado
  const getEdgeCase = () => {
    if (!order) return null;
    // Aquí podrías agregar lógica adicional para detectar edge cases desde la BD
    // Por ahora solo manejamos cancelaciones
    if (request.estado === 'cancelada') return 'cancelado_cliente';
    if (request.estado === 'rechazada') return 'cancelado_boxifly';
    return null;
  };
  
  const edgeCase = getEdgeCase();
  const isTerminalState = ['entregado', 'cancelada', 'rechazada'].includes(request.estado) || 
                          (order && order.estado === 'entregado');

  return (
    <DashboardLayout title="Detalle de Solicitud PS">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver a solicitudes
        </Button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-navy">Solicitud PS</h2>
              {getStatusBadge(request.estado)}
            </div>
            <p className="text-muted-foreground mt-1">
              Creada el {format(new Date(request.created_at), "dd 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
          
          {/* Botón Nueva Solicitud Similar para estados terminales */}
          {isTerminalState && (
            <PSNewSimilarRequest originalRequest={request} />
          )}
        </div>
      </div>

      {/* Edge Case Banner */}
      {edgeCase && (
        <div className="mb-6">
          <PSEdgeCaseBanner 
            type={edgeCase as any}
            onAction={onBack}
            actionLabel="Volver a mis solicitudes"
          />
        </div>
      )}

      {/* Resumen Financiero - visible cuando hay cotización seleccionada u orden */}
      {(selectedQuote || order) && (
        <div className="mb-6">
          <PSFinancialSummary 
            totalCotizado={order?.total_cliente || selectedQuote?.total_estimado || 0}
            payments={payments}
            orderStatus={order?.estado}
          />
        </div>
      )}

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="quotes" disabled={quotes.length === 0}>
            Cotizaciones {quotes.length > 0 && `(${quotes.length})`}
          </TabsTrigger>
          <TabsTrigger value="tracking" disabled={!order}>Seguimiento</TabsTrigger>
          <TabsTrigger value="messages" disabled={!order}>Mensajes</TabsTrigger>
          <TabsTrigger value="incidents" disabled={!order}>Incidentes</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
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
                  <p className="font-medium">{getCategoryLabel(request.categoria)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Servicio</p>
                  <p className="font-medium capitalize">{request.tipo_servicio}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Urgencia</p>
                  <p className="font-medium">{getPriorityLabel(request.prioridad)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Presupuesto</p>
                  <p className="font-medium">
                    {request.presupuesto_min ? `$${request.presupuesto_min} - ` : ''}
                    ${request.presupuesto_max}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Descripción del Producto</p>
                <p className="text-navy">{request.descripcion_producto}</p>
              </div>

              {request.url_referencia && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">URL de Referencia</p>
                  <a 
                    href={request.url_referencia} 
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

              {request.notas_cliente && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Notas Adicionales</p>
                  <p className="text-navy">{request.notas_cliente}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes" className="space-y-6">
          {quotes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aún no hay cotizaciones</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Te notificaremos cuando recibas una cotización
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Disclaimer legal antes de las cotizaciones */}
              <PSLegalDisclaimer variant="compact" />
              
              {/* Quotes using the formal module with states, expiration, approval/rejection */}
              {quotes.map((quote) => (
                <PSQuoteCard
                  key={quote.id}
                  quote={quote}
                  requestId={requestId}
                  requestStatus={request?.estado || ''}
                  serviceType={(request?.tipo_servicio as 'asistido' | 'live') || 'asistido'}
                />
              ))}
            </>
          )}
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          {order ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Seguimiento del Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Timeline propio de PS */}
                  <PSOrderTimeline 
                    currentStatus={order.estado}
                    statusHistory={statusHistory}
                    isCancelled={request.estado === 'cancelada'}
                  />
                </CardContent>
              </Card>

              {/* Tracking Numbers */}
              {(order.tracking_usa || order.tracking_internacional) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Números de Seguimiento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.tracking_usa && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Tracking USA</span>
                        <code className="bg-muted px-2 py-1 rounded text-sm">{order.tracking_usa}</code>
                      </div>
                    )}
                    {order.tracking_internacional && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Tracking Internacional</span>
                        <code className="bg-muted px-2 py-1 rounded text-sm">{order.tracking_internacional}</code>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Payments */}
              {payments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Pagos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">${payment.monto} {payment.moneda}</p>
                            <p className="text-sm text-muted-foreground">
                              {payment.metodo_pago || 'Método no especificado'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(payment.created_at), 'dd MMM yyyy', { locale: es })}
                            </p>
                          </div>
                          {getStatusBadge(payment.estado)}
                        </div>
                      ))}
                    </div>
                    
                    {/* Disclaimer antes del CTA de pagar */}
                    {payments.some(p => p.estado === 'pendiente') && (
                      <PSLegalDisclaimer variant="payment" className="mt-4" />
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Nueva solicitud similar para pedidos entregados */}
              {order.estado === 'entregado' && (
                <PSNewSimilarRequest originalRequest={request} variant="card" />
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aún no hay pedido activo</p>
                <p className="text-sm text-muted-foreground mt-1">
                  El seguimiento estará disponible cuando apruebes una cotización
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          {order ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Mensajes
                </CardTitle>
                <CardDescription>
                  Comunicación con Boxifly sobre tu pedido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No hay mensajes aún
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.emisor_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          msg.emisor_id === user?.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{msg.mensaje}</p>
                          <p className={`text-xs mt-1 ${
                            msg.emisor_id === user?.id 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {format(new Date(msg.created_at), 'HH:mm', { locale: es })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <Button 
                    onClick={() => sendMessageMutation.mutate(newMessage)}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Chat no disponible</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Los mensajes estarán habilitados cuando tengas un pedido activo
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-6">
          {order ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Incidentes
                      </CardTitle>
                      <CardDescription>
                        Reporta cualquier problema con tu pedido
                      </CardDescription>
                    </div>
                    {!showIncidentForm && (
                      <Button onClick={() => setShowIncidentForm(true)} variant="outline" size="sm">
                        Reportar Incidente
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {showIncidentForm && (
                    <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-3">Nuevo Incidente</h4>
                      <Textarea
                        placeholder="Describe el problema..."
                        value={incidentDescription}
                        onChange={(e) => setIncidentDescription(e.target.value)}
                        className="mb-3"
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => createIncidentMutation.mutate(incidentDescription)}
                          disabled={!incidentDescription.trim() || createIncidentMutation.isPending}
                        >
                          Enviar Reporte
                        </Button>
                        <Button variant="outline" onClick={() => setShowIncidentForm(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  {incidents.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No hay incidentes reportados
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {incidents.map((incident) => (
                        <div key={incident.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{incident.tipo}</span>
                            {getStatusBadge(incident.estado)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{incident.descripcion}</p>
                          <p className="text-xs text-muted-foreground">
                            Reportado el {format(new Date(incident.created_at), 'dd MMM yyyy', { locale: es })}
                          </p>
                          {incident.resolucion && (
                            <div className="mt-3 p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium">Resolución:</p>
                              <p className="text-sm text-muted-foreground">{incident.resolucion}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Incidentes no disponibles</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Podrás reportar incidentes cuando tengas un pedido activo
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default PSRequestDetail;
