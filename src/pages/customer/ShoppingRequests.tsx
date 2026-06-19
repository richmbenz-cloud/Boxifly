import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, MessageCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShoppingRequestChat } from '@/components/ShoppingRequestChat';

const ShoppingRequests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    product_name: '',
    product_url: '',
    product_description: '',
    quantity: 1,
    approximate_price: '',
    special_notes: ''
  });

  useEffect(() => {
    loadRequests();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const loadRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shopping_requests')
        .select('*, profiles!shopping_requests_shopper_id_fkey(full_name, email)')
        .eq('customer_id', user.id)
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

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('shopping_requests')
        .insert({
          customer_id: user.id,
          product_name: formData.product_name,
          product_url: formData.product_url || null,
          product_description: formData.product_description || null,
          quantity: formData.quantity,
          approximate_price: formData.approximate_price ? parseFloat(formData.approximate_price) : null,
          special_notes: formData.special_notes || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Solicitud creada",
        description: "Tu solicitud de compra ha sido publicada"
      });

      setShowNewRequest(false);
      setFormData({
        product_name: '',
        product_url: '',
        product_description: '',
        quantity: 1,
        approximate_price: '',
        special_notes: ''
      });
      loadRequests();
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

  if (loading) {
    return (
      <DashboardLayout title="Compras por Encargo">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Compras por Encargo">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Compras por Encargo</h1>
            <p className="text-muted-foreground">Solicita productos que no encuentras</p>
          </div>
          <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Solicitud
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nueva Solicitud de Compra</DialogTitle>
                <DialogDescription>
                  Describe el producto que necesitas y un shopper lo comprará por ti
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <Label htmlFor="product_name">Nombre del Producto *</Label>
                  <Input
                    id="product_name"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="product_url">URL del Producto (opcional)</Label>
                  <Input
                    id="product_url"
                    type="url"
                    value={formData.product_url}
                    onChange={(e) => setFormData({ ...formData, product_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="product_description">Descripción</Label>
                  <Textarea
                    id="product_description"
                    value={formData.product_description}
                    onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Cantidad</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="approximate_price">Precio Aproximado (USD)</Label>
                    <Input
                      id="approximate_price"
                      type="number"
                      step="0.01"
                      value={formData.approximate_price}
                      onChange={(e) => setFormData({ ...formData, approximate_price: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="special_notes">Notas Especiales</Label>
                  <Textarea
                    id="special_notes"
                    value={formData.special_notes}
                    onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowNewRequest(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Creando...' : 'Crear Solicitud'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tienes solicitudes</h3>
              <p className="text-muted-foreground mb-4">Crea tu primera solicitud de compra</p>
              <Button onClick={() => setShowNewRequest(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Solicitud
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{request.product_name}</CardTitle>
                      <CardDescription>
                        Creada el {format(new Date(request.created_at), "dd 'de' MMMM, yyyy", { locale: es })}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusLabel(request.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {request.product_description && (
                        <p className="text-sm text-muted-foreground">{request.product_description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span>Cantidad: <strong>{request.quantity}</strong></span>
                        {request.approximate_price && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <strong>${request.approximate_price}</strong> (aprox)
                          </span>
                        )}
                      </div>
                      {request.shopper_id && request.profiles && (
                        <p className="text-sm">
                          <strong>Shopper:</strong> {request.profiles.full_name}
                        </p>
                      )}
                      {request.shopper_commission && (
                        <p className="text-sm">
                          <strong>Comisión:</strong> ${request.shopper_commission}
                        </p>
                      )}
                    </div>
                    {request.shopper_id && (
                      <div className="flex items-center justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={() => setSelectedRequest(request)}>
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Abrir Chat
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
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ShoppingRequests;
