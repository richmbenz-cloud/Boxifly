import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ShoppingBag, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Users,
  Search,
  RefreshCcw,
  Eye
} from 'lucide-react';
import { usePSAdminStats, usePSAdminRequests, usePSAdminOrders, usePSAdminQuotes } from '@/hooks/usePSAdminData';
import PSServiceTypeBadge from '@/components/personal-shopper/PSServiceTypeBadge';
import PSNotificationBell from '@/components/personal-shopper/PSNotificationBell';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const requestStatusLabels: Record<string, { label: string; className: string }> = {
  recibida: { label: 'Recibida', className: 'bg-blue-100 text-blue-800' },
  en_revision: { label: 'En Revisión', className: 'bg-yellow-100 text-yellow-800' },
  cotizada: { label: 'Cotizada', className: 'bg-purple-100 text-purple-800' },
  aprobada: { label: 'Aprobada', className: 'bg-green-100 text-green-800' },
  rechazada: { label: 'Rechazada', className: 'bg-red-100 text-red-800' },
  cancelada: { label: 'Cancelada', className: 'bg-gray-100 text-gray-800' },
};

const orderStatusLabels: Record<string, { label: string; className: string }> = {
  solicitud_recibida: { label: 'Solicitud Recibida', className: 'bg-blue-100 text-blue-800' },
  en_revision: { label: 'En Revisión', className: 'bg-yellow-100 text-yellow-800' },
  aprobado_cliente: { label: 'Aprobado Cliente', className: 'bg-green-100 text-green-800' },
  compra_en_proceso: { label: 'Compra en Proceso', className: 'bg-orange-100 text-orange-800' },
  producto_comprado: { label: 'Producto Comprado', className: 'bg-teal-100 text-teal-800' },
  en_almacen_usa: { label: 'En Almacén USA', className: 'bg-indigo-100 text-indigo-800' },
  en_transito: { label: 'En Tránsito', className: 'bg-purple-100 text-purple-800' },
  en_aduanas: { label: 'En Aduanas', className: 'bg-pink-100 text-pink-800' },
  en_reparto: { label: 'En Reparto', className: 'bg-cyan-100 text-cyan-800' },
  entregado: { label: 'Entregado', className: 'bg-green-200 text-green-900' },
};

const quoteStatusLabels: Record<string, { label: string; className: string }> = {
  pendiente: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
  aceptada: { label: 'Aceptada', className: 'bg-green-100 text-green-800' },
  rechazada: { label: 'Rechazada', className: 'bg-red-100 text-red-800' },
  expirada: { label: 'Expirada', className: 'bg-gray-100 text-gray-800' },
  modificada: { label: 'Modificada', className: 'bg-blue-100 text-blue-800' },
};

