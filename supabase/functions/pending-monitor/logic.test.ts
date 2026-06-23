import { describe, it, expect } from 'vitest';
import { envInt, cutoffIso, shouldAlert, totalPending, buildAlert, type CheckResult } from './logic';

describe('envInt', () => {
  it('usa el fallback con valores inválidos o no positivos', () => {
    expect(envInt(undefined, 30)).toBe(30);
    expect(envInt('', 30)).toBe(30);
    expect(envInt('abc', 30)).toBe(30);
    expect(envInt('0', 30)).toBe(30);
    expect(envInt('-5', 30)).toBe(30);
  });
  it('parsea enteros válidos', () => {
    expect(envInt('45', 30)).toBe(45);
    expect(envInt('15.9', 30)).toBe(15);
  });
});

describe('cutoffIso', () => {
  it('resta los minutos indicados de "ahora"', () => {
    const now = Date.parse('2026-06-23T12:00:00.000Z');
    expect(cutoffIso(now, 30)).toBe('2026-06-23T11:30:00.000Z');
    expect(cutoffIso(now, 1440)).toBe('2026-06-22T12:00:00.000Z');
  });
});

const mk = (count: number): CheckResult[] => [
  { key: 'whatsapp', label: 'WhatsApp sin enviar (status=pending)', count, thresholdMin: 30 },
  { key: 'payments', label: 'Pagos pendientes', count: 0, thresholdMin: 1440 },
  { key: 'kyc', label: 'KYC pendientes de revisión', count: 0, thresholdMin: 2880 },
];

describe('shouldAlert / totalPending', () => {
  it('no alerta si todo está en cero', () => {
    expect(shouldAlert(mk(0))).toBe(false);
    expect(totalPending(mk(0))).toBe(0);
  });
  it('alerta si algún check tiene pendientes', () => {
    expect(shouldAlert(mk(3))).toBe(true);
    expect(totalPending(mk(3))).toBe(3);
  });
  it('ignora counts negativos en el total', () => {
    const r: CheckResult[] = [{ key: 'x', label: 'x', count: -2, thresholdMin: 10 }];
    expect(totalPending(r)).toBe(0);
  });
});

describe('buildAlert', () => {
  it('arma asunto/html/texto solo con los checks vencidos', () => {
    const { subject, html, text } = buildAlert(mk(2), '2026-06-23T12:00:00.000Z', 'staging');
    expect(subject).toContain('[staging]');
    expect(subject).toContain('2 pendiente');
    expect(html).toContain('WhatsApp sin enviar');
    expect(html).not.toContain('Pagos pendientes'); // count 0 -> no aparece
    expect(text).toContain('- WhatsApp sin enviar (status=pending): 2 (> 30 min)');
  });
});
