import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, FileText, Clock, CheckCircle, XCircle, Edit, RefreshCw, Star 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { usePSQuotes, PSQuote } from '@/hooks/usePSQuotes';
import { useCreatePSQuote } from '@/hooks/useCreatePSQuote';
import PSCreateQuoteForm from './PSCreateQuoteForm';

interface PSQuotesManagerProps {
  requestId: string;
  requestDescription: string;
  requestStatus: string;
  presupuestoMax: number;
  presupuestoMin?: number;
  canCreateQuote: boolean; // Based on request status
}

const PSQuotesManager = ({
  requestId,
  requestDescription,
  requestStatus,
  presupuestoMax,
  presupuestoMin,
  canCreateQuote,
}: PSQuotesManagerProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<PSQuote | null>(null);

  const { quotes, isLoading, getQuoteStatusInfo, getTimeRemaining, isQuoteExpired } = usePSQuotes(requestId);
  const { selectQuote, isSelecting } = useCreatePSQuote();

  const activeQuote = quotes.find(q => q.es_seleccionada && q.estado === 'pendiente');
  const hasAcceptedQuote = quotes.some(q => q.estado === 'aceptada');

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    setEditingQuote(null);
  };

  const handleEditQuote = (quote: PSQuote) => {
    setEditingQuote(quote);
    setShowCreateForm(true);
  };

  const handleSelectQuote = (quoteId: string) => {
    selectQuote({ quoteId, requestId });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  // If creating or editing
  if (showCreateForm) {
    return (
      <PSCreateQuoteForm
        requestId={requestId}
        requestDescription={requestDescription}
        presupuestoMax={presupuestoMax}
        presupuestoMin={presupuestoMin}
        existingQuote={editingQuote}
        onSuccess={handleCreateSuccess}
        onCancel={() => {
          setShowCreateForm(false);
          setEditingQuote(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Create Quote Button */}
      {canCreateQuote && !hasAcceptedQuote && (
        <Button 
          onClick={() => setShowCreateForm(true)} 
          className="w-full gap-2"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          Crear Nueva Cotización
        </Button>
      )}

      {/* Has accepted quote message */}
      {hasAcceptedQuote && (
        <Alert className="bg-status-delivered/10 border-status-delivered">
          <CheckCircle className="h-4 w-4 text-status-delivered" />
          <AlertDescription className="text-status-delivered">
            El cliente ha aceptado una cotización. El pedido está en proceso.
          </AlertDescription>
        </Alert>
      )}

      {/* Quotes list */}
      {quotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay cotizaciones para esta solicitud</p>
            {canCreateQuote && (
              <Button 
                onClick={() => setShowCreateForm(true)} 
                className="mt-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Crear Primera Cotización
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">
            Historial de Cotizaciones ({quotes.length})
          </h4>
          
          {quotes.map((quote) => {
            const statusInfo = getQuoteStatusInfo(quote);
            const timeRemaining = getTimeRemaining(quote);
            const expired = isQuoteExpired(quote);
            const isActive = quote.es_seleccionada && quote.estado === 'pendiente';

            return (
              <Card 
                key={quote.id}
                className={`${isActive ? 'border-primary ring-2 ring-primary/20' : ''} ${expired ? 'opacity-60' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate flex items-center gap-2">
                        {quote.nombre_producto}
                        {isActive && (
                          <Star className="h-4 w-4 text-primary fill-primary" />
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(quote.created_at), "dd MMM yyyy HH:mm", { locale: es })}
                      </CardDescription>
                    </div>
                    <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  {/* Time remaining */}
                  {timeRemaining && quote.estado === 'pendiente' && !expired && (
                    <p className={`text-sm flex items-center gap-1 ${
                      timeRemaining.includes('hora') || timeRemaining.includes('minuto') 
                        ? 'text-destructive' 
                        : 'text-muted-foreground'
                    }`}>
                      <Clock className="h-3 w-3" />
                      {timeRemaining}
                    </p>
                  )}

                  {/* Price breakdown */}
                  <div className="bg-muted/50 p-3 rounded-lg space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Producto</span>
                      <span>${quote.precio_producto.toFixed(2)}</span>
                    </div>
                    {quote.impuestos_estimados && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Impuestos</span>
                        <span>${quote.impuestos_estimados.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Servicio</span>
                      <span>${quote.costo_servicio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-1 border-t">
                      <span>Total</span>
                      <span className="text-primary">${quote.total_estimado.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Rejection reason */}
                  {quote.razon_rechazo && (
                    <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-sm">
                      <p className="font-medium text-destructive mb-1 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Motivo del rechazo:
                      </p>
                      <p className="text-muted-foreground">{quote.razon_rechazo}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {quote.estado === 'pendiente' && !expired && canCreateQuote && !hasAcceptedQuote && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-1"
                        onClick={() => handleEditQuote(quote)}
                      >
                        <Edit className="h-3 w-3" />
                        Modificar
                      </Button>
                      {!quote.es_seleccionada && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 gap-1"
                          onClick={() => handleSelectQuote(quote.id)}
                          disabled={isSelecting}
                        >
                          <Star className="h-3 w-3" />
                          Marcar Activa
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Expired quote - can create new */}
                  {expired && quote.estado === 'pendiente' && canCreateQuote && !hasAcceptedQuote && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-1"
                      onClick={() => handleEditQuote(quote)}
                    >
                      <RefreshCw className="h-3 w-3" />
                      Crear Nueva basada en esta
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PSQuotesManager;
