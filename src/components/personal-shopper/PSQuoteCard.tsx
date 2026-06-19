import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, ExternalLink, Clock, AlertTriangle, Timer, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PSQuote, usePSQuotes } from '@/hooks/usePSQuotes';
import PSLegalDisclaimer from './PSLegalDisclaimer';

interface PSQuoteCardProps {
  quote: PSQuote;
  requestId: string;
  requestStatus: string;
  serviceType: 'asistido' | 'live';
}

const PSQuoteCard = ({ quote, requestId, requestStatus, serviceType }: PSQuoteCardProps) => {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const {
    approveQuote,
    rejectQuote,
    isApproving,
    isRejecting,
    isQuoteExpired,
    getQuoteStatusInfo,
    getTimeRemaining,
  } = usePSQuotes(requestId);

  const statusInfo = getQuoteStatusInfo(quote);
  const timeRemaining = getTimeRemaining(quote);
  const expired = isQuoteExpired(quote);
  const canRespond = quote.estado === 'pendiente' && !expired && requestStatus === 'cotizada';

  const handleApprove = () => {
    approveQuote(quote.id);
    setShowApproveDialog(false);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectQuote({ quoteId: quote.id, razon: rejectReason });
    setShowRejectDialog(false);
    setRejectReason('');
  };

  return (
    <>
      <Card className={`transition-all ${quote.es_seleccionada ? 'border-primary ring-2 ring-primary/20' : ''} ${expired ? 'opacity-60' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{quote.nombre_producto}</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-2 mt-1">
                <span>Cotización del {format(new Date(quote.created_at), 'dd MMM yyyy', { locale: es })}</span>
                {serviceType === 'live' && (
                  <Badge variant="outline" className="text-xs">Live</Badge>
                )}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
              {quote.es_seleccionada && (
                <Badge className="bg-primary text-primary-foreground">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Seleccionada
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Time remaining warning */}
          {timeRemaining && quote.estado === 'pendiente' && !expired && (
            <Alert className={`${timeRemaining.includes('hora') || timeRemaining.includes('minuto') ? 'border-destructive bg-destructive/10' : 'border-status-warning bg-status-warning/10'}`}>
              <Timer className="h-4 w-4" />
              <AlertDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{timeRemaining}</span>
                {(timeRemaining.includes('hora') || timeRemaining.includes('minuto')) && (
                  <span className="text-sm">- ¡Responde pronto!</span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Expired warning */}
          {expired && quote.estado === 'pendiente' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Esta cotización ha expirado. Puedes solicitar una nueva.
              </AlertDescription>
            </Alert>
          )}

          {/* Description */}
          {quote.descripcion && (
            <p className="text-sm text-muted-foreground">{quote.descripcion}</p>
          )}

          {/* Product URL */}
          {quote.url_producto && (
            <a 
              href={quote.url_producto} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1 text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Ver producto original
            </a>
          )}

          <Separator />

          {/* Price breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Precio del producto</span>
              <span className="font-medium">${quote.precio_producto.toFixed(2)}</span>
            </div>
            {quote.impuestos_estimados && quote.impuestos_estimados > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Impuestos estimados</span>
                <span>${quote.impuestos_estimados.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Costo de servicio Boxifly</span>
              <span>${quote.costo_servicio.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Estimado</span>
              <span className="text-primary">${quote.total_estimado.toFixed(2)}</span>
            </div>
          </div>

          {/* PS Notes */}
          {quote.notas_ps && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">Nota del Personal Shopper:</p>
              <p className="text-sm text-muted-foreground">{quote.notas_ps}</p>
            </div>
          )}

          {/* Rejection reason */}
          {quote.razon_rechazo && (
            <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              <p className="text-sm font-medium mb-1 text-destructive">Motivo del rechazo:</p>
              <p className="text-sm text-muted-foreground">{quote.razon_rechazo}</p>
            </div>
          )}

          {/* Action buttons */}
          {canRespond && (
            <>
              <PSLegalDisclaimer variant="quote" className="mt-4" />
              
              <div className="flex gap-3 pt-2">
                <Button 
                  className="flex-1 gap-2" 
                  onClick={() => setShowApproveDialog(true)}
                  disabled={isApproving || isRejecting}
                >
                  <CheckCircle className="h-4 w-4" />
                  {isApproving ? 'Procesando...' : 'Aprobar Cotización'}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isApproving || isRejecting}
                >
                  <XCircle className="h-4 w-4" />
                  Rechazar
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Approve Confirmation Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Confirmar Aprobación
            </DialogTitle>
            <DialogDescription>
              Al aprobar esta cotización, autorizas a Boxifly a proceder con la compra del producto.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-medium">{quote.nombre_producto}</p>
              <p className="text-2xl font-bold text-primary">${quote.total_estimado.toFixed(2)}</p>
            </div>
            
            <PSLegalDisclaimer variant="compact" />
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Tu aprobación quedará registrada con fecha, hora y firma digital para tu seguridad.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} disabled={isApproving}>
              {isApproving ? 'Procesando...' : 'Confirmar Aprobación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Cotización</DialogTitle>
            <DialogDescription>
              Por favor, indícanos el motivo del rechazo para que podamos ofrecerte una mejor alternativa.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Ej: El precio está fuera de mi presupuesto, necesito otro modelo, etc."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={!rejectReason.trim() || isRejecting}
            >
              {isRejecting ? 'Procesando...' : 'Rechazar Cotización'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PSQuoteCard;