export default function PersonalShopperAdmin() {
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = usePSAdminStats();
  const { data: requests, isLoading: requestsLoading, refetch: refetchRequests } = usePSAdminRequests(requestStatusFilter);
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = usePSAdminOrders(orderStatusFilter);
  const { data: quotes, isLoading: quotesLoading, refetch: refetchQuotes } = usePSAdminQuotes(quoteStatusFilter);

  const handleRefreshAll = () => {
    refetchStats();
    refetchRequests();
    refetchOrders();
    refetchQuotes();
  };

  const filteredRequests = requests?.filter(r => 
    r.descripcion_producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cliente?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cliente?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders?.filter(o =>
    o.cliente?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.personal_shopper?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.request?.descripcion_producto?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredQuotes = quotes?.filter(q =>
    q.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.personal_shopper?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout 
      title="Administración Personal Shopper"
      headerActions={<PSNotificationBell variant="compact" />}
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Solicitudes</CardDescription>
            <CardTitle className="text-2xl">{stats?.totalRequests || 0}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span>{stats?.pendingRequests || 0} pendientes</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Cotizadas</CardDescription>
            <CardTitle className="text-2xl">{stats?.quotedRequests || 0}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Esperando cliente</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Aprobadas</CardDescription>
            <CardTitle className="text-2xl">{stats?.approvedRequests || 0}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3" />
              <span>Listas para compra</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Órdenes Activas</CardDescription>
            <CardTitle className="text-2xl">{stats?.activeOrders || 0}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ShoppingBag className="h-3 w-3" />
              <span>En proceso</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Completadas</CardDescription>
            <CardTitle className="text-2xl">{stats?.completedOrders || 0}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3" />
              <span>Entregadas</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-navy">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Ingresos PS</CardDescription>
            <CardTitle className="text-2xl">${stats?.totalRevenue?.toFixed(0) || 0}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>Comisión Boxifly</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cotizaciones Pendientes</p>
                <p className="text-xl font-bold">{stats?.pendingQuotes || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cotizaciones Aceptadas</p>
                <p className="text-xl font-bold">{stats?.acceptedQuotes || 0}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cotizaciones Expiradas</p>
                <p className="text-xl font-bold">{stats?.expiredQuotes || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Promedio</p>
                <p className="text-xl font-bold">${stats?.avgOrderValue?.toFixed(0) || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Refresh */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por producto, cliente o shopper..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={handleRefreshAll} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests" className="gap-2">
            <FileText className="h-4 w-4" />
            Solicitudes ({filteredRequests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Órdenes ({filteredOrders?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="quotes" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Cotizaciones ({filteredQuotes?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Solicitudes de Personal Shopper</CardTitle>
                <Select value={requestStatusFilter} onValueChange={setRequestStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="recibida">Recibidas</SelectItem>
                    <SelectItem value="en_revision">En Revisión</SelectItem>
                    <SelectItem value="cotizada">Cotizadas</SelectItem>
                    <SelectItem value="aprobada">Aprobadas</SelectItem>
                    <SelectItem value="rechazada">Rechazadas</SelectItem>
                    <SelectItem value="cancelada">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Cargando solicitudes...</div>
              ) : !filteredRequests?.length ? (
                <div className="text-center py-8 text-muted-foreground">No hay solicitudes</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Presupuesto</TableHead>
                        <TableHead>Cotizaciones</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => {
                        const statusInfo = requestStatusLabels[request.estado] || { label: request.estado, className: 'bg-gray-100' };
                        return (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div className="max-w-[200px]">
                                <p className="font-medium truncate">{request.descripcion_producto}</p>
                                <p className="text-xs text-muted-foreground">{request.categoria}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{request.cliente?.full_name || 'N/A'}</p>
                                <p className="text-xs text-muted-foreground">{request.cliente?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <PSServiceTypeBadge tipoServicio={request.tipo_servicio as 'asistido' | 'live'} />
                            </TableCell>
                            <TableCell>
                              <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">${request.presupuesto_max}</span>
                              {request.presupuesto_min && (
                                <span className="text-xs text-muted-foreground"> (min: ${request.presupuesto_min})</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{request.quotes_count}</span>
                                {request.has_order && (
                                  <Badge variant="outline" className="text-xs">Con orden</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {format(new Date(request.created_at), 'dd MMM yyyy', { locale: es })}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Órdenes de Personal Shopper</CardTitle>
                <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="solicitud_recibida">Solicitud Recibida</SelectItem>
                    <SelectItem value="en_revision">En Revisión</SelectItem>
                    <SelectItem value="aprobado_cliente">Aprobado Cliente</SelectItem>
                    <SelectItem value="compra_en_proceso">Compra en Proceso</SelectItem>
                    <SelectItem value="producto_comprado">Producto Comprado</SelectItem>
                    <SelectItem value="en_almacen_usa">En Almacén USA</SelectItem>
                    <SelectItem value="en_transito">En Tránsito</SelectItem>
                    <SelectItem value="en_aduanas">En Aduanas</SelectItem>
                    <SelectItem value="en_reparto">En Reparto</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="text-center py-8 text-muted-foreground">Cargando órdenes...</div>
              ) : !filteredOrders?.length ? (
                <div className="text-center py-8 text-muted-foreground">No hay órdenes</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Shopper</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Comisión</TableHead>
                        <TableHead>Aprobación</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => {
                        const statusInfo = orderStatusLabels[order.estado] || { label: order.estado, className: 'bg-gray-100' };
                        return (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div className="max-w-[180px]">
                                <p className="font-medium truncate">{order.request?.descripcion_producto || 'N/A'}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <PSServiceTypeBadge tipoServicio={order.request?.tipo_servicio as 'asistido' | 'live'} size="sm" />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.cliente?.full_name || 'N/A'}</p>
                                <p className="text-xs text-muted-foreground">{order.cliente?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.personal_shopper?.full_name || 'N/A'}</p>
                                <p className="text-xs text-muted-foreground">{order.personal_shopper?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-bold">${order.total_cliente.toFixed(2)}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-green-600 font-medium">${order.comision_boxifly.toFixed(2)}</span>
                            </TableCell>
                            <TableCell>
                              {order.requires_client_approval ? (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Requiere
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  OK
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {format(new Date(order.created_at), 'dd MMM yyyy', { locale: es })}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Cotizaciones de Personal Shopper</CardTitle>
                <Select value={quoteStatusFilter} onValueChange={setQuoteStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendientes</SelectItem>
                    <SelectItem value="aceptada">Aceptadas</SelectItem>
                    <SelectItem value="rechazada">Rechazadas</SelectItem>
                    <SelectItem value="expirada">Expiradas</SelectItem>
                    <SelectItem value="modificada">Modificadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {quotesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Cargando cotizaciones...</div>
              ) : !filteredQuotes?.length ? (
                <div className="text-center py-8 text-muted-foreground">No hay cotizaciones</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Shopper</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Servicio</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Activa</TableHead>
                        <TableHead>Expira</TableHead>
                        <TableHead>Creada</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuotes.map((quote) => {
                        const statusInfo = quoteStatusLabels[quote.estado] || { label: quote.estado, className: 'bg-gray-100' };
                        const isExpired = quote.expires_at && new Date(quote.expires_at) < new Date();
                        return (
                          <TableRow key={quote.id}>
                            <TableCell>
                              <div className="max-w-[180px]">
                                <p className="font-medium truncate">{quote.nombre_producto}</p>
                                <p className="text-xs text-muted-foreground">{quote.request?.categoria}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{quote.personal_shopper?.full_name || 'N/A'}</p>
                                <p className="text-xs text-muted-foreground">{quote.personal_shopper?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                            </TableCell>
                            <TableCell>${quote.precio_producto.toFixed(2)}</TableCell>
                            <TableCell>${quote.costo_servicio.toFixed(2)}</TableCell>
                            <TableCell>
                              <span className="font-bold">${quote.total_estimado.toFixed(2)}</span>
                            </TableCell>
                            <TableCell>
                              {quote.es_seleccionada ? (
                                <Badge className="bg-green-100 text-green-800">Sí</Badge>
                              ) : (
                                <span className="text-muted-foreground">No</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {quote.expires_at ? (
                                <span className={`text-sm ${isExpired ? 'text-red-600' : ''}`}>
                                  {format(new Date(quote.expires_at), 'dd MMM', { locale: es })}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {format(new Date(quote.created_at), 'dd MMM yyyy', { locale: es })}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Panel de Supervisión</p>
              <p className="text-sm text-blue-700">
                Este panel es solo de visualización. Las operaciones de cotización y avance de estados 
                son gestionadas exclusivamente por el Personal Shopper asignado y el cliente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
