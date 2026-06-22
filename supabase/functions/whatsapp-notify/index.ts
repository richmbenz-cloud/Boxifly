import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  userId: string;
  phone: string;
  templateName: string;
  parameters: {
    customerName: string;
    trackingNumber: string;
    status: string;
    statusMessage: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('WhatsApp Notification Request received');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: NotificationRequest = await req.json();
    const { userId, phone, templateName, parameters } = body;

    console.log('Notification details:', { userId, phone, templateName });

    // Define WhatsApp message templates
    const templates: Record<string, string> = {
      package_prealerted: `Hola ${parameters.customerName}! 📦 Tu paquete con tracking *${parameters.trackingNumber}* ha sido prealertado. Estado: ${parameters.statusMessage}`,
      package_received: `Hola ${parameters.customerName}! ✅ Tu paquete *${parameters.trackingNumber}* ha sido recibido en nuestro warehouse de USA. Estado: ${parameters.statusMessage}`,
      package_ready_consolidation: `Hola ${parameters.customerName}! 📦 Tu paquete *${parameters.trackingNumber}* está listo para ser consolidado. Estado: ${parameters.statusMessage}`,
      package_consolidated: `Hola ${parameters.customerName}! 📦 Tu paquete *${parameters.trackingNumber}* ha sido consolidado. Estado: ${parameters.statusMessage}`,
      package_in_transit: `Hola ${parameters.customerName}! ✈️ Tu paquete *${parameters.trackingNumber}* está en tránsito a Perú. Estado: ${parameters.statusMessage}`,
      package_arrived_peru: `Hola ${parameters.customerName}! 🇵🇪 Tu paquete *${parameters.trackingNumber}* ha llegado a Perú. Estado: ${parameters.statusMessage}`,
      package_ready_delivery: `Hola ${parameters.customerName}! 🚚 Tu paquete *${parameters.trackingNumber}* está listo para entrega. Por favor procede con el pago. Estado: ${parameters.statusMessage}`,
      package_delivered: `Hola ${parameters.customerName}! 🎉 Tu paquete *${parameters.trackingNumber}* ha sido entregado exitosamente. Gracias por confiar en Boxifly!`,
    };

    const message = templates[templateName] || `Actualización de paquete ${parameters.trackingNumber}`;
    const n8nWebhookUrl = Deno.env.get('N8N_WHATSAPP_WEBHOOK_URL');

    let whatsappResponse;

    if (n8nWebhookUrl) {
      console.log('Sending real WhatsApp notification via n8n webhook...');
      try {
        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone,
            messageText: message,
          }),
        });

        if (!response.ok) {
          throw new Error(`n8n webhook responded with status ${response.status}`);
        }

        const responseData = await response.json();
        console.log('n8n response:', responseData);

        whatsappResponse = {
          status: 'sent',
          messageId: responseData.messageId || `wamid.n8n_${Date.now()}`,
          phone,
          template: templateName,
          sentAt: new Date().toISOString(),
          message,
          viaN8n: true,
        };
      } catch (err) {
        console.error('Error sending request to n8n:', err);
        throw err;
      }
    } else {
      console.log('[MOCK MODE] No N8N_WHATSAPP_WEBHOOK_URL set. Simulating send...');
      // Generate mock message ID
      const messageId = `wamid.mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      whatsappResponse = {
        status: 'sent',
        messageId,
        phone,
        template: templateName,
        sentAt: new Date().toISOString(),
        message,
        viaN8n: false,
      };
      console.log(`[MOCK WhatsApp] Sent to ${phone}:`, message);
    }

    // Resolve the real package UUID from the tracking number before logging.
    // warehouse_logs.package_id is a uuid FK -> packages.id. Previously this insert
    // passed `parameters.trackingNumber || 'N/A'` (a tracking string, not a UUID),
    // which violated the foreign key (SQLSTATE 23503) on every call, so no
    // warehouse_logs row was ever written. We look up the package by tracking number
    // and fall back to null (column is now nullable) so the log is never lost.
    let resolvedPackageId: string | null = null;
    if (parameters.trackingNumber) {
      const { data: pkg, error: pkgLookupError } = await supabaseClient
        .from('packages')
        .select('id')
        .eq('tracking_number', parameters.trackingNumber)
        .maybeSingle();
      if (pkgLookupError) {
        console.error('Error resolving package by tracking number:', pkgLookupError);
      }
      resolvedPackageId = pkg?.id ?? null;
    }

    // Log the notification attempt in the database
    const { error: logError } = await supabaseClient
      .from('warehouse_logs')
      .insert({
        package_id: resolvedPackageId,
        logged_by: userId,
        action: 'whatsapp_notification_sent',
        details: {
          phone,
          template: templateName,
          status: whatsappResponse.status,
          message_id: whatsappResponse.messageId,
          parameters,
          via_n8n: whatsappResponse.viaN8n,
        },
      });

    if (logError) {
      console.error('Error logging notification:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: whatsappResponse,
        message: whatsappResponse.viaN8n 
          ? 'Notificación enviada exitosamente vía n8n' 
          : 'Notificación de WhatsApp enviada exitosamente (mock)',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in whatsapp-notify function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
