import { Bell, Tag, MessageSquare, AlertCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PSNotification {
  id: string;
  type: 'nueva_cotizacion' | 'accion_requerida' | 'mensaje_shopper';
  title: string;
  message: string;
  requestId?: string;
  isRead: boolean;
  createdAt: Date;
}

interface PSNotificationsPlaceholderProps {
  notifications: PSNotification[];
  onNotificationClick?: (notification: PSNotification) => void;
  onViewAll?: () => void;
}

const NOTIFICATION_CONFIG = {
  nueva_cotizacion: {
    icon: Tag,
    badgeClass: 'bg-primary text-white',
    label: 'Cotización',
  },
  accion_requerida: {
    icon: AlertCircle,
    badgeClass: 'bg-status-warning text-foreground',
    label: 'Acción Requerida',
  },
  mensaje_shopper: {
    icon: MessageSquare,
    badgeClass: 'bg-status-info text-white',
    label: 'Mensaje',
  },
};

const PSNotificationsPlaceholder = ({ 
  notifications, 
  onNotificationClick, 
  onViewAll 
}: PSNotificationsPlaceholderProps) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones PS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No tienes notificaciones pendientes
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones PS
            {unreadCount > 0 && (
              <Badge className="bg-destructive text-white ml-1">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              Ver todas
            </Button>
          )}
        </div>
        <CardDescription>Actualizaciones de tus solicitudes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.slice(0, 5).map((notification) => {
            const config = NOTIFICATION_CONFIG[notification.type];
            const Icon = config.icon;
            
            return (
              <div 
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                  !notification.isRead ? 'bg-primary/5 border-primary/20' : 'border-muted'
                }`}
                onClick={() => onNotificationClick?.(notification)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  !notification.isRead ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  <Icon className={`h-4 w-4 ${!notification.isRead ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={`text-xs ${config.badgeClass}`}>
                      {config.label}
                    </Badge>
                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className={`text-sm font-medium line-clamp-1 ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {notification.message}
                  </p>
                </div>
                
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PSNotificationsPlaceholder;
