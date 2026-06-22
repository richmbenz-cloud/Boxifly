// ============================================================
// aftership-webhook/logic.ts — lógica pura y testeable (sin dependencias Deno).
//
// Aislada del runtime (sin `serve`/`Deno.*`) para poder cubrirla con vitest.
// Solo usa APIs web estándar (Web Crypto, TextEncoder, btoa), disponibles
// tanto en Deno (Edge Functions) como en Node 20 (CI/tests).
// ============================================================

// Orden del flujo para no retroceder nunca de estado (idéntico a sync-tracking).
export const STATUS_ORDER: Record<string, number> = {
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
export function mapTagToStatus(tag: string, isInbound: boolean): string | null {
  const t = (tag || '').toLowerCase();
  if (isInbound) {
    if (t === 'delivered') return 'received_warehouse';
    return null;
  }
  if (t === 'delivered' || t === 'availableforpickup') return 'arrived_peru';
  if (t === 'intransit' || t === 'outfordelivery' || t === 'attemptfail') return 'in_transit';
  return null;
}

// ¿El nuevo estado avanza respecto al actual? (nunca retrocede)
export function statusAdvances(current: string, next: string | null): next is string {
  if (next === null) return false;
  return (STATUS_ORDER[next] ?? -1) > (STATUS_ORDER[current] ?? -1);
}

// Extrae el objeto de tracking del payload del webhook (Tracking API: `msg`).
export function extractTracking(payload: any): any | null {
  return payload?.msg ?? payload?.data?.tracking ?? payload?.data ?? payload?.tracking ?? null;
}

// Verifica la firma HMAC-SHA256 (base64) del header `aftership-hmac-sha256`.
export async function verifySignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!signature || !secret) return false;
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
  return timingSafeEqual(computed, signature);
}

// Comparación de strings en tiempo constante (evita timing attacks).
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// Guard de frescura / anti-replay. `ts` en segundos unix. Sin ts -> no bloquea.
// Default `maxAgeSec` generoso (24h) para no descartar reintentos legítimos.
export function checkFreshness(
  ts: unknown,
  nowMs: number,
  maxAgeSec: number,
  maxSkewSec = 300
): { ok: boolean; reason?: string } {
  const tsNum = typeof ts === 'number' ? ts : Number(ts);
  if (!Number.isFinite(tsNum) || tsNum <= 0) return { ok: true };
  const ageSec = nowMs / 1000 - tsNum;
  if (ageSec < -maxSkewSec) return { ok: false, reason: 'future_timestamp' };
  if (maxAgeSec > 0 && ageSec > maxAgeSec) return { ok: false, reason: 'stale_timestamp' };
  return { ok: true };
}
