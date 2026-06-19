import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, DollarSign, Package, CheckCircle, ExternalLink, Calendar, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShoppingRequestChat } from '@/components/ShoppingRequestChat';

const MyRequests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actualCost, setActualCost] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [chatRequest, setChatRequest] = useState<any>(null);

  useEffect(() => {
    loadMyRequests();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const loadMyRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shopping_requests')
        .select('*, profiles!shopping_requests_customer_id_fkey(full_name, email, phone)')
        .eq('shopper_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar tus solicitudes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };

      if (newStatus === 'purchased' && actualCost) {
        updateData.actual_cost = parseFloat(actualCost);
        updateData.purchased_at = new Date().toISOString();
      }

      if (newStatus === 'shipped' && trackingNumber) {
        updateData.tracking_number = trackingNumber;
        updateData.shipped_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('shopping_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: "La solicitud ha sido actualizada correctamente"
      });

      setSelectedRequest(null);
      setActualCost('');
      setTrackingNumber('');
      loadMyRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-status-warning',
      in_purchase: 'bg-status-processing',
      purchased: 'bg-status-info',
      shipped: 'bg-status-transit',
      completed: 'bg-status-delivered',
      cancelled: 'bg-status-error'
    };
    return colors[status] || 'bg-muted';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      in_purchase: 'En Compra',
      purchased: 'Comprado',
      shipped: 'Enviado',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const filterRequests = (requests: any[], filter: string) => {
    switch (filter) {
      case 'active':
        return requests.filter(r => ['in_purchase', 'purchased', 'shipped'].includes(r.status));
      case 'completed':
        return requests.filter(r => r.status === 'completed');
      case 'cancelled':
        return requests.filter(r => r.status === 'cancelled');
      default:
        return requests;
    }
  };

  const calculateStats = () => {
    const completed = requests.filter(r => r.status === 'completed');
    const totalEarnings = completed.reduce((sum, r) => sum + Number(r.shopper_commission || 0), 0);
    const pending = requests.filter(r => ['in_purchase', 'purchased', 'shipped'].includes(r.status))
      .reduce((sum, r) => sum + Number(r.shopper_commission || 0), 0);

    return { totalEarnings, pending, completedCount: completed.length };
  };

  const stats = calculateStats();
  const filteredRequests = filterRequests(requests, activeTab);

  if (loading) {
    return (
      <DashboardLayout title="Mis Compras">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mis Compras">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-navy">Mis Compras</h2>
          <p className="text-muted-foreground">Gestiona todas tus solicitudes de compra</p>
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Ganado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">${stats.totalEarnings.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Compras completadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Comisión Pendiente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-secondary">${stats.pending.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">En compras activas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Compras Completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-navy">{stats.completedCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Requests List with Tabs */}
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="active">Activas</TabsTrigger>
            <TabsTrigger value="completed">Completadas</TabsTrigger>
            <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center">
                    <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      No hay solicitudes {activeTab !== 'all' ? `${activeTab === 'active' ? 'activas' : activeTab === 'completed' ? 'completadas' : 'canceladas'}` : 'registradas'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(request.status)}`}>
                              <ShoppingCart className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{request.product_name}</h3>
                                <Badge className={getStatusColor(request.status)}>
                                  {getStatusLabel(request.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Cliente: {request.profiles?.full_name || 'N/A'}
                              </p>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                <div>
                                  <p className="text-xs text-muted-foreground">Cantidad</p>
                                  <p className="font-medium">{request.quantity}</p>
                                </div>
                                {request.approximate_price && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Precio aprox</p>
                                    <p className="font-medium">${Number(request.approximate_price).toFixed(2)}</p>
                                  </div>
                                )}
                                {request.actual_cost && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Costo real</p>
                                    <p className="font-medium">${Number(request.actual_cost).toFixed(2)}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs text-muted-foreground">Comisión</p>
                                  <p className="font-semibold text-success">${Number(request.shopper_commission || 0).toFixed(2)}</p>
                                </div>
                              </div>

                              {request.product_description && (
                                <div className="bg-muted p-3 rounded-lg mb-3">
                                  <p className="text-sm">{request.product_description}</p>
                                </div>
                              )}

                              {request.product_url && (
                                <a
                                  href={request.product_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-3"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Ver producto original
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-3 border-t">
                          {request.tracking_number && (
                            <div className="text-sm">
                              <strong>Tracking:</strong> {request.tracking_number}
                            </div>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setChatRequest(request)}>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Chat con Cliente
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh]">
                              <DialogHeader>
                                <DialogTitle>{request.product_name}</DialogTitle>
                                <DialogDescription>
                                  Chat con {request.profiles?.full_name}
                                </DialogDescription>
                              </DialogHeader>
                              <ShoppingRequestChat
                                requestId={request.id}
                                currentUserId={currentUserId}
                                otherUserName={request.profiles?.full_name}
                              />
                            </DialogContent>
                          </Dialog>

                          {request.status === 'in_purchase' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" onClick={() => setSelectedRequest(request)}>
                                  Marcar como Comprado
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Producto Comprado</DialogTitle>
                                  <DialogDescription>
                                    Ingresa el costo real del producto
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="actualCost">Costo Real (USD)</Label>
                                    <Input
                                      id="actualCost"
                                      type="number"
                                      step="0.01"
                                      value={actualCost}
                                      onChange={(e) => setActualCost(e.target.value)}
                                      placeholder="Ej: 25.50"
                                    />
                                  </div>
                                  <Button
                                    onClick={() => handleUpdateStatus(request.id, 'purchased')}
                                    disabled={!actualCost || submitting}
                                    className="w-full"
                                  >
                                    {submitting ? 'Procesando...' : 'Confirmar Compra'}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {request.status === 'purchased' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" onClick={() => setSelectedRequest(request)}>
                                  Marcar como Enviado
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Producto Enviado</DialogTitle>
                                  <DialogDescription>
                                    Ingresa el número de tracking
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="tracking">Número de Tracking</Label>
                                    <Input
                                      id="tracking"
                                      value={trackingNumber}
                                      onChange={(e) => setTrackingNumber(e.target.value)}
                                      placeholder="Ej: USPS1234567890"
                                    />
                                  </div>
                                  <Button
                                    onClick={() => handleUpdateStatus(request.id, 'shipped')}
                                    disabled={!trackingNumber || submitting}
                                    className="w-full"
                                  >
                                    {submitting ? 'Procesando...' : 'Confirmar Envío'}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {request.tracking_number && (
                            <div className="flex items-center gap-2 text-sm bg-muted px-3 py-1 rounded">
                              <Package className="w-4 h-4" />
                              <span>Tracking: {request.tracking_number}</span>
                            </div>
                          )}
                        </div>
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

export default MyRequests;
