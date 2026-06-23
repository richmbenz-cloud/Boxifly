import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Idioma de las plantillas aprobadas en Meta. Constante por requerimiento de n8n.
const WHATSAPP_LANGUAGE = 'es_PE';

// Mapa AUTORITATIVO: current_status (Boxifly) -> nombre EXACTO de la plantilla
// aprobada en Meta. OJO: `consolidated` -> `package_consolidated_` (con guion
// bajo final), tal como quedo registrada en Meta.
const STATUS_TO_TEMPLATE: Record<string, string> = {
  prealerted: 'package_prealerted',
  received_warehouse: 'package_received',
  ready_consolidation: 'package_ready_consolidation',
  consolidated: 'package_consolidated_',
  in_transit: 'package_in_transit',
  arrived_peru: 'package_arrived_peru',
  ready_delivery: 'package_ready_delivery',
  delivered: 'package_delivered',
};

// Correccion de nombres heredados (el trigger envia `package_consolidated` sin
// guion). Se normaliza al nombre real aprobado en Meta.
const TEMPLATE_REMAP: Record<string, string> = {
  package_consolidated: 'package_consolidated_',
  package_received_warehouse: 'package_received',
};

// Plantillas que NO llevan statusMessage (solo customerName + trackingNumber).
const TEMPLATES_WITHOUT_STATUS_MESSAGE = new Set(['package_delivered']);

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

// Normaliza el telefono a formato internacional SOLO digitos (sin '+', espacios,
// guiones ni parentesis). Ej: '+51 913 343 202' -> '51913343202'.
function normalizePhone(raw: string): string {
  return (raw || '').replace(/\D/g, '');
}

// Resuelve el nombre de plantilla EXACTO de Meta a partir del status (preferido)
// o del templateName entrante (con remapeo de nombres heredados).
function resolveTemplateName(status: string | undefined, incoming: string): string {
  if (status && STATUS_TO_TEMPLATE[status]) return STATUS_TO_TEMPLATE[status];
  return TEMPLATE_REMAP[incoming] || incoming;
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

    // Nombre EXACTO de la plantilla aprobada en Meta + telefono normalizado.
    const finalTemplate = resolveTemplateName(parameters?.status, templateName);
    const cleanPhone = normalizePhone(phone);

    console.log('Notification details:', {
      userId,
      phone: cleanPhone,
      templateName: finalTemplate,
      status: parameters?.status,
    });

    // Construir los parametros que espera n8n/Meta, EN ORDEN FIJO:
    // customerName, trackingNumber, statusMessage. `package_delivered` solo
    // lleva customerName + trackingNumber.
    const n8nParameters: Record<string, string> = {
      customerName: parameters?.customerName ?? 'Cliente',
      trackingNumber: parameters?.trackingNumber ?? '',
    };
    if (!TEMPLATES_WITHOUT_STATUS_MESSAGE.has(finalTemplate)) {
      n8nParameters.statusMessage = parameters?.statusMessage ?? '';
    }

    // Payload final hacia n8n (formato de plantillas aprobadas).
    const n8nPayload = {
      phone: cleanPhone,
      templateName: finalTemplate,
      language: WHATSAPP_LANGUAGE,
      parameters: n8nParameters,
    };

    const n8nWebhookUrl = Deno.env.get('N8N_WHATSAPP_WEBHOOK_URL');

    let whatsappResponse;

    if (n8nWebhookUrl) {
      console.log('Sending WhatsApp template notification via n8n webhook...', {
        templateName: finalTemplate,
        language: WHATSAPP_LANGUAGE,
      });
      try {
        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(n8nPayload),
        });

        if (!response.ok) {
          throw new Error(`n8n webhook responded with status ${response.status}`);
        }

        const responseData = await response.json().catch(() => ({}));
        console.log('n8n response:', responseData);

        whatsappResponse = {
          status: 'sent',
          messageId: responseData.messageId || `wamid.n8n_${Date.now()}`,
          phone: cleanPhone,
          template: finalTemplate,
          language: WHATSAPP_LANGUAGE,
          sentAt: new Date().toISOString(),
          viaN8n: true,
        };
      } catch (err) {
        console.error('Error sending request to n8n:', err);
        throw err;
      }
    } else {
      console.log('[MOCK MODE] No N8N_WHATSAPP_WEBHOOK_URL set. Simulating send...');
      const messageId = `wamid.mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      whatsappResponse = {
        status: 'sent',
        messageId,
        phone: cleanPhone,
        template: finalTemplate,
        language: WHATSAPP_LANGUAGE,
        sentAt: new Date().toISOString(),
        viaN8n: false,
      };
      console.log(`[MOCK WhatsApp] Template ${finalTemplate} -> ${cleanPhone}:`, JSON.stringify(n8nPayload));
    }

    // Resolve the real package UUID from the tracking number before logging.
    // warehouse_logs.package_id is a uuid FK -> packages.id (nullable).
    let resolvedPackageId: string | null = null;
    if (parameters?.trackingNumber) {
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

    // Log the notification attempt in the database.
    const { error: logError } = await supabaseClient
      .from('warehouse_logs')
      .insert({
        package_id: resolvedPackageId,
        logged_by: userId,
        action: 'whatsapp_notification_sent',
        details: {
          phone: cleanPhone,
          template: finalTemplate,
          language: WHATSAPP_LANGUAGE,
          status: whatsappResponse.status,
          message_id: whatsappResponse.messageId,
          parameters: n8nParameters,
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
          ? 'Notificacion enviada exitosamente via n8n'
          : 'Notificacion de WhatsApp enviada exitosamente (mock)',
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
