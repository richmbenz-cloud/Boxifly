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

    // Step 1: Create tracking in Aftership (if not exists)
    const createTrackingUrl = 'https://api.aftership.com/v4/trackings';
    const createPayload: any = {
      tracking: {
        tracking_number: trackingNumber,
      }
    };

    if (carrier) {
      createPayload.tracking.slug = carrier; // Aftership carrier slug
    }

    const createResponse = await fetch(createTrackingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'aftership-api-key': aftershipApiKey,
      },
      body: JSON.stringify(createPayload),
    });

    const createData = await createResponse.json();
    console.log('Aftership create tracking response:', JSON.stringify(createData));

    // Step 2: Get tracking details
    const slug = createData?.data?.tracking?.slug || carrier || '';
    const getTrackingUrl = `https://api.aftership.com/v4/trackings/${slug}/${trackingNumber}`;
    
    const getResponse = await fetch(getTrackingUrl, {
      method: 'GET',
      headers: {
        'aftership-api-key': aftershipApiKey,
      },
    });

    const trackingData = await getResponse.json();
    console.log('Aftership get tracking response:', JSON.stringify(trackingData));

    if (!trackingData?.data?.tracking) {
      return new Response(
        JSON.stringify({ error: 'No tracking data found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tracking = trackingData.data.tracking;
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
