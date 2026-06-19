import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, Package, Link2, FileText, Clock, Send, 
  Calculator, Info, AlertTriangle 
} from 'lucide-react';
import { useCreatePSQuote, CreateQuoteData, UpdateQuoteData } from '@/hooks/useCreatePSQuote';
import { PSQuote } from '@/hooks/usePSQuotes';

interface PSCreateQuoteFormProps {
  requestId: string;
  requestDescription: string;
  presupuestoMax: number;
  presupuestoMin?: number;
  existingQuote?: PSQuote | null; // For editing
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PSCreateQuoteForm = ({
  requestId,
  requestDescription,
  presupuestoMax,
  presupuestoMin,
  existingQuote,
  onSuccess,
  onCancel,
}: PSCreateQuoteFormProps) => {
  const { createQuote, updateQuote, isCreating, isUpdating } = useCreatePSQuote();

  const [formData, setFormData] = useState({
    nombreProducto: existingQuote?.nombre_producto || '',
    descripcion: existingQuote?.descripcion || '',
    urlProducto: existingQuote?.url_producto || '',
    precioProducto: existingQuote?.precio_producto?.toString() || '',
    impuestosEstimados: existingQuote?.impuestos_estimados?.toString() || '',
    costoServicio: existingQuote?.costo_servicio?.toString() || '',
    notasPs: existingQuote?.notas_ps || '',
    expiresInDays: '3',
  });

  const precioProducto = parseFloat(formData.precioProducto) || 0;
  const impuestos = parseFloat(formData.impuestosEstimados) || 0;
  const costoServicio = parseFloat(formData.costoServicio) || 0;
  const totalEstimado = precioProducto + impuestos + costoServicio;

  const isOverBudget = totalEstimado > presupuestoMax;
  const isUnderBudget = presupuestoMin && totalEstimado < presupuestoMin;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombreProducto.trim()) {
      return;
    }

    if (existingQuote) {
      // Update existing quote
      const updateData: UpdateQuoteData = {
        quoteId: existingQuote.id,
        nombreProducto: formData.nombreProducto,
        descripcion: formData.descripcion || undefined,
        urlProducto: formData.urlProducto || undefined,
        precioProducto,
        impuestosEstimados: impuestos || undefined,
        costoServicio,
        notasPs: formData.notasPs || undefined,
        expiresInDays: parseInt(formData.expiresInDays),
      };
      updateQuote(updateData, { onSuccess });
    } else {
      // Create new quote
      const createData: CreateQuoteData = {
        requestId,
        nombreProducto: formData.nombreProducto,
        descripcion: formData.descripcion || undefined,
        urlProducto: formData.urlProducto || undefined,
        precioProducto,
        impuestosEstimados: impuestos || undefined,
        costoServicio,
        notasPs: formData.notasPs || undefined,
        expiresInDays: parseInt(formData.expiresInDays),
      };
      createQuote(createData, { onSuccess });
    }
  };

  return (
    <Card className="border-2 border-dashed border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          {existingQuote ? 'Modificar Cotización' : 'Crear Nueva Cotización'}
        </CardTitle>
        <CardDescription>
          {existingQuote 
            ? 'La cotización anterior se marcará como reemplazada'
            : `Para: ${requestDescription.substring(0, 80)}${requestDescription.length > 80 ? '...' : ''}`
          }
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Budget info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Presupuesto del cliente: {presupuestoMin ? `$${presupuestoMin} - ` : ''}${presupuestoMax}
            </AlertDescription>
          </Alert>

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="nombreProducto" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Nombre del Producto *
            </Label>
            <Input
              id="nombreProducto"
              value={formData.nombreProducto}
              onChange={(e) => setFormData({ ...formData, nombreProducto: e.target.value })}
              placeholder="Ej: Nike Air Max 270 - Talla 42"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Descripción (opcional)
            </Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Detalles adicionales del producto..."
              rows={3}
            />
          </div>

          {/* Product URL */}
          <div className="space-y-2">
            <Label htmlFor="urlProducto" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              URL del Producto (opcional)
            </Label>
            <Input
              id="urlProducto"
              type="url"
              value={formData.urlProducto}
              onChange={(e) => setFormData({ ...formData, urlProducto: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <Separator />

          {/* Pricing */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Desglose de Precios
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precioProducto">Precio del Producto ($) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="precioProducto"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-8"
                    value={formData.precioProducto}
                    onChange={(e) => setFormData({ ...formData, precioProducto: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="impuestosEstimados">Impuestos Est. ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="impuestosEstimados"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-8"
                    value={formData.impuestosEstimados}
                    onChange={(e) => setFormData({ ...formData, impuestosEstimados: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="costoServicio">Costo Servicio ($) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="costoServicio"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-8"
                    value={formData.costoServicio}
                    onChange={(e) => setFormData({ ...formData, costoServicio: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Estimado:</span>
                <span className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-primary'}`}>
                  ${totalEstimado.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Budget warnings */}
            {isOverBudget && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  El total excede el presupuesto máximo del cliente (${presupuestoMax})
                </AlertDescription>
              </Alert>
            )}

            {isUnderBudget && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  El total está por debajo del presupuesto mínimo (${presupuestoMin})
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Expiration */}
          <div className="space-y-2">
            <Label htmlFor="expiresInDays" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Validez de la Cotización
            </Label>
            <Select
              value={formData.expiresInDays}
              onValueChange={(value) => setFormData({ ...formData, expiresInDays: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 día</SelectItem>
                <SelectItem value="2">2 días</SelectItem>
                <SelectItem value="3">3 días (recomendado)</SelectItem>
                <SelectItem value="5">5 días</SelectItem>
                <SelectItem value="7">7 días</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notasPs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notas para el Cliente (opcional)
            </Label>
            <Textarea
              id="notasPs"
              value={formData.notasPs}
              onChange={(e) => setFormData({ ...formData, notasPs: e.target.value })}
              placeholder="Información adicional, alternativas, observaciones..."
              rows={3}
            />
          </div>
        </CardContent>

        <CardFooter className="flex gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
          )}
          <Button 
            type="submit" 
            className="flex-1 gap-2"
            disabled={isCreating || isUpdating || !formData.nombreProducto.trim() || !formData.precioProducto || !formData.costoServicio}
          >
            <Send className="h-4 w-4" />
            {isCreating || isUpdating 
              ? 'Enviando...' 
              : existingQuote 
                ? 'Enviar Cotización Actualizada' 
                : 'Enviar Cotización'
            }
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PSCreateQuoteForm;
