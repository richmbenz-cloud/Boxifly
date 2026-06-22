import { describe, it, expect } from 'vitest';
import {
  mapTagToStatus,
  statusAdvances,
  extractTracking,
  verifySignature,
  timingSafeEqual,
  checkFreshness,
} from './logic';

describe('mapTagToStatus', () => {
  it('tramo entrante: solo "Delivered" avanza a received_warehouse', () => {
    expect(mapTagToStatus('Delivered', true)).toBe('received_warehouse');
    expect(mapTagToStatus('InTransit', true)).toBeNull();
    expect(mapTagToStatus('OutForDelivery', true)).toBeNull();
  });

  it('tramo internacional: mapea tránsito y llegada a Perú', () => {
    expect(mapTagToStatus('InTransit', false)).toBe('in_transit');
    expect(mapTagToStatus('OutForDelivery', false)).toBe('in_transit');
    expect(mapTagToStatus('AttemptFail', false)).toBe('in_transit');
    expect(mapTagToStatus('Delivered', false)).toBe('arrived_peru');
    expect(mapTagToStatus('AvailableForPickup', false)).toBe('arrived_peru');
  });

  it('es case-insensitive y devuelve null para tags desconocidos', () => {
    expect(mapTagToStatus('delivered', true)).toBe('received_warehouse');
    expect(mapTagToStatus('INTRANSIT', false)).toBe('in_transit');
    expect(mapTagToStatus('Pending', false)).toBeNull();
    expect(mapTagToStatus('', false)).toBeNull();
  });
});

describe('statusAdvances (nunca retrocede)', () => {
  it('avanza hacia adelante', () => {
    expect(statusAdvances('prealerted', 'received_warehouse')).toBe(true);
    expect(statusAdvances('ready_international', 'in_transit')).toBe(true);
    expect(statusAdvances('in_transit', 'arrived_peru')).toBe(true);
  });

  it('NO retrocede ni se queda igual', () => {
    expect(statusAdvances('consolidated', 'received_warehouse')).toBe(false);
    expect(statusAdvances('arrived_peru', 'in_transit')).toBe(false);
    expect(statusAdvances('in_transit', 'in_transit')).toBe(false);
  });

  it('null no avanza', () => {
    expect(statusAdvances('prealerted', null)).toBe(false);
  });
});

describe('extractTracking', () => {
  it('soporta los distintos envoltorios del payload', () => {
    expect(extractTracking({ msg: { tracking_number: 'A' } })).toEqual({ tracking_number: 'A' });
    expect(extractTracking({ data: { tracking: { tracking_number: 'B' } } })).toEqual({
      tracking_number: 'B',
    });
    expect(extractTracking({ tracking: { tracking_number: 'C' } })).toEqual({ tracking_number: 'C' });
    expect(extractTracking({})).toBeNull();
  });
});

describe('timingSafeEqual', () => {
  it('compara correctamente', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true);
    expect(timingSafeEqual('abc', 'abd')).toBe(false);
    expect(timingSafeEqual('abc', 'abcd')).toBe(false);
  });
});

describe('verifySignature (HMAC-SHA256 base64)', () => {
  const secret = 'test-webhook-secret';
  const body = JSON.stringify({ msg: { tracking_number: 'TN123', tag: 'InTransit' } });

  async function sign(rawBody: string, key: string): Promise<string> {
    const enc = new TextEncoder();
    const k = await crypto.subtle.importKey(
      'raw',
      enc.encode(key),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const mac = await crypto.subtle.sign('HMAC', k, enc.encode(rawBody));
    return btoa(String.fromCharCode(...new Uint8Array(mac)));
  }

  it('acepta una firma válida', async () => {
    const sig = await sign(body, secret);
    expect(await verifySignature(body, sig, secret)).toBe(true);
  });

  it('rechaza firma con secret incorrecto', async () => {
    const sig = await sign(body, 'otro-secret');
    expect(await verifySignature(body, sig, secret)).toBe(false);
  });

  it('rechaza si el cuerpo fue manipulado', async () => {
    const sig = await sign(body, secret);
    expect(await verifySignature(body + 'x', sig, secret)).toBe(false);
  });

  it('rechaza firma vacía o secret vacío', async () => {
    const sig = await sign(body, secret);
    expect(await verifySignature(body, '', secret)).toBe(false);
    expect(await verifySignature(body, sig, '')).toBe(false);
  });
});

describe('checkFreshness (anti-replay)', () => {
  const now = 1_700_000_000_000;
  const nowSec = now / 1000;

  it('sin ts no bloquea', () => {
    expect(checkFreshness(undefined, now, 86400).ok).toBe(true);
    expect(checkFreshness(0, now, 86400).ok).toBe(true);
    expect(checkFreshness('nan', now, 86400).ok).toBe(true);
  });

  it('acepta eventos recientes', () => {
    expect(checkFreshness(nowSec - 60, now, 86400).ok).toBe(true);
  });

  it('rechaza eventos del futuro más allá del skew', () => {
    const r = checkFreshness(nowSec + 1000, now, 86400, 300);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('future_timestamp');
  });

  it('rechaza eventos más viejos que maxAge', () => {
    const r = checkFreshness(nowSec - 90000, now, 86400);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('stale_timestamp');
  });

  it('maxAge = 0 desactiva el chequeo de antigüedad', () => {
    expect(checkFreshness(nowSec - 10_000_000, now, 0).ok).toBe(true);
  });
});
