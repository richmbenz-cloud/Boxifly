// ============================================================
// pending-monitor — Alerta de monitoreo de "pendientes" (ops)
//
// Lo dispara el cron `pending-monitor-every-15min` (pg_cron + pg_net) con el
// service_role_key, igual que el resto de automatizaciones del proyecto.
//
// Qué vigila (cada check cuenta elementos en estado `pending` MÁS VIEJOS que
// su umbral de antigüedad):
//   1. whatsapp_messages.status = 'pending'      -> el pipeline AfterShip→WhatsApp
//      no logró despachar la notificación (Pilar #1). [check principal]
//   2. payments.payment_status   = 'pending'      -> checkout atascado/abandonado.
//   3. kyc_documents.status      = 'pending'      -> SLA de revisión KYC.
//
// Si algún check supera su umbral, envía UN email vía Resend a `ALERT_EMAIL`.
// Degradación segura: sin `ALERT_EMAIL`/`RESEND_API_KEY` no envía, pero igual
// responde 200 con el resumen (útil para depurar / dashboards).
//
// Umbrales configurables por secret (minutos):
//   PENDING_WHATSAPP_MAX_MIN (def 30) · PENDING_PAYMENT_MAX_MIN (def 1440)
//   PENDING_KYC_MAX_MIN (def 2880)
//
// Lógica pura (umbrales, armado del email) en `./logic.ts`, cubierta por tests.
// Declarada con `verify_jwt = false` en config.toml (la llama el cron con Bearer).
// ============================================================
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { envInt, cutoffIso, shouldAlert, buildAlert, type CheckResult } from './logic.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = Date.now();
    const waMin = envInt(Deno.env.get('PENDING_WHATSAPP_MAX_MIN'), 30);
    const payMin = envInt(Deno.env.get('PENDING_PAYMENT_MAX_MIN'), 1440);
    const kycMin = envInt(Deno.env.get('PENDING_KYC_MAX_MIN'), 2880);

    // Cuenta filas `pending` (en `statusCol`) más viejas que `maxMin` (en `tsCol`).
    async function countPending(
      table: string,
      statusCol: string,
      tsCol: string,
      maxMin: number
    ): Promise<number> {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq(statusCol, 'pending')
        .lt(tsCol, cutoffIso(now, maxMin));
      if (error) {
        console.error(`pending-monitor: count error on ${table}:`, error.message);
        return 0; // degradación segura: un check roto no tumba el resto
      }
      return count ?? 0;
    }

    const results: CheckResult[] = [
      {
        key: 'whatsapp',
        label: 'WhatsApp sin enviar (status=pending)',
        count: await countPending('whatsapp_messages', 'status', 'created_at', waMin),
        thresholdMin: waMin,
      },
      {
        key: 'payments',
        label: 'Pagos pendientes',
        count: await countPending('payments', 'payment_status', 'created_at', payMin),
        thresholdMin: payMin,
      },
      {
        key: 'kyc',
        label: 'KYC pendientes de revisión',
        count: await countPending('kyc_documents', 'status', 'created_at', kycMin),
        thresholdMin: kycMin,
      },
    ];

    const alerted = shouldAlert(results);
    let emailId: string | null = null;

    if (alerted) {
      const alertEmail = Deno.env.get('ALERT_EMAIL');
      const resendKey = Deno.env.get('RESEND_API_KEY');
      const envName = Deno.env.get('ENV_NAME') ?? 'prod';

      if (alertEmail && resendKey) {
        const { subject, html } = buildAlert(results, new Date().toISOString(), envName);
        const resp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: 'Boxifly Alertas <onboarding@resend.dev>',
            to: [alertEmail],
            subject,
            html,
          }),
        });
        const data = await resp.json().catch(() => ({}));
        emailId = data?.id ?? null;
        if (!resp.ok) console.error('pending-monitor: Resend error', resp.status, data);
      } else {
        console.warn('pending-monitor: alerta activa pero falta ALERT_EMAIL/RESEND_API_KEY');
      }
    }

    console.log(`pending-monitor: alerted=${alerted} ${JSON.stringify(results)} emailId=${emailId}`);

    return new Response(JSON.stringify({ ok: true, alerted, results, emailId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    console.error('pending-monitor error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
