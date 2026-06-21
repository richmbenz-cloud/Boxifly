import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IzipayWebhookEvent {
  kr_answer_type?: string;
  kr_answer?: {
    orderStatus?: string;
    orderDetails?: {
      orderId?: string;
      mode?: string;
    };
    customer?: {
      email?: string;
    };
    transactions?: Array<{
      uuid?: string;
      amount?: number;
      currency?: string;
      status?: string;
      detailedStatus?: string;
      errorCode?: string;
      errorMessage?: string;
    }>;
  };
  [key: string]: any;
}

/**
 * Verify Izipay (Lyra/Krypton) IPN signature using HMAC-SHA256.
 *
 * IMPORTANT: Izipay computes the hash over the *value of the `kr-answer`
 * field only* (the raw JSON string as received), NOT over the whole body.
 * The key depends on `kr-hash-key`:
 *   - "password"     -> the REST API password (IZIPAY_TEST_API_KEY)
 *   - "sha256_hmac"  -> the HMAC-SHA256 key (IZIPAY_WEBHOOK_SECRET)
 * Server-to-server IPNs use "password"; browser return uses "sha256_hmac".
 */
async function verifyIzipaySignature(
  krAnswer: string,
  receivedHash: string | null,
  secret: string
): Promise<boolean> {
  if (!receivedHash || !secret || !krAnswer) {
    console.warn('Missing kr-answer, hash or secret for verification');
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(krAnswer));
    const computedHash = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const isValid = computedHash.toLowerCase() === receivedHash.toLowerCase();
    console.log('Signature verification:', { isValid, receivedHash: receivedHash.substring(0, 10) + '...' });

    return isValid;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Izipay webhook received');

    // Get the raw body for signature verification
    const rawBody = await req.text();

    // Parse the form-encoded / JSON body FIRST so we can isolate `kr-answer`.
    // Izipay sends the IPN as application/x-www-form-urlencoded with the
    // field name `kr-answer` (hyphen, not underscore).
    const contentType = req.headers.get('content-type') || '';

    let krAnswerRaw: string | null = null;       // raw JSON string of kr-answer (used for signature)
    let krHashKey: string | null = null;          // "password" | "sha256_hmac"
    const formFields: Record<string, string> = {};

    if (contentType.includes('application/json')) {
      // JSON body: the whole body is the answer payload
      krAnswerRaw = rawBody;
    } else {
      const params = new URLSearchParams(rawBody);
      for (const [key, value] of params.entries()) {
        formFields[key] = value;
      }
      // Izipay uses `kr-answer`; accept legacy `kr_answer` just in case
      krAnswerRaw = formFields['kr-answer'] ?? formFields['kr_answer'] ?? null;
      krHashKey = formFields['kr-hash-key'] ?? formFields['kr_hash_key'] ?? null;
    }

    // Resolve the signing secret based on kr-hash-key.
    // For server-to-server IPN ("password") Izipay signs with the REST API password.
    const apiPassword = Deno.env.get('IZIPAY_TEST_API_KEY') || '';
    const hmacKey = Deno.env.get('IZIPAY_WEBHOOK_SECRET') || '';
    const signingSecret = krHashKey === 'password' ? apiPassword : (hmacKey || apiPassword);

    if (!signingSecret) {
      console.error('No signing secret configured (IZIPAY_TEST_API_KEY / IZIPAY_WEBHOOK_SECRET)');
      return new Response(
        JSON.stringify({ ok: false, error: 'Webhook secret not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Izipay sends the hash in the `kr-hash` field (body) or header
    // NOTE: `kr-hash-key` is the key TYPE ("password" | "sha256_hmac"), not a
    // hash, so it is intentionally NOT used as a signature source here.
    const receivedHash =
      formFields['kr-hash'] ||
      req.headers.get('kr-hash') ||
      req.headers.get('x-izipay-signature');

    // Verify signature over the kr-answer value (NOT the whole body)
    const isValidSignature = await verifyIzipaySignature(krAnswerRaw ?? '', receivedHash, signingSecret);

    if (!isValidSignature) {
      console.error('Invalid webhook signature - rejecting request');
      console.log('Headers received:', Object.fromEntries(req.headers.entries()));

      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid signature' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    console.log('Webhook signature verified successfully');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Build the typed webhook object from the parsed kr-answer
    const webhookData: IzipayWebhookEvent = {};
    if (krAnswerRaw) {
      try {
        webhookData.kr_answer = JSON.parse(krAnswerRaw);
      } catch (e) {
        console.error('Error parsing kr-answer JSON:', e);
      }
    }
    // Keep any other form fields for logging/debugging
    for (const [k, v] of Object.entries(formFields)) {
      if (k !== 'kr-answer' && k !== 'kr_answer') {
        (webhookData as any)[k] = v;
      }
    }

    console.log('Webhook data received:', JSON.stringify(webhookData, null, 2));

    // Extract transaction information
    const answer = webhookData.kr_answer;
    const orderStatus = answer?.orderStatus;
    const orderId = answer?.orderDetails?.orderId;
    const transactions = answer?.transactions || [];

    let transactionId = 'unknown';
    let amount = 0;
    let status = 'pending';
    let detailedStatus = '';

    if (transactions.length > 0) {
      const transaction = transactions[0];
      transactionId = transaction.uuid || transactionId;
      amount = transaction.amount ?? 0; // Stored in cents (integer), consistent with izipay-initiate and the integer column
      detailedStatus = transaction.detailedStatus || '';

      // Map Izipay status to internal status
      if (transaction.status === 'PAID' || orderStatus === 'PAID') {
        status = 'succeeded';
      } else if (transaction.status === 'UNPAID' || orderStatus === 'UNPAID') {
        status = 'pending';
      } else if (transaction.status === 'REFUSED' || orderStatus === 'REFUSED') {
        status = 'failed';
      } else if (transaction.status === 'CANCELLED' || orderStatus === 'CANCELLED') {
        status = 'cancelled';
      }
    }

    console.log('Processed webhook:', { transactionId, orderId, amount, status, detailedStatus });

    // Check for duplicate webhook (idempotency)
    const { data: existingWebhook } = await supabaseClient
      .from('payments_webhooks')
      .select('id')
      .eq('charge_id', transactionId)
      .eq('status', status)
      .maybeSingle();

    if (existingWebhook) {
      console.log('Duplicate webhook detected, skipping:', transactionId);
      return new Response(
        JSON.stringify({ ok: true, message: 'Already processed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Save webhook event to database
    const { error: insertError } = await supabaseClient
      .from('payments_webhooks')
      .insert({
        event_type: `izipay.payment.${status}`,
        charge_id: transactionId,
        amount: amount,
        status: status,
        raw: webhookData as any,
      });

    if (insertError) {
      console.error('Error saving Izipay webhook event:', insertError);
      // Real DB failure: return 5xx so Izipay retries the IPN instead of
      // silently dropping the event.
      return new Response(
        JSON.stringify({ ok: false, error: 'webhook_persist_failed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // If payment succeeded, validate the paid amount THEN update status.
    if (status === 'succeeded' && orderId) {
      // Defense-in-depth: confirm the amount Izipay reports as PAID matches the
      // amount WE initiated for this order (recorded server-side at initiation).
      // Prevents marking an order 'paid' on an underpaid / tampered transaction.
      let initiated: { amount: number; currency: string | null } | null = null;
      {
        const byCharge = await supabaseClient
          .from('payments_webhooks')
          .select('amount, currency')
          .eq('event_type', 'izipay.payment.initiated')
          .eq('charge_id', transactionId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        initiated = (byCharge.data as any) ?? null;

        if (!initiated) {
          // Fallback: match by orderId stored in the initiation `raw` payload.
          const byOrder = await supabaseClient
            .from('payments_webhooks')
            .select('amount, currency')
            .eq('event_type', 'izipay.payment.initiated')
            .eq('raw->>orderId', orderId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          initiated = (byOrder.data as any) ?? null;
        }
      }

      if (initiated) {
        const expectedCents = Number(initiated.amount);
        const paidCents = Number(amount); // already in cents
        const paidCurrency = transactions[0]?.currency;
        const currencyOk =
          !initiated.currency ||
          !paidCurrency ||
          String(initiated.currency).toUpperCase() === String(paidCurrency).toUpperCase();

        // Allow a 1-cent rounding tolerance.
        if (Math.abs(paidCents - expectedCents) > 1 || !currencyOk) {
          console.error('AMOUNT MISMATCH — refusing to mark paid', {
            orderId,
            transactionId,
            expectedCents,
            paidCents,
            expectedCurrency: initiated.currency,
            paidCurrency,
          });
          // Signature was valid, so ACK with 200 (retrying won't fix a
          // mismatch), but do NOT mark as paid. Flagged in logs for review.
          return new Response(
            JSON.stringify({ ok: false, error: 'amount_mismatch' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
      } else {
        console.warn('No initiation record to validate amount for:', { orderId, transactionId });
      }

      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order status:', updateError);
        // Real DB failure: return 5xx so Izipay retries the IPN.
        return new Response(
          JSON.stringify({ ok: false, error: 'order_update_failed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      console.log('Order status updated successfully:', orderId);

      // Pagos de paquetes (tabla `payments`): el mismo orderId puede ser un payment.id.
      // Update idempotente: si orderId era un order.id esto no afecta filas (y viceversa).
      const { error: paymentUpdateError } = await supabaseClient
        .from('payments')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          transaction_id: transactionId,
        })
        .eq('id', orderId);

      if (paymentUpdateError) {
        console.error('Error updating package payment status:', paymentUpdateError);
        return new Response(
          JSON.stringify({ ok: false, error: 'payment_update_failed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      console.log('Package payment status check completed for:', orderId);
    }

    console.log('Izipay webhook processed successfully');

    // Always return 200 OK to Izipay
    return new Response(
      JSON.stringify({ ok: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing Izipay webhook:', error);
    // Always return 200 OK to Izipay, even on error
    return new Response(
      JSON.stringify({ ok: false }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
