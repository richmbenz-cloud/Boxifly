import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Margin added on top of the SBS/SUNAT "venta" rate so FX spread never causes a loss.
// Configurable without redeploy via the FX_MARGIN secret (e.g. 0.02 = +2%).
const MARGIN = Number(Deno.env.get('FX_MARGIN') ?? '0.02');
// Last-resort fallback if the public API is down and there is no cached rate.
const FALLBACK_VENTA = Number(Deno.env.get('FX_FALLBACK_VENTA') ?? '3.85');
// Free, token-less SUNAT rate endpoint (e-api.net.pe is currently down).
const RATE_API = 'https://api.apis.net.pe/v1/tipo-cambio-sunat';

function limaToday(): string {
  // YYYY-MM-DD in America/Lima (en-CA yields ISO-like date).
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
}

interface RatePayload {
  rate_date: string;
  base_currency: string;
  quote_currency: string;
  sbs_venta: number;
  sbs_compra: number | null;
  margin: number;
  effective_rate: number;
  source: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = limaToday();
    const base_currency = 'USD';
    const quote_currency = 'PEN';

    // 1. Serve today's cached rate if present.
    const { data: cached } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('rate_date', today)
      .eq('base_currency', base_currency)
      .eq('quote_currency', quote_currency)
      .maybeSingle();

    if (cached) {
      return json(cached as RatePayload);
    }

    // 2. Fetch fresh rate from SUNAT (free endpoint).
    let venta: number | null = null;
    let compra: number | null = null;
    let source = 'apis.net.pe/SUNAT';

    try {
      const resp = await fetch(RATE_API, { headers: { 'User-Agent': 'Boxifly/checkout' } });
      const body = await resp.json();
      venta = Number(body?.venta);
      compra = body?.compra != null ? Number(body.compra) : null;
      if (!venta || Number.isNaN(venta)) throw new Error('Invalid rate from API');
    } catch (apiErr) {
      console.error('FX API failed, using fallback:', apiErr);
      // 2b. Fallback to the most recent cached rate, else the env default.
      const { data: last } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('rate_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (last) {
        venta = Number(last.sbs_venta);
        compra = last.sbs_compra != null ? Number(last.sbs_compra) : null;
        source = 'fallback:last_known';
      } else {
        venta = FALLBACK_VENTA;
        compra = null;
        source = 'fallback:env';
      }
    }

    // effective_rate makes the customer pay slightly MORE foreign currency,
    // so converting it back to soles always covers the order + margin.
    const effective_rate = Number((venta! / (1 + MARGIN)).toFixed(6));

    const payload: RatePayload = {
      rate_date: today,
      base_currency,
      quote_currency,
      sbs_venta: venta!,
      sbs_compra: compra,
      margin: MARGIN,
      effective_rate,
      source,
    };

    // 3. Persist (idempotent on date+pair). Never fail the request if caching fails.
    const { error: upsertErr } = await supabase
      .from('exchange_rates')
      .upsert(payload, { onConflict: 'rate_date,base_currency,quote_currency' });
    if (upsertErr) console.error('Error caching exchange rate:', upsertErr);

    return json(payload);
  } catch (error) {
    console.error('exchange-rate error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

function json(payload: RatePayload): Response {
  return new Response(JSON.stringify(payload), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}
