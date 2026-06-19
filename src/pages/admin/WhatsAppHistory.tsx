import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageSquare, Search, CheckCircle, Package } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface WhatsAppMessage {
  id: string;
  package_id: string;
  user_id: string;
  message_type: string;
  content: string;
  status: string;
  tracking_number: string | null;
  timestamp: string;
}

const WhatsAppHistory = () => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<WhatsAppMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();

    // Suscribirse a nuevos mensajes en tiempo real
    const channel = supabase
      .channel('whatsapp-messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages'
        },
        (payload) => {
          console.log('New WhatsApp message:', payload);
          setMessages(prev => [payload.new as WhatsAppMessage, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredMessages(
        messages.filter(msg =>
          msg.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.message_type.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredMessages(messages);
    }
  }, [searchTerm, messages]);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (!error && data) {
      setMessages(data);
      setFilteredMessages(data);
    }
    setLoading(false);
  };

  const getMessageTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      received_warehouse: 'Recibido en Warehouse',
      consolidated: 'Consolidado',
      in_transit: 'En Tránsito a Perú',
      ready_delivery: 'Listo para Recojo'
    };
    return typeMap[type] || type;
  };

  const getMessageTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      received_warehouse: 'bg-status-processing text-white',
      consolidated: 'bg-status-info text-white',
      in_transit: 'bg-status-transit text-white',
      ready_delivery: 'bg-success text-white'
    };
    return colorMap[type] || 'bg-muted';
  };

  const stats = {
    total: messages.length,
    sent: messages.filter(m => m.status === 'sent').length,
    today: messages.filter(m => {
      const msgDate = new Date(m.timestamp);
      const today = new Date();
      return msgDate.toDateString() === today.toDateString();
    }).length
  };

  return (
    <DashboardLayout title="Historial WhatsApp">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardDescription>Total Mensajes</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <MessageSquare className="h-8 w-8 text-primary opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardDescription>Enviados</CardDescription>
            <CardTitle className="text-3xl font-bold text-success">{stats.sent}</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckCircle className="h-8 w-8 text-success opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-info">
          <CardHeader className="pb-3">
            <CardDescription>Hoy</CardDescription>
            <CardTitle className="text-3xl font-bold text-status-info">{stats.today}</CardTitle>
          </CardHeader>
          <CardContent>
            <MessageSquare className="h-8 w-8 text-status-info opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por tracking, contenido o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensajes Enviados
          </CardTitle>
          <CardDescription>
            Historial completo de notificaciones WhatsApp enviadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando mensajes...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron mensajes' : 'No hay mensajes enviados aún'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {message.tracking_number && (
                          <span className="font-mono text-sm font-semibold">
                            {message.tracking_number}
                          </span>
                        )}
                        <Badge className={getMessageTypeColor(message.message_type)}>
                          {getMessageTypeLabel(message.message_type)}
                        </Badge>
                        {message.status === 'sent' && (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Enviado
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm mb-2">{message.content}</p>

                      <p className="text-xs text-muted-foreground">
                        {format(new Date(message.timestamp), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default WhatsAppHistory;
