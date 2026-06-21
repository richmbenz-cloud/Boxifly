// Edge Function: consultar-documento
// Consulta DNI (RENIEC) o RUC (SUNAT) usando la API de ApiInti de forma segura.
// El token NUNCA se expone al frontend: vive como secreto en Supabase (APIINTI_API_TOKEN).
//
// Despliegue:
//   supabase secrets set APIINTI_API_TOKEN=tu_token
//   supabase functions deploy consultar-documento
//
// Uso desde el frontend:
//   supabase.functions.invoke('consultar-documento', { body: { type: 'dni', numero: '12345678' } })

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const APIINTI_BASE = 'https://app.apiinti.dev/api/v1';

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Método no permitido' }, 405);
  }

  try {
    // 1) Exigir usuario autenticado (que el endpoint no quede público).
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ success: false, error: 'No autorizado' }, 401);
    }

    // 2) Token de ApiInti (secreto del servidor).
    const token = Deno.env.get('APIINTI_API_TOKEN');
    if (!token) {
      return jsonResponse({ success: false, error: 'Falta configurar APIINTI_API_TOKEN en el servidor' }, 500);
    }

    // 3) Validar entrada.
    const body = await req.json().catch(() => ({}));
    const tipo = String(body.type ?? body.tipo ?? '').toLowerCase();
    const numero = String(body.numero ?? body.number ?? '').replace(/\D/g, '');

    if (tipo !== 'dni' && tipo !== 'ruc') {
      return jsonResponse({ success: false, error: 'El campo "type" debe ser "dni" o "ruc"' }, 400);
    }
    if (tipo === 'dni' && !/^\d{8}$/.test(numero)) {
      return jsonResponse({ success: false, error: 'El DNI debe tener 8 dígitos' }, 400);
    }
    if (tipo === 'ruc' && !/^\d{11}$/.test(numero)) {
      return jsonResponse({ success: false, error: 'El RUC debe tener 11 dígitos' }, 400);
    }

    // 4) Consultar ApiInti.
    const resp = await fetch(`${APIINTI_BASE}/${tipo}/${numero}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const raw = await resp.json().catch(() => ({}));

    if (!resp.ok || !raw?.success) {
      const msg = raw?.message || raw?.error ||
        (resp.status === 404 ? `No se encontró el ${tipo.toUpperCase()}` : 'No se pudo consultar el documento');
      return jsonResponse({ success: false, error: msg }, resp.status === 404 ? 404 : 422);
    }

    // 5) Normalizar la respuesta.
    const d = raw.data ?? {};
    let normalized: Record<string, unknown>;

    if (tipo === 'dni') {
      const fullName = [d.nombres, d.apellidoPaterno, d.apellidoMaterno]
        .filter(Boolean)
        .join(' ')
        .trim();
      normalized = {
        type: 'dni',
        documentNumber: d.dni ?? numero,
        fullName,
        firstName: d.nombres ?? null,
        lastNameP: d.apellidoPaterno ?? null,
        lastNameM: d.apellidoMaterno ?? null,
      };
    } else {
      normalized = {
        type: 'ruc',
        documentNumber: d.ruc ?? numero,
        fullName: d.razonSocial ?? null,
        razonSocial: d.razonSocial ?? null,
        estado: d.estado ?? null,
        condicion: d.condicionDomicilio ?? null,
        direccion: d.direccion ?? null,
        ubigeo: d.ubigeo ?? null,
      };
    }

    return jsonResponse({ success: true, data: normalized });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('consultar-documento error:', message);
    return jsonResponse({ success: false, error: message }, 500);
  }
});
