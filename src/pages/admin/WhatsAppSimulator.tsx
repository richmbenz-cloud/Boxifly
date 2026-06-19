import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useWhatsAppNotifications } from '@/hooks/useWhatsAppNotifications';
import { MessageSquare, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const WhatsAppSimulator = () => {
  const { toast } = useToast();
  const { sendPackageStatusNotification } = useWhatsAppNotifications();
  const [loading, setLoading] = useState(false);
  const [sentMessages, setSentMessages] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    phone: '+51999999999',
    customerName: 'Juan Pérez',
    trackingNumber: 'BOX123456',
    status: 'received_warehouse',
  });

  const handleSendNotification = async () => {
    if (!formData.phone || !formData.customerName || !formData.trackingNumber) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await sendPackageStatusNotification(
        'mock-user-id',
        formData.phone,
        formData.customerName,
        formData.trackingNumber,
        formData.status
      );

      if (result.success) {
        toast({
          title: "Notificación Enviada",
          description: "La notificación de WhatsApp ha sido enviada exitosamente (mock)",
        });

        setSentMessages(prev => [{
          ...formData,
          timestamp: new Date().toISOString(),
          messageId: result.data?.data?.messageId || 'N/A',
        }, ...prev]);
      } else {
        toast({
          title: "Error",
          description: "No se pudo enviar la notificación de WhatsApp",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar la notificación",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const statusLabels: Record<string, string> = {
    prealerted: 'Prealertado',
    received_warehouse: 'Recibido en Warehouse',
    ready_consolidation: 'Listo para Consolidar',
    consolidated: 'Consolidado',
    in_transit: 'En Tránsito',
    arrived_peru: 'Llegó a Perú',
    ready_delivery: 'Listo para Entrega',
    delivered: 'Entregado',
  };

  return (
    <DashboardLayout title="Simulador de WhatsApp">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Enviar Notificación de WhatsApp
            </CardTitle>
            <CardDescription>
              Simulador del Mock de WhatsApp Cloud API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono del Cliente</Label>
              <Input
                id="phone"
                placeholder="+51999999999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Nombre del Cliente</Label>
              <Input
                id="customerName"
                placeholder="Juan Pérez"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tracking">Número de Tracking</Label>
              <Input
                id="tracking"
                placeholder="BOX123456"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado del Paquete</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSendNotification}
              disabled={loading}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Enviando...' : 'Enviar Notificación'}
            </Button>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Nota:</strong> Este es un simulador del Mock de WhatsApp Cloud API. 
                Las notificaciones no se envían realmente, pero se registran en los logs del sistema.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Messages History */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Mensajes Enviados</CardTitle>
            <CardDescription>
              Últimas notificaciones simuladas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sentMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No se han enviado mensajes aún</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sentMessages.map((msg, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{msg.customerName}</span>
                      <Badge variant="outline">{statusLabels[msg.status]}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>📱 {msg.phone}</p>
                      <p>📦 {msg.trackingNumber}</p>
                      <p className="text-xs">🕐 {new Date(msg.timestamp).toLocaleString('es-PE')}</p>
                      <p className="text-xs font-mono">ID: {msg.messageId}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WhatsAppSimulator;
