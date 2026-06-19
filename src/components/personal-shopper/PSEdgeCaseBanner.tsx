import { AlertTriangle, Package, DollarSign, RefreshCw, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type EdgeCaseType = 
  | 'sin_stock' 
  | 'cambio_precio' 
  | 'ajuste_adicional' 
  | 'reembolso_parcial' 
  | 'reembolso_total' 
  | 'cancelado_cliente' 
  | 'cancelado_boxifly';

interface PSEdgeCaseBannerProps {
  type: EdgeCaseType;
  details?: string;
  amount?: number;
  onAction?: () => void;
  actionLabel?: string;
}

const EDGE_CASE_CONFIG: Record<EdgeCaseType, {
  title: string;
  description: string;
  icon: typeof AlertTriangle;
  bgClass: string;
  borderClass: string;
  iconClass: string;
  textClass: string;
}> = {
  sin_stock: {
    title: 'Producto sin Stock',
    description: 'El producto solicitado ya no está disponible. Te ofreceremos alternativas o procederemos con el reembolso.',
    icon: Package,
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    iconClass: 'text-amber-600',
    textClass: 'text-amber-800',
  },
  cambio_precio: {
    title: 'Cambio de Precio',
    description: 'El precio del producto cambió desde la cotización original. Se requiere tu aprobación para continuar.',
    icon: DollarSign,
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    iconClass: 'text-amber-600',
    textClass: 'text-amber-800',
  },
  ajuste_adicional: {
    title: 'Ajuste Adicional Requerido',
    description: 'Se requiere un pago adicional por costos no previstos (impuestos, envío especial, etc.).',
    icon: RefreshCw,
    bgClass: 'bg-primary/5',
    borderClass: 'border-primary/20',
    iconClass: 'text-primary',
    textClass: 'text-primary',
  },
  reembolso_parcial: {
    title: 'Reembolso Parcial Procesado',
    description: 'Se ha procesado un reembolso parcial a tu cuenta.',
    icon: RefreshCw,
    bgClass: 'bg-status-info/10',
    borderClass: 'border-status-info/20',
    iconClass: 'text-status-info',
    textClass: 'text-status-info',
  },
  reembolso_total: {
    title: 'Reembolso Total Procesado',
    description: 'Se ha procesado el reembolso completo de tu pedido.',
    icon: RefreshCw,
    bgClass: 'bg-status-delivered/10',
    borderClass: 'border-status-delivered/20',
    iconClass: 'text-status-delivered',
    textClass: 'text-status-delivered',
  },
  cancelado_cliente: {
    title: 'Pedido Cancelado',
    description: 'Cancelaste este pedido. Si corresponde, el reembolso será procesado según nuestras políticas.',
    icon: XCircle,
    bgClass: 'bg-muted',
    borderClass: 'border-muted',
    iconClass: 'text-muted-foreground',
    textClass: 'text-muted-foreground',
  },
  cancelado_boxifly: {
    title: 'Pedido Cancelado por Boxifly',
    description: 'Este pedido fue cancelado. Nos comunicaremos contigo para explicar los motivos y procesar el reembolso.',
    icon: AlertCircle,
    bgClass: 'bg-destructive/10',
    borderClass: 'border-destructive/20',
    iconClass: 'text-destructive',
    textClass: 'text-destructive',
  },
};

const PSEdgeCaseBanner = ({ type, details, amount, onAction, actionLabel }: PSEdgeCaseBannerProps) => {
  const config = EDGE_CASE_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border ${config.bgClass} ${config.borderClass}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.iconClass}`} />
        <div className="flex-1">
          <p className={`font-medium ${config.textClass}`}>{config.title}</p>
          <p className={`text-sm mt-1 ${config.textClass} opacity-80`}>{config.description}</p>
          
          {details && (
            <p className={`text-sm mt-2 ${config.textClass} opacity-70 italic`}>{details}</p>
          )}
          
          {amount !== undefined && (
            <p className={`text-lg font-bold mt-2 ${config.textClass}`}>
              {type.includes('reembolso') ? '+ ' : ''}${amount.toFixed(2)}
            </p>
          )}
          
          {onAction && actionLabel && (
            <Button 
              size="sm" 
              className="mt-3"
              variant={type.includes('cancelado') ? 'outline' : 'default'}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PSEdgeCaseBanner;
