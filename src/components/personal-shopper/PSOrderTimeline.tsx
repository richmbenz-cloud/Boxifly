import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ClipboardCheck, Search, ThumbsUp, ShoppingCart, Package, 
  Warehouse, Plane, FileCheck, Truck, CheckCircle, XCircle
} from 'lucide-react';

interface StatusHistoryItem {
  id: string;
  estado: string;
  comentario: string | null;
  created_at: string;
}

interface PSOrderTimelineProps {
  currentStatus: string;
  statusHistory: StatusHistoryItem[];
  isCancelled?: boolean;
}

// Estados del Personal Shopper con íconos y labels propios
const PS_STATUSES = [
  { key: 'solicitud_recibida', label: 'Solicitud Recibida', icon: ClipboardCheck, description: 'Tu solicitud fue registrada' },
  { key: 'en_revision', label: 'En Revisión', icon: Search, description: 'Boxifly está evaluando tu solicitud' },
  { key: 'aprobado_cliente', label: 'Aprobado por Cliente', icon: ThumbsUp, description: 'Aprobaste la cotización' },
  { key: 'compra_en_proceso', label: 'Compra en Proceso', icon: ShoppingCart, description: 'El shopper está realizando la compra' },
  { key: 'producto_comprado', label: 'Producto Comprado', icon: Package, description: 'Tu producto fue comprado exitosamente' },
  { key: 'en_almacen_usa', label: 'En Almacén USA', icon: Warehouse, description: 'Recibido en nuestro almacén en EE.UU.' },
  { key: 'en_transito', label: 'En Tránsito Internacional', icon: Plane, description: 'En camino a Perú' },
  { key: 'en_aduanas', label: 'En Aduanas', icon: FileCheck, description: 'Proceso de liberación aduanera' },
  { key: 'en_reparto', label: 'En Reparto', icon: Truck, description: 'En camino a tu dirección' },
  { key: 'entregado', label: 'Entregado', icon: CheckCircle, description: '¡Tu pedido fue entregado!' },
];

const PSOrderTimeline = ({ currentStatus, statusHistory, isCancelled }: PSOrderTimelineProps) => {
  const currentIndex = PS_STATUSES.findIndex(s => s.key === currentStatus);
  
  // Crear un mapa de estados ya alcanzados con sus fechas
  const statusDates = new Map<string, string>();
  statusHistory.forEach(sh => {
    if (!statusDates.has(sh.estado)) {
      statusDates.set(sh.estado, sh.created_at);
    }
  });

  return (
    <div className="space-y-1">
      {PS_STATUSES.map((status, index) => {
        const StatusIcon = status.icon;
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex && !isCancelled;
        const isPending = index > currentIndex;
        const dateReached = statusDates.get(status.key);
        
        // Si el pedido está cancelado, marcar todo como inactivo excepto los completados
        const showAsCancelled = isCancelled && index >= currentIndex;
        
        return (
          <div key={status.key} className="relative">
            {/* Línea conectora */}
            {index < PS_STATUSES.length - 1 && (
              <div 
                className={`absolute left-[18px] top-10 w-0.5 h-8 ${
                  isCompleted && !showAsCancelled ? 'bg-status-delivered' : 
                  isCurrent && !showAsCancelled ? 'bg-primary' : 
                  'bg-muted'
                }`} 
              />
            )}
            
            <div className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${
              isCurrent && !showAsCancelled ? 'bg-primary/5 border border-primary/20' : 
              isCompleted && !showAsCancelled ? 'bg-status-delivered/5' : 
              ''
            }`}>
              {/* Ícono del estado */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                showAsCancelled ? 'bg-muted text-muted-foreground' :
                isCompleted ? 'bg-status-delivered text-white' :
                isCurrent ? 'bg-primary text-white animate-pulse' :
                'bg-muted text-muted-foreground'
              }`}>
                {showAsCancelled && index === currentIndex ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <StatusIcon className="h-5 w-5" />
                )}
              </div>
              
              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`font-medium ${
                    showAsCancelled ? 'text-muted-foreground line-through' :
                    isCurrent ? 'text-primary' :
                    isCompleted ? 'text-foreground' :
                    'text-muted-foreground'
                  }`}>
                    {showAsCancelled && index === currentIndex ? 'Cancelado' : status.label}
                  </p>
                  {dateReached && !showAsCancelled && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(dateReached), "dd MMM", { locale: es })}
                    </span>
                  )}
                </div>
                
                <p className={`text-sm ${
                  isCurrent && !showAsCancelled ? 'text-muted-foreground' : 'text-muted-foreground/70'
                }`}>
                  {showAsCancelled && index === currentIndex 
                    ? 'Este pedido fue cancelado' 
                    : status.description
                  }
                </p>
                
                {/* Comentario del historial si existe */}
                {statusHistory.find(sh => sh.estado === status.key)?.comentario && (
                  <p className="text-xs text-primary mt-1 italic">
                    "{statusHistory.find(sh => sh.estado === status.key)?.comentario}"
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PSOrderTimeline;
