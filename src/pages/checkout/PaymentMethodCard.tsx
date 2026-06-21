import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Currency } from "@/lib/currency";

interface PaymentMethodCardProps {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  sbsVenta?: number;
  margin?: number;
  rateLoading?: boolean;
  rateError?: boolean;
}

export const PaymentMethodCard = ({
  currency,
  setCurrency,
  sbsVenta,
  margin,
  rateLoading,
  rateError,
}: PaymentMethodCardProps) => {
  const marginPct = margin != null ? Math.round(margin * 1000) / 10 : 2;
  const usdDisabled = rateError || (rateLoading && sbsVenta == null);

  return (
    <>
             <Card className="shadow-md hover:shadow-lg transition-shadow">
               <CardHeader className="pb-4">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-primary/10 rounded-lg">
                     <CreditCard className="h-5 w-5 text-primary" />
                   </div>
                   <div>
                     <CardTitle className="text-xl">Método de pago</CardTitle>
                     <p className="text-sm text-muted-foreground mt-0.5">
                       Pago seguro con tarjeta de crédito o débito procesado por Izipay
                     </p>
                   </div>
                 </div>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="flex items-center space-x-3 p-3 border-2 rounded-lg">
                   <div className="p-2 rounded-lg bg-primary/10">
                     <CreditCard className="h-5 w-5 text-primary" />
                   </div>
                   <div className="flex-1">
                     <div className="font-semibold text-sm">Tarjeta de crédito/débito</div>
                     <div className="text-xs text-muted-foreground">
                       Visa, Mastercard y Amex a través de la pasarela segura de Izipay
                     </div>
                   </div>
                 </div>

                 {/* Currency selector: pay in soles (native) or US dollars */}
                 <div>
                   <div className="text-sm font-medium mb-2">Moneda de pago</div>
                   <div className="grid grid-cols-2 gap-2">
                     <button
                       type="button"
                       onClick={() => setCurrency('PEN')}
                       aria-pressed={currency === 'PEN'}
                       className={cn(
                         "flex flex-col items-start rounded-lg border-2 p-3 text-left transition-colors",
                         currency === 'PEN'
                           ? "border-primary bg-primary/5"
                           : "border-muted hover:border-primary/40"
                       )}
                     >
                       <span className="font-semibold text-sm">Soles</span>
                       <span className="text-xs text-muted-foreground">S/ · PEN</span>
                     </button>
                     <button
                       type="button"
                       onClick={() => !usdDisabled && setCurrency('USD')}
                       aria-pressed={currency === 'USD'}
                       disabled={usdDisabled}
                       className={cn(
                         "flex flex-col items-start rounded-lg border-2 p-3 text-left transition-colors",
                         currency === 'USD'
                           ? "border-primary bg-primary/5"
                           : "border-muted hover:border-primary/40",
                         usdDisabled && "opacity-50 cursor-not-allowed hover:border-muted"
                       )}
                     >
                       <span className="font-semibold text-sm flex items-center gap-1">
                         Dólares
                         {rateLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                       </span>
                       <span className="text-xs text-muted-foreground">US$ · USD</span>
                     </button>
                   </div>

                   {currency === 'USD' && sbsVenta != null && (
                     <p className="text-xs text-muted-foreground mt-2">
                       Tipo de cambio SBS/SUNAT venta S/ {sbsVenta.toFixed(3)} + {marginPct}% margen.
                       El total se cobra en dólares al tipo de cambio del día.
                     </p>
                   )}
                   {rateError && (
                     <p className="text-xs text-destructive mt-2">
                       No se pudo obtener el tipo de cambio. Puedes pagar en soles.
                     </p>
                   )}
                 </div>
               </CardContent>
             </Card>
            <div className="flex items-center justify-center gap-2 text-muted-foreground p-3 bg-muted/30 rounded-lg">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs">
                Datos protegidos con encriptación SSL
              </span>
            </div>
    </>
  );
};
