// ============================================================
// aftership-webhook — Tiempo real puro (Fase 2)
//
// AfterShip llama a esta función EN EL INSTANTE en que hay un checkpoint
// nuevo (push), en vez de esperar al cron. Flujo:
//
//   AfterShip  --POST (firmado HMAC)-->  aftership-webhook
//       -> verifica firma `aftership-hmac-sha256`
//       -> reemplaza los checkpoints del paquete en `tracking_events`
//       -> AVANZA `packages.current_status` según el tramo (nunca retrocede)
//       -> (triggers existentes) -> notificación in-app + WhatsApp (Pilar #1)
//
// El cron `sync-tracking` (cada 10 min) queda como RED DE SEGURIDAD /
// reconciliación por si se pierde un webhook.
//
// Idempotencia: el webhook de AfterShip trae el ARRAY COMPLETO de checkpoints
// (`msg.checkpoints`), así que reemplazamos el historial del paquete
// (DELETE + INSERT), igual que `sync-tracking`. Reprocesar el mismo evento
// converge al mismo estado, sin duplicados ni constraints extra.
//
// Seguridad: requiere el secret de firma de AfterShip en la variable de
// entorno `AFTERSHIP_WEBHOOK_SECRET` (Settings > Notifications en AfterShip).
//   supabase secrets set AFTERSHIP_WEBHOOK_SECRET="<secret>"
// Declarada con `verify_jwt = false` en config.toml (AfterShip no envía JWT).
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, aftership-hmac-sha256',
};

// Orden del flujo para no retroceder nunca de estado (idéntico a sync-tracking).
const STATUS_ORDER: Record<string, number> = {
  prealerted: 0,
  received_warehouse: 1,
  ready_consolidation: 2,
  consolidated: 3,
  ready_international: 4,
  in_transit: 5,
  arrived_peru: 6,
  ready_delivery: 7,
  delivered: 8,
};

// Mapea el tag de AfterShip al estado de Boxifly según el tramo.
function mapTagToStatus(tag: string, isInbound: boolean): string | null {
  const t = (tag || '').toLowerCase();
  if (isInbound) {
    // Tramo entrante: solo nos interesa la entrega en el warehouse de Miami.
    if (t === 'delivered') return 'received_warehouse';
    return null;
  }
  // Tramo internacional (Miami -> Perú).
  if (t === 'delivered' || t === 'availableforpickup') return 'arrived_peru';
  if (t === 'intransit' || t === 'outfordelivery' || t === 'attemptfail') return 'in_transit';
  return null;
}

// Verifica la firma HMAC-SHA256 (base64) que AfterShip envía en el header
// `aftership-hmac-sha256`, calculada sobre el cuerpo CRUDO de la petición.
async function verifySignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
  if (!signature) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const computed = btoa(String.fromCharCode(...new Uint8Array(mac)));

  // Comparación de tiempo constante para evitar timing attacks.
  if (computed.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

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

    const tracking = payload?.msg ?? payload?.data?.tracking ?? payload?.data ?? payload?.tracking ?? null;
    const trackingNumber: string | null = tracking?.tracking_number ?? null;

    if (!tracking || !trackingNumber) {
      // Eventos sin tracking (ej. ping de prueba): se acusan recibo con 200.
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
      // Tracking que no corresponde a ningún paquete: ack 200 (no reintentar).
      return new Response(
        JSON.stringify({ success: true, note: 'no matching package', trackingNumber }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // El tramo internacional usa `international_tracking`; el resto es entrante.
    const isInbound = pkg.international_tracking === trackingNumber ? false : true;
    const slug: string = tracking?.slug || 'unknown';
    const checkpoints: any[] = tracking?.checkpoints || [];

    // 5) Reemplazar el historial de checkpoints (idempotente: el webhook trae
    //    la lista completa). Realtime (Fase 1) refresca el feed al instante.
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
    const advances =
      newStatus !== null &&
      (STATUS_ORDER[newStatus] ?? -1) > (STATUS_ORDER[pkg.current_status] ?? -1);

    let transition: Record<string, unknown> = { changed: false, status: pkg.current_status, tag };
    if (advances) {
      const { error: updErr } = await supabase
        .from('packages')
        .update({ current_status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', pkg.id)
        .eq('current_status', pkg.current_status); // solo si no cambió mientras tanto
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
