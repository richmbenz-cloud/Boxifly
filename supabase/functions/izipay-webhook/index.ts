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
 * Verify Izipay webhook signature using HMAC-SHA256
 * Izipay sends a hash in kr-hash header that should be verified
 */
async function verifyIzipaySignature(
  rawBody: string,
  receivedHash: string | null,
  secret: string
): Promise<boolean> {
  if (!receivedHash || !secret) {
    console.warn('Missing hash or secret for verification');
    return false;
  }

  try {
    // Izipay uses HMAC-SHA256 for signature verification
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
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

    // Get webhook secret for verification
    const webhookSecret = Deno.env.get('IZIPAY_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      console.error('IZIPAY_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ ok: false, error: 'Webhook secret not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Get the raw body for signature verification
    const rawBody = await req.text();
    
    // Get Izipay signature headers
    // Izipay may use different header names depending on configuration
    const receivedHash = req.headers.get('kr-hash') || 
                         req.headers.get('kr-hash-key') || 
                         req.headers.get('x-izipay-signature');

    // Verify signature before processing
    const isValidSignature = await verifyIzipaySignature(rawBody, receivedHash, webhookSecret);
    
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

    // Parse webhook data - Izipay can send form-encoded or JSON
    let webhookData: IzipayWebhookEvent;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      webhookData = JSON.parse(rawBody);
    } else {
      // Parse form-encoded data
      const params = new URLSearchParams(rawBody);
      webhookData = {} as IzipayWebhookEvent;
      for (const [key, value] of params.entries()) {
        if (key === 'kr_answer' && typeof value === 'string') {
          try {
            webhookData.kr_answer = JSON.parse(value);
          } catch (e) {
            console.error('Error parsing kr_answer:', e);
            (webhookData as any)[key] = value;
          }
        } else {
          (webhookData as any)[key] = value;
        }
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
      amount = transaction.amount ? transaction.amount / 100 : 0; // Convert from cents
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
      return new Response(
        JSON.stringify({ ok: false }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Always return 200 to Izipay
        }
      );
    }

    // If payment succeeded, update order status
    if (status === 'succeeded' && orderId) {
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
      } else {
        console.log('Order status updated successfully:', orderId);
      }
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
