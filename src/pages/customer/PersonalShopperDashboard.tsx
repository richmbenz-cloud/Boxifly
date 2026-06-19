import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingBag, Plus, Clock, CheckCircle, Package, AlertCircle, 
  DollarSign, Truck, MessageSquare, FileText, ChevronRight,
  Tag, Calendar, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PSRequestDetail from '@/components/personal-shopper/PSRequestDetail';
import PSServiceTypeBadge from '@/components/personal-shopper/PSServiceTypeBadge';
import PSNotificationBell from '@/components/personal-shopper/PSNotificationBell';

type PSRequestStatus = 'recibida' | 'en_revision' | 'cotizada' | 'aprobada' | 'rechazada' | 'cancelada';
type PSOrderStatus = 'solicitud_recibida' | 'en_revision' | 'aprobado_cliente' | 'compra_en_proceso' | 'producto_comprado' | 'en_almacen_usa' | 'en_transito' | 'en_aduanas' | 'en_reparto' | 'entregado';

interface PSRequest {
  id: string;
  tipo_servicio: string;
  categoria: string;
  descripcion_producto: string;
  url_referencia: string | null;
  presupuesto_min: number | null;
  presupuesto_max: number;
  estado: PSRequestStatus;
  prioridad: number | null;
  notas_cliente: string | null;
  created_at: string;
  especificaciones: any;
}

interface PSOrder {
  id: string;
  request_id: string;
  monto_producto: number;
  comision_boxifly: number;
  costo_servicio: number;
  total_cliente: number;
  estado: PSOrderStatus;
  tracking_usa: string | null;
  tracking_internacional: string | null;
  created_at: string;
}

const CustomerPSDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Fetch PS Requests
  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['ps-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('ps_requests')
        .select('*')
        .eq('cliente_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PSRequest[];
    },
    enabled: !!user,
  });

  // Fetch PS Orders
  const { data: orders = [] } = useQuery({
    queryKey: ['ps-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('ps_orders')
        .select('*')
        .eq('cliente_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PSOrder[];
    },
    enabled: !!user,
  });

  // Calculate stats
  const stats = {
    activas: requests.filter(r => ['recibida', 'en_revision'].includes(r.estado)).length,
    enCotizacion: requests.filter(r => r.estado === 'cotizada').length,
    pagadas: orders.filter(o => ['compra_en_proceso', 'producto_comprado', 'en_almacen_usa', 'en_transito', 'en_aduanas', 'en_reparto'].includes(o.estado)).length,
    entregadas: orders.filter(o => o.estado === 'entregado').length,
  };

  // Get latest request with pending action
  const latestActiveRequest = requests.find(r => 
    ['recibida', 'en_revision', 'cotizada', 'aprobada'].includes(r.estado)
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      recibida: { label: 'Recibida', className: 'bg-status-info text-white' },
      en_revision: { label: 'En Revisión', className: 'bg-status-processing text-white' },
      cotizada: { label: 'Cotizada', className: 'bg-primary text-white' },
      aprobada: { label: 'Aprobada', className: 'bg-status-delivered text-white' },
      rechazada: { label: 'Rechazada', className: 'bg-destructive text-white' },
      cancelada: { label: 'Cancelada', className: 'bg-muted text-muted-foreground' },
      // Order statuses
      solicitud_recibida: { label: 'Solicitud Recibida', className: 'bg-status-info text-white' },
      aprobado_cliente: { label: 'Aprobado', className: 'bg-status-delivered text-white' },
      compra_en_proceso: { label: 'Comprando', className: 'bg-status-processing text-white' },
      producto_comprado: { label: 'Comprado', className: 'bg-primary text-white' },
      en_almacen_usa: { label: 'En Almacén USA', className: 'bg-status-processing text-white' },
      en_transito: { label: 'En Tránsito', className: 'bg-status-transit text-white' },
      en_aduanas: { label: 'En Aduanas', className: 'bg-status-warning text-foreground' },
      en_reparto: { label: 'En Reparto', className: 'bg-primary text-white' },
      entregado: { label: 'Entregado', className: 'bg-status-delivered text-white' },
    };
    const config = statusMap[status] || { label: status, className: 'bg-muted' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getCTAForRequest = (request: PSRequest) => {
    switch (request.estado) {
      case 'recibida':
      case 'en_revision':
        return { text: 'Esperando cotización', icon: Clock, variant: 'secondary' as const };
      case 'cotizada':
        return { text: 'Ver cotización', icon: Eye, variant: 'default' as const };
      case 'aprobada':
        return { text: 'Pagar ahora', icon: DollarSign, variant: 'default' as const };
      default:
        return null;
    }
  };

  const getPriorityLabel = (priority: number | null) => {
    switch (priority) {
      case 3: return { label: 'Urgente', className: 'bg-destructive/10 text-destructive border-destructive/20' };
      case 2: return { label: 'Prioritario', className: 'bg-primary/10 text-primary border-primary/20' };
      default: return { label: 'Normal', className: 'bg-muted text-muted-foreground border-muted' };
    }
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

  if (selectedRequestId) {
    return (
      <PSRequestDetail 
        requestId={selectedRequestId} 
        onBack={() => setSelectedRequestId(null)} 
      />
    );
  }

  return (
    <DashboardLayout 
      title="Personal Shopper"
      headerActions={<PSNotificationBell />}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-l-4 border-l-status-info">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs md:text-sm">Solicitudes Activas</CardDescription>
            <CardTitle className="text-2xl md:text-3xl font-bold text-status-info">{stats.activas}</CardTitle>
          </CardHeader>
          <CardContent>
            <ShoppingBag className="h-6 w-6 md:h-8 md:w-8 text-status-info opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs md:text-sm">En Cotización</CardDescription>
            <CardTitle className="text-2xl md:text-3xl font-bold text-primary">{stats.enCotizacion}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tag className="h-6 w-6 md:h-8 md:w-8 text-primary opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-transit">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs md:text-sm">En Proceso</CardDescription>
            <CardTitle className="text-2xl md:text-3xl font-bold text-status-transit">{stats.pagadas}</CardTitle>
          </CardHeader>
          <CardContent>
            <Truck className="h-6 w-6 md:h-8 md:w-8 text-status-transit opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-delivered">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs md:text-sm">Entregadas</CardDescription>
            <CardTitle className="text-2xl md:text-3xl font-bold text-status-delivered">{stats.entregadas}</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-status-delivered opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Latest Request CTA */}
      {latestActiveRequest && (
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Última Solicitud</CardTitle>
                <CardDescription className="mt-1">
                  {latestActiveRequest.descripcion_producto.substring(0, 100)}
                  {latestActiveRequest.descripcion_producto.length > 100 && '...'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(latestActiveRequest.estado)}
                {(() => {
                  const cta = getCTAForRequest(latestActiveRequest);
                  if (!cta) return null;
                  const Icon = cta.icon;
                  return (
                    <Button 
                      variant={cta.variant}
                      onClick={() => setSelectedRequestId(latestActiveRequest.id)}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {cta.text}
                    </Button>
                  );
                })()}
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Actions */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Button 
          className="bg-action-primary hover:bg-primary" 
          size="lg"
          onClick={() => navigate('/personal-shopper/solicitud')}
        >
          <Plus className="mr-2 h-5 w-5" />
          Nueva Solicitud PS
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => navigate('/cliente/dashboard')}
        >
          <Package className="mr-2 h-5 w-5" />
          Mis Paquetes
        </Button>
      </div>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Solicitudes Personal Shopper</CardTitle>
          <CardDescription>Historial de todas tus solicitudes de compra asistida</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingRequests ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No tienes solicitudes aún</p>
              <Button 
                className="bg-action-primary hover:bg-primary"
                onClick={() => navigate('/personal-shopper/solicitud')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear primera solicitud
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const priority = getPriorityLabel(request.prioridad);
                return (
                  <div
                    key={request.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer gap-4"
                    onClick={() => setSelectedRequestId(request.id)}
                  >
                    <div className="flex items-start md:items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryLabel(request.categoria)}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${priority.className}`}>
                            {priority.label}
                          </Badge>
                        </div>
                        <p className="font-semibold text-navy line-clamp-1">
                          {request.descripcion_producto}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(request.created_at), 'dd MMM yyyy', { locale: es })}</span>
                          <span>•</span>
                          <PSServiceTypeBadge 
                            type={(request.tipo_servicio as 'asistido' | 'live') || 'asistido'} 
                            size="sm" 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-3">
                      {getStatusBadge(request.estado)}
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-navy">
                          ${request.presupuesto_max.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Presupuesto máx.</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default CustomerPSDashboard;
