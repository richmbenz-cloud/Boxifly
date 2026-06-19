import { Bell, Tag, CheckCircle, XCircle, AlertCircle, MessageSquare, Clock, ShoppingBag, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { usePSNotifications, PSNotification, PSNotificationType } from '@/hooks/usePSNotifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const NOTIFICATION_CONFIG: Record<PSNotificationType, { 
  icon: typeof Bell; 
  badgeClass: string; 
  label: string;
}> = {
  nueva_solicitud: {
    icon: ShoppingBag,
    badgeClass: 'bg-primary text-white',
    label: 'Nueva Solicitud',
  },
  cotizacion_creada: {
    icon: Tag,
    badgeClass: 'bg-primary text-white',
    label: 'Cotización',
  },
  cotizacion_modificada: {
    icon: Tag,
    badgeClass: 'bg-status-info text-white',
    label: 'Cotización Modificada',
  },
  cotizacion_aceptada: {
    icon: CheckCircle,
    badgeClass: 'bg-status-delivered text-white',
    label: 'Aceptada',
  },
  cotizacion_rechazada: {
    icon: XCircle,
    badgeClass: 'bg-destructive text-white',
    label: 'Rechazada',
  },
  cambio_estado: {
    icon: Clock,
    badgeClass: 'bg-status-transit text-white',
    label: 'Estado',
  },
  aprobacion_requerida: {
    icon: AlertCircle,
    badgeClass: 'bg-status-warning text-foreground',
    label: 'Aprobación Requerida',
  },
  mensaje_nuevo: {
    icon: MessageSquare,
    badgeClass: 'bg-status-info text-white',
    label: 'Mensaje',
  },
  recordatorio: {
    icon: Bell,
    badgeClass: 'bg-muted text-foreground',
    label: 'Recordatorio',
  },
};

interface PSNotificationBellProps {
  variant?: 'default' | 'compact';
  onNotificationClick?: (notification: PSNotification) => void;
}

const PSNotificationBell = ({ 
  variant = 'default',
  onNotificationClick 
}: PSNotificationBellProps) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = usePSNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: PSNotification) => {
    markAsRead(notification.id);
    
    if (onNotificationClick) {
      onNotificationClick(notification);
      return;
    }

    // Default navigation based on notification type
    if (notification.request_id) {
      navigate(`/cliente/personal-shopper?request=${notification.request_id}`);
    } else if (notification.order_id) {
      navigate(`/cliente/personal-shopper?order=${notification.order_id}`);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size={variant === 'compact' ? 'sm' : 'icon'} 
          className="relative"
        >
          <Bell className={variant === 'compact' ? 'h-4 w-4' : 'h-5 w-5'} />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-white text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Notificaciones PS</h3>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3" />
              <p className="text-sm text-muted-foreground">Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No tienes notificaciones PS</p>
              <p className="text-xs text-muted-foreground mt-1">
                Las actualizaciones de tus solicitudes aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const config = NOTIFICATION_CONFIG[notification.tipo] || NOTIFICATION_CONFIG.recordatorio;
                const Icon = config.icon;
                
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                      !notification.is_read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 p-2 rounded-full ${
                        !notification.is_read ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          !notification.is_read ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`text-xs ${config.badgeClass}`}>
                            {config.label}
                          </Badge>
                          {!notification.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className={`font-medium text-sm line-clamp-1 ${
                          !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.titulo}
                        </p>
                        
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.mensaje}
                        </p>
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: es
                          })}
                        </p>
                      </div>
                      
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-2" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default PSNotificationBell;
