import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Truck,
  PackageCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { usePackageTracking } from '@/hooks/usePackageTracking';

interface CheckpointFeedProps {
  packageId: string;
}

// Mapea los `tag` de AfterShip al label/ícono/color que mostramos al cliente.
const tagConfig: Record<string, { label: string; icon: any; color: string }> = {
  InfoReceived: { label: 'Información recibida', icon: Package, color: 'text-blue-500' },
  InTransit: { label: 'En tránsito', icon: Truck, color: 'text-cyan-500' },
  OutForDelivery: { label: 'En reparto', icon: Truck, color: 'text-amber-500' },
  AttemptFail: { label: 'Intento de entrega fallido', icon: AlertTriangle, color: 'text-orange-500' },
  Delivered: { label: 'Entregado', icon: CheckCircle, color: 'text-emerald-500' },
  AvailableForPickup: { label: 'Disponible para recojo', icon: PackageCheck, color: 'text-teal-500' },
  Exception: { label: 'Excepción', icon: AlertTriangle, color: 'text-red-500' },
  Expired: { label: 'Expirado', icon: Clock, color: 'text-gray-500' },
  Pending: { label: 'Pendiente', icon: Clock, color: 'text-gray-400' },
};

const CheckpointFeed = ({ packageId }: CheckpointFeedProps) => {
  const { events, loading } = usePackageTracking(packageId);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si todavía no hay checkpoints del carrier, no mostramos la tarjeta vacía.
  if (events.length === 0) {
    return null;
  }

  const carrier = events[0]?.carrier;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Seguimiento del Transportista
          </CardTitle>
          <div className="flex items-center gap-2">
            {carrier && carrier !== 'unknown' && (
              <Badge variant="outline" className="text-xs uppercase">
                {carrier}
              </Badge>
            )}
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              En vivo
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {/* Línea vertical del feed */}
          <div className="absolute left-4 top-1 bottom-1 w-0.5 bg-border" />

          {events.map((event, index) => {
            const config = tagConfig[event.status] || {
              label: event.status,
              icon: Package,
              color: 'text-muted-foreground',
            };
            const Icon = config.icon;
            const isLatest = index === 0;

            return (
              <div key={event.id} className="relative flex gap-4">
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background ${
                    isLatest ? 'border-primary' : 'border-border'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>

                <div className="flex-1 space-y-1 pb-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <h4 className={`text-sm font-semibold ${isLatest ? 'text-foreground' : 'text-foreground/90'}`}>
                      {config.label}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {format(new Date(event.event_timestamp), "dd MMM yyyy, HH:mm", { locale: es })}
                    </Badge>
                  </div>

                  {event.location && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </p>
                  )}

                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckpointFeed;
