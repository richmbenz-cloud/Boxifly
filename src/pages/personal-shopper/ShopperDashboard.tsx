import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingBag, DollarSign, Package, CheckCircle, Clock, 
  AlertCircle, TrendingUp, Users, Star, Eye, Lock, 
  MessageSquare, Calendar, MapPin, ArrowRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { KYCUpload } from '@/components/KYCUpload';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PSShopperOrderDetail from '@/components/personal-shopper/PSShopperOrderDetail';
import PSServiceTypeBadge from '@/components/personal-shopper/PSServiceTypeBadge';
import PSNotificationBell from '@/components/personal-shopper/PSNotificationBell';

const PSShopperDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  // Check verification status
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['shopper-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('shopper_verified, full_name')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch orders assigned to this shopper
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['ps-shopper-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
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
            especificaciones
          )
        `)
        .eq('personal_shopper_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user && profile?.shopper_verified === true,
  });

  // Fetch available requests for the shopper
  const { data: availableRequests = [] } = useQuery({
    queryKey: ['ps-available-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('ps_requests')
        .select('*')
        .in('estado', ['recibida', 'en_revision'])
        .order('prioridad', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && profile?.shopper_verified === true,
  });

  // Calculate stats
  const activeOrders = orders.filter(o => 
    !['entregado', 'cancelada'].includes(o.estado)
  );
  const pendingApproval = orders.filter(o => o.requires_client_approval);
  const completedOrders = orders.filter(o => o.estado === 'entregado');
  const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.comision_ps || 0), 0);
  const pendingEarnings = orders
    .filter(o => o.estado !== 'entregado' && !['cancelada'].includes(o.estado))
    .reduce((sum, o) => sum + (o.comision_ps || 0), 0);

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

  const getPriorityBadge = (priority: number | null) => {
    switch (priority) {
      case 3: return <Badge variant="destructive">Urgente</Badge>;
      case 2: return <Badge className="bg-status-warning text-foreground">Prioritario</Badge>;
      default: return <Badge variant="outline">Normal</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      moda: 'Moda', electronica: 'Electrónica', bebes: 'Bebés',
      hogar: 'Hogar', deportes: 'Deportes', belleza: 'Belleza',
      juguetes: 'Juguetes', otros: 'Otros',
    };
    return labels[category] || category;
  };

  if (profileLoading || ordersLoading) {
    return (
      <DashboardLayout title="Dashboard Personal Shopper">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Show KYC verification screen if not verified
  if (!profile?.shopper_verified) {
    return (
      <DashboardLayout title="Dashboard Personal Shopper">
        <div className="space-y-6">
          <Alert className="bg-status-warning/10 border-status-warning">
            <AlertCircle className="h-4 w-4 text-status-warning" />
            <AlertDescription className="text-status-warning">
              Debes completar tu verificación KYC para comenzar a trabajar como Personal Shopper.
            </AlertDescription>
          </Alert>
          
          <KYCUpload userRole="shopper" />
          
          <Card>
            <CardHeader>
              <CardTitle>¿Qué sigue después de verificarte?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-status-delivered mt-0.5" />
                  <span>Podrás ver y aceptar solicitudes de compra</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-status-delivered mt-0.5" />
                  <span>Enviarás cotizaciones a los clientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-status-delivered mt-0.5" />
                  <span>Ganarás comisiones por cada compra completada</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // If viewing order detail
  if (selectedOrderId) {
    return (
      <PSShopperOrderDetail 
        orderId={selectedOrderId} 
        onBack={() => setSelectedOrderId(null)} 
      />
    );
  }

  return (
    <DashboardLayout 
      title="Dashboard Personal Shopper"
      headerActions={<PSNotificationBell />}
    >
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary to-navy rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Hola, {profile?.full_name?.split(' ')[0] || 'Personal Shopper'}
          </h1>
          <p className="text-white/90">
            Gestiona tus pedidos y ayuda a clientes a comprar en USA
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <ShoppingBag className="h-3 w-3" /> Disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{availableRequests.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Package className="h-3 w-3" /> Activos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-secondary">{activeOrders.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Lock className="h-3 w-3" /> Esperan Aprobación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-status-warning">{pendingApproval.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Completados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-status-delivered">{completedOrders.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Ganado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-status-delivered">${totalEarnings.toFixed(2)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Pendiente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-muted-foreground">${pendingEarnings.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Blocked Actions Alert */}
        {pendingApproval.length > 0 && (
          <Alert className="border-status-warning bg-status-warning/10">
            <Lock className="h-4 w-4 text-status-warning" />
            <AlertDescription>
              <strong>{pendingApproval.length} pedido(s)</strong> requieren aprobación del cliente para continuar.
              No puedes avanzar hasta que el cliente acepte.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              Mis Pedidos Activos ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="available">
              Solicitudes Disponibles ({availableRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Historial ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Orders Tab */}
          <TabsContent value="active" className="space-y-4">
            {activeOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tienes pedidos activos</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('available')}
                  >
                    Ver solicitudes disponibles
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <Card 
                    key={order.id} 
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      order.requires_client_approval ? 'border-status-warning' : ''
                    }`}
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(order.estado)}
                            {getPriorityBadge(order.ps_requests?.prioridad)}
                            {order.requires_client_approval && (
                              <Badge variant="outline" className="border-status-warning text-status-warning">
                                <Lock className="h-3 w-3 mr-1" />
                                Bloqueado
                              </Badge>
                            )}
                          </div>
                          
                          <p className="font-medium text-foreground truncate">
                            {order.ps_requests?.descripcion_producto}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ShoppingBag className="h-3 w-3" />
                              {getCategoryLabel(order.ps_requests?.categoria)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(order.created_at), "dd MMM", { locale: es })}
                            </span>
                            {order.comision_ps && (
                              <span className="flex items-center gap-1 text-status-delivered">
                                <DollarSign className="h-3 w-3" />
                                ${order.comision_ps.toFixed(2)}
                              </span>
                            )}
                          </div>
                          
                          {order.blocked_reason && (
                            <p className="text-sm text-status-warning mt-2">
                              ⚠️ {order.blocked_reason}
                            </p>
                          )}
                        </div>
                        
                        <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Available Requests Tab */}
          <TabsContent value="available" className="space-y-4">
            {availableRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay solicitudes disponibles en este momento</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Las nuevas solicitudes aparecerán aquí
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {availableRequests.map((request: any) => {
                  const specs = request.especificaciones as any;
                  return (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">
                                {getCategoryLabel(request.categoria)}
                              </Badge>
                              {getPriorityBadge(request.prioridad)}
                              <PSServiceTypeBadge 
                                type={(request.tipo_servicio as 'asistido' | 'live') || 'asistido'} 
                                size="sm" 
                              />
                            </div>
                            
                            <p className="font-medium text-foreground line-clamp-2">
                              {request.descripcion_producto}
                            </p>
                            
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Presupuesto: ${request.presupuesto_max}
                              </span>
                              {specs?.country && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {specs.country}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(request.created_at), "dd MMM", { locale: es })}
                              </span>
                            </div>
                          </div>
                          
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Completed Orders Tab */}
          <TabsContent value="completed" className="space-y-4">
            {completedOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aún no has completado ningún pedido</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {completedOrders.map((order) => (
                  <Card 
                    key={order.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(order.estado)}
                            <Badge variant="outline" className="text-status-delivered border-status-delivered">
                              <DollarSign className="h-3 w-3 mr-1" />
                              ${order.comision_ps?.toFixed(2) || '0.00'}
                            </Badge>
                          </div>
                          
                          <p className="font-medium text-foreground truncate">
                            {order.ps_requests?.descripcion_producto}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{getCategoryLabel(order.ps_requests?.categoria)}</span>
                            <span>
                              Completado: {format(new Date(order.closed_at || order.updated_at), "dd MMM yyyy", { locale: es })}
                            </span>
                          </div>
                        </div>
                        
                        <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PSShopperDashboard;
