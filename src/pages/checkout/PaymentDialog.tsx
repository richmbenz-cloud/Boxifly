import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RefObject } from "react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentFormRef: RefObject<HTMLDivElement>;
}

export const PaymentDialog = ({ open, onOpenChange, paymentFormRef }: PaymentDialogProps) => {
  return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Pagar con tarjeta</DialogTitle>
              <DialogDescription>
                Completa tus datos de pago de forma segura
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div 
                id="izipay-payment-form" 
                ref={paymentFormRef}
                className="min-h-[400px]"
              />
            </div>
          </DialogContent>
        </Dialog>
  );
};
