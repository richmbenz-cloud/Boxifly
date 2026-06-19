import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Warehouse, 
  PackageCheck, 
  Boxes, 
  Plane, 
  Ship, 
  MapPin, 
  Truck, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimelineEvent {
  id: string;
  status: string;
  created_at: string;
  notes: string | null;
  updated_by: string | null;
}

interface PackageTimelineProps {
  packageId: string;
}

const statusConfig: Record<string, { 
  label: string; 
  icon: any; 
  color: string; 
  description: string;
}> = {
  prealerted: {
    label: 'Prealertado',
    icon: Package,
    color: 'bg-blue-500',
    description: 'Paquete registrado en el sistema'
  },
  received_warehouse: {
    label: 'Recibido en Almacén',
    icon: Warehouse,
    color: 'bg-purple-500',
    description: 'Llegó a nuestro almacén en EE.UU.'
  },
  ready_consolidation: {
    label: 'Listo para Consolidar',
    icon: PackageCheck,
    color: 'bg-indigo-500',
    description: 'Preparado para consolidación'
  },
  consolidated: {
    label: 'Consolidado',
    icon: Boxes,
    color: 'bg-violet-500',
    description: 'Consolidado con otros paquetes'
  },
  ready_international: {
    label: 'Listo para Envío Internacional',
    icon: Plane,
    color: 'bg-sky-500',
    description: 'Preparado para envío a Perú'
  },
  in_transit: {
    label: 'En Tránsito Internacional',
    icon: Ship,
    color: 'bg-cyan-500',
    description: 'En camino a Perú'
  },
  arrived_peru: {
    label: 'Llegó a Perú',
    icon: MapPin,
    color: 'bg-teal-500',
    description: 'En proceso de nacionalización'
  },
  ready_delivery: {
    label: 'Listo para Entrega',
    icon: Truck,
    color: 'bg-green-500',
    description: 'Listo para entrega final'
  },
  delivered: {
    label: 'Entregado',
    icon: CheckCircle,
    color: 'bg-emerald-500',
    description: 'Paquete entregado al cliente'
  }
};

const PackageTimeline = ({ packageId }: PackageTimelineProps) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [packageId]);

  const fetchTimeline = async () => {
    const { data, error } = await supabase
      .from('package_timeline')
      .select('*')
      .eq('package_id', packageId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTimeline(data);
    }
    setLoading(false);
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Línea de Tiempo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          {timeline.map((event, index) => {
            const config = statusConfig[event.status];
            const Icon = config?.icon || Package;

            return (
              <div key={event.id} className="relative flex gap-4">
                {/* Icon */}
                <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${config?.color || 'bg-gray-500'} text-white`}>
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">
                      {config?.label || event.status}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {format(new Date(event.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {config?.description || 'Actualización de estado'}
                  </p>

                  {event.notes && (
                    <div className="mt-2 rounded-lg bg-muted p-3">
                      <p className="text-sm">{event.notes}</p>
                    </div>
                  )}

                  {event.updated_by && (
                    <p className="text-xs text-muted-foreground">
                      Actualizado por: {event.updated_by}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {timeline.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay eventos registrados aún
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageTimeline;
