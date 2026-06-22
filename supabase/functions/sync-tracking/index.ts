// ============================================================
// sync-tracking — Sincronización automática de tracking → estado
//
// Recorre los paquetes "en movimiento", consulta Aftership y AVANZA
// automáticamente `packages.current_status` según el tramo que el
// transportista sí conoce:
//
//   • Tramo entrante (USA → warehouse Miami):  external_tracking / tracking_number
//       Aftership "Delivered"  ->  received_warehouse
//   • Tramo internacional (Miami → Perú):      international_tracking
//       Aftership "InTransit"/"OutForDelivery" ->  in_transit
//       Aftership "Delivered"/"AvailableForPickup" ->  arrived_peru
//
// Los estados internos del warehouse (ready_consolidation, consolidated,
// ready_delivery, delivered) NO se tocan: son decisiones manuales.
//
// Al hacer UPDATE de current_status, se disparan automáticamente los
// triggers existentes -> notificación in-app + WhatsApp (Pilar #1).
//
// Modos:
//   • POST sin body  -> batch (lo usa el cron).
//   • POST { "packageId": "..." } -> sincroniza un solo paquete.
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Orden del flujo para no retroceder nunca de estado.
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

// Estados desde los que el carrier todavía puede hacer avanzar el paquete.
const INBOUND_STATUSES = ['prealerted', 'received_warehouse'];
const INTERNATIONAL_STATUSES = ['ready_international', 'in_transit'];
const SYNCABLE_STATUSES = [...INBOUND_STATUSES, ...INTERNATIONAL_STATUSES];

interface PackageRow {
  id: string;
  current_status: string;
  tracking_number: string | null;
  external_tracking: string | null;
  international_tracking: string | null;
}

// Mapea el tag de Aftership al estado de Boxifly según el tramo.
function mapTagToStatus(tag: string, isInbound: boolean): string | null {
  const t = (tag || '').toLowerCase();
  if (isInbound) {
    // Solo nos interesa la entrega en el warehouse de Miami.
    if (t === 'delivered') return 'received_warehouse';
    return null;
  }
  // Tramo internacional.
  if (t === 'delivered' || t === 'availableforpickup') return 'arrived_peru';
  if (t === 'intransit' || t === 'outfordelivery' || t === 'attemptfail') return 'in_transit';
  return null;
}

async function fetchAftershipTag(
  apiKey: string,
  trackingNumber: string
): Promise<{ tag: string | null; slug: string | null; checkpoints: any[] }> {
  // AfterShip versioned Tracking API (la v4 + header `aftership-api-key` fue
  // deprecada en 2023-10 y devuelve 404). Base versionada + header `as-api-key`.
  const BASE = 'https://api.aftership.com/tracking/2025-07/trackings';
  const headers = { 'Content-Type': 'application/json', 'as-api-key': apiKey };

  // 1) Crear tracking (body PLANO, no anidado en `tracking`). Idempotente:
  //    si ya existe, la API devuelve 4003 con el id en `data`.
  let id: string | null = null;
  let slug: string | null = null;
  const createRes = await fetch(BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify({ tracking_number: trackingNumber }),
  });
  const createData = await createRes.json().catch(() => ({}));
  if (createRes.status === 201 || createData?.meta?.code === 201) {
    id = createData?.data?.id || null;
    slug = createData?.data?.slug || null;
  } else if (createData?.meta?.code === 4003) {
    // Ya existe: el id viene en data.
    id = createData?.data?.id || null;
    slug = createData?.data?.slug || null;
  }

  // 2) Obtener el detalle. Preferimos GET por id; si no, buscamos por número.
  let tracking: any = null;
  if (id) {
    const r = await fetch(`${BASE}/${id}`, { method: 'GET', headers });
    const j = await r.json().catch(() => ({}));
    tracking = j?.data || null;
  }
  if (!tracking) {
    const r = await fetch(
      `${BASE}?tracking_numbers=${encodeURIComponent(trackingNumber)}`,
      { method: 'GET', headers }
    );
    const j = await r.json().catch(() => ({}));
    tracking = j?.data?.trackings?.[0] || null;
  }

  if (!tracking) return { tag: null, slug: slug || null, checkpoints: [] };

  return {
    tag: tracking.tag || null,
    slug: tracking.slug || slug || null,
    checkpoints: tracking.checkpoints || [],
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const apiKey = Deno.env.get('AFTERSHIP_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AFTERSHIP_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ¿single o batch?
    let singleId: string | null = null;
    try {
      const body = await req.json();
      singleId = body?.packageId ?? null;
    } catch (_) {
      // sin body => batch
    }

    let query = supabase
      .from('packages')
      .select('id, current_status, tracking_number, external_tracking, international_tracking');

    if (singleId) {
      query = query.eq('id', singleId);
    } else {
      query = query.in('current_status', SYNCABLE_STATUSES);
    }

    const { data: packages, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;

    const results: any[] = [];

    for (const pkg of (packages ?? []) as PackageRow[]) {
      const isInbound = INBOUND_STATUSES.includes(pkg.current_status);
      const trackingNumber = isInbound
        ? pkg.external_tracking || pkg.tracking_number
        : pkg.international_tracking || pkg.tracking_number;

      if (!trackingNumber) {
        results.push({ id: pkg.id, skipped: 'no_tracking_number' });
        continue;
      }

      try {
        const { tag, slug, checkpoints } = await fetchAftershipTag(apiKey, trackingNumber);

        // Guardar checkpoints (reemplaza los anteriores), igual que la función original.
        if (checkpoints.length > 0) {
          await supabase.from('tracking_events').delete().eq('package_id', pkg.id);
          await supabase.from('tracking_events').insert(
            checkpoints.map((c: any) => ({
              package_id: pkg.id,
              carrier: slug || 'unknown',
              tracking_number: trackingNumber,
              status: c.tag || 'Unknown',
              location: c.location || null,
              description: c.message || null,
              event_timestamp: c.checkpoint_time || new Date().toISOString(),
              raw_data: c,
            }))
          );
        }

        const newStatus = tag ? mapTagToStatus(tag, isInbound) : null;
        const advances =
          newStatus !== null &&
          (STATUS_ORDER[newStatus] ?? -1) > (STATUS_ORDER[pkg.current_status] ?? -1);

        if (advances) {
          const { error: updErr } = await supabase
            .from('packages')
            .update({ current_status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', pkg.id)
            // Carrera segura: solo si el estado no cambió mientras tanto.
            .eq('current_status', pkg.current_status);
          if (updErr) throw updErr;
          results.push({ id: pkg.id, from: pkg.current_status, to: newStatus, tag });
        } else {
          results.push({ id: pkg.id, tag, status: pkg.current_status, changed: false });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown';
        results.push({ id: pkg.id, error: msg });
      }
    }

    const advanced = results.filter((r) => r.to).length;
    console.log(`sync-tracking: ${results.length} paquetes revisados, ${advanced} avanzaron de estado`);

    return new Response(
      JSON.stringify({ success: true, checked: results.length, advanced, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    console.error('sync-tracking error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
