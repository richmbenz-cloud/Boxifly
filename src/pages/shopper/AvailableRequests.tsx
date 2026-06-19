import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, DollarSign, Package, ExternalLink, Search, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AvailableRequests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [proposedCommission, setProposedCommission] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAvailableRequests();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = requests.filter(req =>
        req.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.product_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRequests(filtered);
    } else {
      setFilteredRequests(requests);
    }
  }, [searchTerm, requests]);

  const loadAvailableRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check verification status
      const { data: profile } = await supabase
        .from('profiles')
        .select('shopper_verified')
        .eq('id', user.id)
        .single();

      setIsVerified(profile?.shopper_verified || false);

      if (!profile?.shopper_verified) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('shopping_requests')
        .select('*, profiles!shopping_requests_customer_id_fkey(full_name, email)')
        .is('shopper_id', null)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
      setFilteredRequests(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes disponibles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!selectedRequest || !proposedCommission) {
      toast({
        title: "Campos incompletos",
        description: "Por favor ingresa tu comisión propuesta",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('shopping_requests')
        .update({
          shopper_id: user.id,
          status: 'in_purchase',
          shopper_commission: parseFloat(proposedCommission)
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: "¡Solicitud aceptada!",
        description: "La solicitud ha sido asignada a tu lista de compras"
      });

      setSelectedRequest(null);
      setProposedCommission('');
      setNotes('');
      loadAvailableRequests();
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

  const calculateSuggestedCommission = (req: any) => {
    const baseCommission = 15; // $15 base
    const valuePercent = (req.approximate_price || 0) * 0.10; // 10% of product value
    return Math.max(baseCommission, valuePercent).toFixed(2);
  };

  if (loading) {
    return (
      <DashboardLayout title="Solicitudes Disponibles">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (isVerified === false) {
    return (
      <DashboardLayout title="Solicitudes Disponibles">
        <Card className="border-l-4 border-l-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <Clock className="h-6 w-6" />
              Cuenta No Verificada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Tu cuenta debe ser verificada por un administrador antes de poder ver solicitudes disponibles.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Solicitudes Disponibles">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-navy">Solicitudes Disponibles</h2>
            <p className="text-muted-foreground">Selecciona productos para comprar y gana comisiones</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Buscar por producto o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Info Alert */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-navy">¿Cómo funciona?</p>
                <p className="text-sm text-muted-foreground">
                  1. Revisa las solicitudes de clientes<br />
                  2. Acepta las que puedas comprar<br />
                  3. Compra el producto y actualiza el estado<br />
                  4. Envíalo y recibe tu comisión
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests Grid */}
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No se encontraron solicitudes con ese criterio' : 'No hay solicitudes disponibles en este momento'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((req) => (
              <Card key={req.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        {req.product_name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Cliente: {req.profiles?.full_name || 'N/A'}
                      </CardDescription>
                    </div>
                    <Badge className="bg-status-warning">Disponible</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cantidad:</span>
                      <span className="font-medium">{req.quantity}</span>
                    </div>
                    {req.approximate_price && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Precio aprox:</span>
                        <span className="font-medium">${Number(req.approximate_price).toFixed(2)}</span>
                      </div>
                    )}
                    {req.product_url && (
                      <a
                        href={req.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver producto
                      </a>
                    )}
                    {req.product_description && (
                      <div className="bg-muted p-3 rounded-lg text-sm">
                        <p className="text-muted-foreground line-clamp-3">{req.product_description}</p>
                      </div>
                    )}
                    {req.special_notes && (
                      <div className="bg-secondary/10 p-3 rounded-lg text-sm">
                        <p className="font-medium text-navy mb-1">Notas especiales:</p>
                        <p className="text-muted-foreground">{req.special_notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Comisión sugerida:</span>
                      <span className="font-bold text-success flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {calculateSuggestedCommission(req)}
                      </span>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full"
                          onClick={() => setSelectedRequest(req)}
                        >
                          Aceptar Solicitud
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Aceptar Solicitud de Compra</DialogTitle>
                          <DialogDescription>
                            Completa los detalles para {req.product_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                            <p><strong>Producto:</strong> {req.product_name}</p>
                            <p><strong>Cantidad:</strong> {req.quantity}</p>
                            {req.approximate_price && (
                              <p><strong>Precio aproximado:</strong> ${Number(req.approximate_price).toFixed(2)}</p>
                            )}
                            <p><strong>Cliente:</strong> {req.profiles?.full_name}</p>
                            {req.product_description && (
                              <p><strong>Descripción:</strong> {req.product_description}</p>
                            )}
                            {req.special_notes && (
                              <p><strong>Notas:</strong> {req.special_notes}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="commission">Tu Comisión (USD) *</Label>
                            <Input
                              id="commission"
                              type="number"
                              step="0.01"
                              placeholder={calculateSuggestedCommission(req)}
                              value={proposedCommission}
                              onChange={(e) => setProposedCommission(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                              Sugerido: ${calculateSuggestedCommission(req)} USD
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="notes">Notas Adicionales (opcional)</Label>
                            <Textarea
                              id="notes"
                              placeholder="Información adicional sobre la compra..."
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              rows={3}
                            />
                          </div>

                          <Button
                            onClick={handleAcceptRequest}
                            disabled={submitting}
                            className="w-full"
                          >
                            {submitting ? 'Procesando...' : 'Confirmar y Aceptar'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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

export default AvailableRequests;
