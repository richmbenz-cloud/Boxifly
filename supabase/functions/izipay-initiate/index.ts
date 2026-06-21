import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IzipayPaymentRequest {
  orderId: string;
  // Customer-selected charge currency. The AMOUNT is ALWAYS resolved
  // server-side from the order/payment record — never trusted from the client.
  currency?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  description?: string;
  // Deprecated client-provided fields. Kept only for backwards compatibility /
  // tamper detection logging. They are NEVER used to compute the charge.
  amount?: number;
  exchangeRate?: number | null;
  baseAmountPen?: number;
}

interface IzipayPaymentResponse {
  success: boolean;
  formToken?: string;
  transactionId?: string;
  error?: string;
}

// YYYY-MM-DD in America/Lima (matches the exchange-rate edge function).
function limaToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
}

/**
 * Resolve the canonical order total in soles (PEN) from the database.
 * The same orderId can reference either an `orders` row (store checkout) or a
 * `payments` row (package payment). Returns null if neither exists.
 */
async function resolveCanonicalPen(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  orderId: string
): Promise<number | null> {
  const { data: order } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('id', orderId)
    .maybeSingle();
  if (order && order.total_amount != null) return Number(order.total_amount);

  const { data: payment } = await supabase
    .from('payments')
    .select('amount')
    .eq('id', orderId)
    .maybeSingle();
  if (payment && payment.amount != null) return Number(payment.amount);

  return null;
}

/**
 * Fetch today's effective PEN->USD rate SERVER-SIDE (SBS venta + margin).
 * Reads the daily cache first; if missing, invokes the `exchange-rate`
 * function (which fetches + caches it). Returns null if unavailable.
 */
async function getEffectiveRate(
  // deno-lint-ignore no-explicit-any
  supabase: any
): Promise<number | null> {
  const today = limaToday();
  const { data: cached } = await supabase
    .from('exchange_rates')
    .select('effective_rate')
    .eq('rate_date', today)
    .eq('base_currency', 'USD')
    .eq('quote_currency', 'PEN')
    .maybeSingle();
  if (cached && cached.effective_rate) return Number(cached.effective_rate);

  try {
    const url = `${Deno.env.get('SUPABASE_URL')}/functions/v1/exchange-rate`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ base: 'USD', quote: 'PEN' }),
    });
    const body = await resp.json();
    return body?.effective_rate ? Number(body.effective_rate) : null;
  } catch (err) {
    console.error('Failed to fetch effective rate from exchange-rate function:', err);
    return null;
  }
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
    const {
      orderId,
      currency = 'PEN',
      email,
      firstName,
      lastName,
      description,
      amount: clientAmount, // only for tamper logging
    } = body;

    if (!orderId) {
      throw new Error('orderId es requerido');
    }

    // --- SERVER-AUTHORITATIVE AMOUNT ---------------------------------------
    // Resolve the canonical PEN total from the DB. The client NEVER dictates
    // the charge amount (prevents payment tampering, e.g. paying S/1).
    const canonicalPen = await resolveCanonicalPen(supabaseClient, orderId);
    if (canonicalPen == null || !(canonicalPen > 0)) {
      throw new Error('Orden no encontrada o con monto inválido');
    }

    // Compute the charge amount/currency server-side.
    let chargeAmount = canonicalPen;
    let chargeCurrency = 'PEN';
    let effectiveRate: number | null = null;

    if (currency === 'USD') {
      effectiveRate = await getEffectiveRate(supabaseClient);
      if (!effectiveRate || effectiveRate <= 0) {
        throw new Error('Tipo de cambio no disponible. Intenta nuevamente o paga en soles.');
      }
      // amount_usd = amount_pen / effective_rate (effective_rate already
      // includes the margin so the FX spread never produces a loss).
      chargeAmount = Math.round((canonicalPen / effectiveRate) * 100) / 100;
      chargeCurrency = 'USD';
    }

    // Defense-in-depth: log if the (ignored) client amount diverges from the
    // server-computed charge — a strong tamper signal worth auditing.
    if (typeof clientAmount === 'number' && Math.abs(clientAmount - chargeAmount) > 0.01) {
      console.warn('Client amount mismatch (ignored, using server value):', {
        orderId,
        client: clientAmount,
        server: chargeAmount,
        currency: chargeCurrency,
      });
    }

    console.log('Initiating Izipay payment (server-authoritative):', {
      orderId,
      chargeAmount,
      chargeCurrency,
      canonicalPen,
      effectiveRate,
      email,
    });

    // Amount in the smallest currency unit (cents). Round to avoid
    // floating-point artifacts (e.g. 19.99 * 100 = 1998.9999...).
    const amountInCents = Math.round(chargeAmount * 100);

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
      amount: amountInCents, // Izipay expects amount in cents (integer)
      currency: chargeCurrency,
      orderId: orderId,
      customer: {
        email: email,
        billingDetails: {
          firstName: firstName || '',
          lastName: lastName || '',
        },
      },
      ...(description && { description }),
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

    // Log payment initiation in database (amount stored in cents/integer).
    // All audit values are SERVER-computed, not client-provided.
    const { error: logError } = await supabaseClient
      .from('payments_webhooks')
      .insert({
        event_type: 'izipay.payment.initiated',
        charge_id: transactionId,
        amount: amountInCents, // cents (integer)
        status: 'pending',
        currency: chargeCurrency, // PEN or USD
        exchange_rate: effectiveRate, // effective PEN->USD rate (null for native PEN)
        base_amount_pen: canonicalPen, // canonical order total in soles
        raw: {
          orderId,
          email,
          charge_amount: chargeAmount,
          currency: chargeCurrency,
          exchange_rate: effectiveRate,
          base_amount_pen: canonicalPen,
          client_amount: clientAmount ?? null, // recorded for audit only
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
