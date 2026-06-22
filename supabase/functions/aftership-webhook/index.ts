// ============================================================
// aftership-webhook — Tiempo real puro (Fase 2)
//
// AfterShip llama a esta función EN EL INSTANTE en que hay un checkpoint
// nuevo (push), en vez de esperar al cron. Flujo:
//
//   AfterShip  --POST (firmado HMAC)-->  aftership-webhook
//       -> verifica firma `aftership-hmac-sha256`
//       -> (opcional) descarta eventos del futuro / demasiado viejos (anti-replay)
//       -> reemplaza los checkpoints del paquete en `tracking_events`
//       -> AVANZA `packages.current_status` según el tramo (nunca retrocede)
//       -> (triggers existentes) -> notificación in-app + WhatsApp (Pilar #1)
//
// El cron `sync-tracking` queda como RED DE SEGURIDAD / reconciliación.
//
// Idempotencia: el webhook trae el ARRAY COMPLETO de checkpoints, así que
// reemplazamos el historial (DELETE + INSERT), igual que `sync-tracking`.
//
// Lógica pura (firma, mapeo, frescura) en `./logic.ts`, cubierta por tests.
//
// Requiere `AFTERSHIP_WEBHOOK_SECRET` (Settings > Notifications en AfterShip).
// Opcional: `AFTERSHIP_WEBHOOK_MAX_AGE_SEC` (default 86400) para el anti-replay.
// Declarada con `verify_jwt = false` en config.toml (AfterShip no envía JWT).
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  mapTagToStatus,
  statusAdvances,
  extractTracking,
  verifySignature,
  checkFreshness,
} from './logic.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, aftership-hmac-sha256',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // 1) Cuerpo CRUDO: necesario para validar la firma (no re-serializar).
    const rawBody = await req.text();

    // 2) Verificación de firma HMAC.
    const secret = Deno.env.get('AFTERSHIP_WEBHOOK_SECRET');
    if (!secret) {
      console.error('AFTERSHIP_WEBHOOK_SECRET not configured');
      return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const signature = req.headers.get('aftership-hmac-sha256') || '';
    const valid = await verifySignature(rawBody, signature, secret);
    if (!valid) {
      console.error('Invalid AfterShip webhook signature - rejecting request');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3) Parsear payload. El objeto de tracking viene en `msg` (Tracking API).
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch (_) {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3b) Guard de frescura / anti-replay (usa el `ts` del payload si existe).
    const maxAgeSec = Number(Deno.env.get('AFTERSHIP_WEBHOOK_MAX_AGE_SEC') ?? '86400');
    const freshness = checkFreshness(payload?.ts, Date.now(), maxAgeSec);
    if (!freshness.ok) {
      console.warn(`aftership-webhook: rejected (${freshness.reason}) ts=${payload?.ts}`);
      return new Response(JSON.stringify({ error: 'Stale or future event', reason: freshness.reason }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tracking = extractTracking(payload);
    const trackingNumber: string | null = tracking?.tracking_number ?? null;

    if (!tracking || !trackingNumber) {
      return new Response(JSON.stringify({ success: true, note: 'no tracking in payload' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 4) Localizar el paquete por cualquiera de sus números de tracking.
    const { data: pkgs, error: findErr } = await supabase
      .from('packages')
      .select('id, current_status, tracking_number, external_tracking, international_tracking')
      .or(
        `tracking_number.eq.${trackingNumber},external_tracking.eq.${trackingNumber},international_tracking.eq.${trackingNumber}`
      )
      .limit(1);

    if (findErr) throw findErr;

    const pkg = pkgs?.[0];
    if (!pkg) {
      return new Response(
        JSON.stringify({ success: true, note: 'no matching package', trackingNumber }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // El tramo internacional usa `international_tracking`; el resto es entrante.
    const isInbound = pkg.international_tracking === trackingNumber ? false : true;
    const slug: string = tracking?.slug || 'unknown';
    const checkpoints: any[] = tracking?.checkpoints || [];

    // 5) Reemplazar el historial de checkpoints (idempotente).
    if (checkpoints.length > 0) {
      await supabase.from('tracking_events').delete().eq('package_id', pkg.id);
      await supabase.from('tracking_events').insert(
        checkpoints.map((c: any) => ({
          package_id: pkg.id,
          carrier: slug,
          tracking_number: trackingNumber,
          status: c.tag || 'Unknown',
          location: c.location || null,
          description: c.message || null,
          event_timestamp: c.checkpoint_time || new Date().toISOString(),
          raw_data: c,
        }))
      );
    }

    // 6) Avanzar el estado (nunca retrocede; race-safe con el estado previo).
    const tag: string | null = tracking?.tag || null;
    const newStatus = tag ? mapTagToStatus(tag, isInbound) : null;

    let transition: Record<string, unknown> = { changed: false, status: pkg.current_status, tag };
    if (statusAdvances(pkg.current_status, newStatus)) {
      const { error: updErr } = await supabase
        .from('packages')
        .update({ current_status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', pkg.id)
        .eq('current_status', pkg.current_status);
      if (updErr) throw updErr;
      transition = { changed: true, from: pkg.current_status, to: newStatus, tag };
    }

    console.log(
      `aftership-webhook: pkg=${pkg.id} tn=${trackingNumber} tag=${tag} events=${checkpoints.length} ${JSON.stringify(transition)}`
    );

    return new Response(
      JSON.stringify({ success: true, packageId: pkg.id, events: checkpoints.length, transition }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    console.error('aftership-webhook error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
