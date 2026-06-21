import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shield } from "lucide-react";

export const PaymentMethodCard = () => {
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
               <CardContent>
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
