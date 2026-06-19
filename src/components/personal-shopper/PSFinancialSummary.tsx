import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, CreditCard, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface Payment {
  id: string;
  monto: number;
  estado: string;
  moneda: string | null;
}

interface PSFinancialSummaryProps {
  totalCotizado: number;
  payments: Payment[];
  orderStatus?: string;
}

type FinancialStatus = 'pendiente' | 'parcial' | 'pagado' | 'ajuste';

const PSFinancialSummary = ({ totalCotizado, payments, orderStatus }: PSFinancialSummaryProps) => {
  // Calcular totales
  const totalPagado = payments
    .filter(p => p.estado === 'completado')
    .reduce((sum, p) => sum + p.monto, 0);
  
  const saldoPendiente = Math.max(0, totalCotizado - totalPagado);
  
  // Determinar estado financiero
  const getFinancialStatus = (): FinancialStatus => {
    if (totalPagado === 0 && totalCotizado > 0) return 'pendiente';
    if (totalPagado > 0 && totalPagado < totalCotizado) return 'parcial';
    if (totalPagado >= totalCotizado && totalCotizado > 0) return 'pagado';
    if (totalPagado > totalCotizado) return 'ajuste';
    return 'pendiente';
  };
  
  const financialStatus = getFinancialStatus();
  
  const statusConfig: Record<FinancialStatus, { label: string; className: string; icon: typeof DollarSign }> = {
    pendiente: { 
      label: 'Pago Pendiente', 
      className: 'bg-status-warning text-foreground',
      icon: Clock
    },
    parcial: { 
      label: 'Pago Parcial', 
      className: 'bg-primary text-white',
      icon: RefreshCw
    },
    pagado: { 
      label: 'Pagado', 
      className: 'bg-status-delivered text-white',
      icon: CheckCircle
    },
    ajuste: { 
      label: 'Ajuste Pendiente', 
      className: 'bg-status-info text-white',
      icon: AlertCircle
    },
  };
  
  const config = statusConfig[financialStatus];
  const StatusIcon = config.icon;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Resumen Financiero
          </CardTitle>
          <Badge className={config.className}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Cotizado</span>
            <span className="font-semibold">${totalCotizado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Pagado</span>
            <span className="font-semibold text-status-delivered">
              ${totalPagado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Saldo Pendiente</span>
            <span className={`font-bold text-lg ${saldoPendiente > 0 ? 'text-destructive' : 'text-status-delivered'}`}>
              ${saldoPendiente.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          {payments.length > 0 && (
            <>
              <Separator />
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  Historial de pagos ({payments.length})
                </p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center text-sm py-1">
                      <span className={payment.estado === 'completado' ? 'text-status-delivered' : 'text-muted-foreground'}>
                        {payment.estado === 'completado' ? '✓' : '○'} ${payment.monto.toFixed(2)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {payment.estado === 'completado' ? 'Pagado' : 
                         payment.estado === 'pendiente' ? 'Pendiente' : 
                         payment.estado === 'procesando' ? 'Procesando' : payment.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PSFinancialSummary;
