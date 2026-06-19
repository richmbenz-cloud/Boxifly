import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type PaymentMethod = 'yape' | 'plin' | 'bank_transfer';

export interface PaymentData {
  transactionId: string;
  method: PaymentMethod;
  amount: number;
  timestamp: string;
  qrCode?: string;
  phone?: string;
  reference: string;
  instructions: string;
  expiresAt: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountType: string;
    holderName: string;
    ruc: string;
    cci: string;
  };
}

export const usePaymentGateway = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const initiatePayment = async (
    paymentId: string,
    method: PaymentMethod,
    amount: number
  ) => {
    setLoading(true);
    try {
      // Call payment initiation edge function
      const { data, error } = await supabase.functions.invoke('payment-initiate', {
        body: {
          paymentId,
          method,
          amount,
        },
      });

      if (error) {
        console.error('Error initiating payment:', error);
        toast({
          title: "Error",
          description: "No se pudo iniciar el proceso de pago",
          variant: "destructive"
        });
        return { success: false, error };
      }

      console.log('Payment initiated successfully:', data);
      setPaymentData(data.data);

      toast({
        title: "Pago Iniciado",
        description: `Proceso de pago por ${method.toUpperCase()} iniciado exitosamente`,
      });

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Exception initiating payment:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar el pago",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId: string) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('payment_status, transaction_id, paid_at')
        .eq('id', paymentId)
        .single();

      if (error) {
        console.error('Error checking payment status:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Exception checking payment status:', error);
      return { success: false, error };
    }
  };

  return {
    loading,
    paymentData,
    initiatePayment,
    checkPaymentStatus,
  };
};
