import { AlertTriangle, Info } from 'lucide-react';

interface PSLegalDisclaimerProps {
  variant?: 'quote' | 'payment' | 'compact';
  className?: string;
}

const PSLegalDisclaimer = ({ variant = 'quote', className = '' }: PSLegalDisclaimerProps) => {
  const disclaimerText = "Boxifly actúa como intermediario de compra. Los montos son estimados y pueden variar según disponibilidad del producto, impuestos, cargos aduaneros u otros costos aplicables.";
  
  if (variant === 'compact') {
    return (
      <p className={`text-xs text-muted-foreground flex items-start gap-1 ${className}`}>
        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <span>{disclaimerText}</span>
      </p>
    );
  }

  if (variant === 'payment') {
    return (
      <div className={`p-4 rounded-lg border border-amber-200 bg-amber-50/50 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 mb-1">Antes de pagar</p>
            <p className="text-sm text-amber-700">{disclaimerText}</p>
            <p className="text-sm text-amber-700 mt-2">
              Al proceder con el pago, confirmas que aceptas estas condiciones y autorizas a Boxifly 
              a realizar la compra en tu nombre.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default: quote variant
  return (
    <div className={`p-3 rounded-lg bg-muted/50 border border-muted ${className}`}>
      <div className="flex items-start gap-2">
        <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">{disclaimerText}</p>
      </div>
    </div>
  );
};

export default PSLegalDisclaimer;
