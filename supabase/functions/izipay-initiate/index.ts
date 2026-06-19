import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IzipayPaymentRequest {
  amount: number;
  orderId: string;
  currency?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  description?: string;
}

interface IzipayPaymentResponse {
  success: boolean;
  formToken?: string;
  transactionId?: string;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Izipay payment initiation request received');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: IzipayPaymentRequest = await req.json();
    const { amount, orderId, currency = 'PEN', email, firstName, lastName, description } = body;

    console.log('Initiating Izipay payment:', { amount, orderId, currency, email });

    // Get Izipay credentials from secrets
    const izipaySecret = Deno.env.get('IZIPAY_TEST_API_KEY');
    if (!izipaySecret) {
      throw new Error('Izipay API key not configured');
    }

    // Build Basic Auth credentials: if the secret already contains "user:password"
    // we use it as is; otherwise we prepend the default shopId
    const shopId = Deno.env.get('IZIPAY_SHOP_ID') || '35764467';
    const basicCredentials = izipaySecret.includes(':')
      ? izipaySecret
      : `${shopId}:${izipaySecret}`;

    // Izipay API endpoint (test environment)
    const izipayUrl = 'https://api.micuentaweb.pe/api-payment/V4/Charge/CreatePayment';

    // Prepare payment data for Izipay
    const paymentData = {
      amount: amount * 100, // Izipay expects amount in cents
      currency: currency,
      orderId: orderId,
      customer: {
        email: email,
        billingDetails: {
          firstName: firstName || '',
          lastName: lastName || '',
        }
      },
      ...(description && { description })
    };

    console.log('Sending request to Izipay:', paymentData);

    // Call Izipay API to create payment
    const izipayResponse = await fetch(izipayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(basicCredentials)}`, // Izipay uses Basic Auth (user:password)
      },
      body: JSON.stringify(paymentData),
    });

    const izipayResult = await izipayResponse.json();
    console.log('Izipay response status:', izipayResponse.status);
    console.log('Izipay response:', JSON.stringify(izipayResult, null, 2));

    // Check for Izipay API errors
    if (izipayResult.status === 'ERROR' && izipayResult.answer?.errorCode) {
      const errorCode = izipayResult.answer.errorCode;
      const errorMessage = izipayResult.answer.errorMessage;
      
      console.error('Izipay API Error:', { errorCode, errorMessage });
      
      // Provide helpful error messages
      if (errorCode === 'INT_905') {
        throw new Error(
          'Error de autenticación con Izipay: Clave privada inválida. ' +
          'Verifica que estés usando la clave PRIVADA de test (no la clave pública). ' +
          'La clave pública (para frontend) empieza típicamente con letras mayúsculas, ' +
          'mientras que la clave privada es diferente y se obtiene del dashboard de Izipay.'
        );
      }
      
      throw new Error(`Error de Izipay [${errorCode}]: ${errorMessage}`);
    }

    if (!izipayResponse.ok) {
      throw new Error(`Izipay HTTP error: ${izipayResponse.status} - ${JSON.stringify(izipayResult)}`);
    }

    // Extract form token from Izipay response
    const formToken = izipayResult.answer?.formToken;
    const transactionId = izipayResult.answer?.transactionUuid || `IZI-${Date.now()}`;

    if (!formToken) {
      console.error('No formToken in response. Full response:', izipayResult);
      throw new Error('No form token received from Izipay. Check logs for details.');
    }
    
    console.log('Payment created successfully. Transaction ID:', transactionId);

    // Log payment initiation in database (convert amount to cents/integer)
    const { error: logError } = await supabaseClient
      .from('payments_webhooks')
      .insert({
        event_type: 'izipay.payment.initiated',
        charge_id: transactionId,
        amount: Math.round(amount * 100), // Convert to cents (integer)
        status: 'pending',
        raw: {
          orderId,
          email,
          amount_original: amount,
          formToken: formToken.substring(0, 20) + '...', // Log partial token for security
          timestamp: new Date().toISOString(),
        },
      });

    if (logError) {
      console.error('Error logging payment initiation:', logError);
    }

    const response: IzipayPaymentResponse = {
      success: true,
      formToken,
      transactionId,
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in Izipay payment initiation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    const response: IzipayPaymentResponse = {
      success: false,
      error: errorMessage,
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
