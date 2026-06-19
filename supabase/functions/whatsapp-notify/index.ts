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

    // Simulate WhatsApp Cloud API call
    const whatsappResponse = await simulateWhatsAppSend({
      phone,
      templateName,
      parameters,
    });

    console.log('WhatsApp mock response:', whatsappResponse);

    // Log the notification attempt in the database
    const { error: logError } = await supabaseClient
      .from('warehouse_logs')
      .insert({
        package_id: parameters.trackingNumber || 'N/A',
        logged_by: userId,
        action: 'whatsapp_notification_sent',
        details: {
          phone,
          template: templateName,
          status: whatsappResponse.status,
          message_id: whatsappResponse.messageId,
          parameters,
        },
      });

    if (logError) {
      console.error('Error logging notification:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: whatsappResponse,
        message: 'Notificación de WhatsApp enviada exitosamente (mock)',
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

// Mock WhatsApp Cloud API send function
async function simulateWhatsAppSend(params: {
  phone: string;
  templateName: string;
  parameters: any;
}) {
  const { phone, templateName, parameters } = params;

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate mock message ID
  const messageId = `wamid.mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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

  console.log(`[MOCK WhatsApp] Sending to ${phone}:`, message);

  // Simulate successful response from WhatsApp Cloud API
  return {
    status: 'sent',
    messageId,
    phone,
    template: templateName,
    sentAt: new Date().toISOString(),
    message,
  };
}
