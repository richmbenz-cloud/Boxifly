
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentInitiateRequest {
  paymentId: string;
  method: 'yape' | 'plin' | 'bank_transfer';
  amount: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Payment initiation request received');

    const body: PaymentInitiateRequest = await req.json();
    const { paymentId, method, amount } = body;

    console.log('Initiating payment:', { paymentId, method, amount });

    // Generate mock payment data based on method
    const paymentData = generateMockPaymentData(method, amount);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // [SEGURIDAD] Auto-confirmacion FALSA eliminada: antes marcaba el pago como 'paid'
    // sin dinero real. El pago queda 'pending' hasta una confirmacion real
    // (webhook del proveedor o confirmacion manual de admin).

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment initiated successfully',
        data: paymentData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in payment initiation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function generateMockPaymentData(method: string, amount: number) {
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const timestamp = new Date().toISOString();

  switch (method) {
    case 'yape':
      return {
        transactionId,
        method: 'yape',
        amount,
        timestamp,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=yape://pay?amount=${amount}&reference=${transactionId}`,
        phone: '+51987654321',
        reference: transactionId,
        instructions: 'Escanea el código QR con la app de Yape para completar el pago',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      };

    case 'plin':
      return {
        transactionId,
        method: 'plin',
        amount,
        timestamp,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=plin://pay?amount=${amount}&reference=${transactionId}`,
        phone: '+51987654321',
        reference: transactionId,
        instructions: 'Escanea el código QR con la app de Plin para completar el pago',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      };

    case 'bank_transfer':
      return {
        transactionId,
        method: 'bank_transfer',
        amount,
        timestamp,
        bankDetails: {
          bankName: 'Banco de Crédito del Perú (BCP)',
          accountNumber: '194-1234567-0-89',
          accountType: 'Cuenta Corriente',
          holderName: 'Boxifly SAC',
          ruc: '20123456789',
          cci: '00219400123456708912',
        },
        reference: transactionId,
        instructions: 'Realiza la transferencia a la cuenta indicada usando la referencia proporcionada. El pago se confirmará automáticamente en 1-2 horas hábiles.',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

    default:
      throw new Error('Invalid payment method');
  }
}
