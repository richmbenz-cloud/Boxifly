import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { packageId, trackingNumber, carrier } = await req.json();

    if (!packageId || !trackingNumber) {
      return new Response(
        JSON.stringify({ error: 'Missing packageId or trackingNumber' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aftershipApiKey = Deno.env.get('AFTERSHIP_API_KEY');
    if (!aftershipApiKey) {
      console.error('AFTERSHIP_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Aftership API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching tracking for package ${packageId}, tracking: ${trackingNumber}, carrier: ${carrier || 'auto-detect'}`);

    // AfterShip versioned Tracking API (la v4 + header `aftership-api-key` fue
    // deprecada en 2023-10 y devuelve 404). Base versionada + header `as-api-key`.
    const BASE = 'https://api.aftership.com/tracking/2025-07/trackings';
    const asHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'as-api-key': aftershipApiKey,
    };

    // Step 1: Create tracking (body PLANO, no anidado en `tracking`). Idempotente:
    // si ya existe, la API devuelve 4003 con el id en `data`.
    const createPayload: any = { tracking_number: trackingNumber };
    if (carrier) createPayload.slug = carrier; // Aftership carrier slug

    const createResponse = await fetch(BASE, {
      method: 'POST',
      headers: asHeaders,
      body: JSON.stringify(createPayload),
    });

    const createData = await createResponse.json();
    console.log('Aftership create tracking response:', JSON.stringify(createData));

    let trackingId: string | null = null;
    if (createResponse.status === 201 || createData?.meta?.code === 201) {
      trackingId = createData?.data?.id || null;
    } else if (createData?.meta?.code === 4003) {
      trackingId = createData?.data?.id || null; // ya existe
    }

    // Step 2: Get tracking details (por id; fallback por número).
    let tracking: any = null;
    if (trackingId) {
      const r = await fetch(`${BASE}/${trackingId}`, { method: 'GET', headers: asHeaders });
      const j = await r.json();
      console.log('Aftership get-by-id response:', JSON.stringify(j));
      tracking = j?.data || null;
    }
    if (!tracking) {
      const r = await fetch(
        `${BASE}?tracking_numbers=${encodeURIComponent(trackingNumber)}`,
        { method: 'GET', headers: asHeaders }
      );
      const j = await r.json();
      console.log('Aftership get-by-number response:', JSON.stringify(j));
      tracking = j?.data?.trackings?.[0] || null;
    }

    if (!tracking) {
      return new Response(
        JSON.stringify({ error: 'No tracking data found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const checkpoints = tracking.checkpoints || [];

    // Step 3: Store tracking events in database
    const trackingEvents = checkpoints.map((checkpoint: any) => ({
      package_id: packageId,
      carrier: tracking.slug || 'unknown',
      tracking_number: trackingNumber,
      status: checkpoint.tag || 'Unknown',
      location: checkpoint.location || null,
      description: checkpoint.message || null,
      event_timestamp: checkpoint.checkpoint_time || new Date().toISOString(),
      raw_data: checkpoint,
    }));

    if (trackingEvents.length > 0) {
      // Delete old events for this package
      await supabase
        .from('tracking_events')
        .delete()
        .eq('package_id', packageId);

      // Insert new events
      const { error: insertError } = await supabase
        .from('tracking_events')
        .insert(trackingEvents);

      if (insertError) {
        console.error('Error inserting tracking events:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to store tracking events', details: insertError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Successfully stored ${trackingEvents.length} tracking events for package ${packageId}`);
    }

    // Update package with latest status if needed
    const latestCheckpoint = checkpoints[checkpoints.length - 1];
    if (latestCheckpoint) {
      await supabase
        .from('packages')
        .update({
          international_tracking: trackingNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', packageId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        tracking: {
          carrier: tracking.slug,
          status: tracking.tag,
          events: trackingEvents.length,
          latestStatus: latestCheckpoint?.message || 'No updates',
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in aftership-tracking function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
