import { describe, it, expect } from 'vitest';
import { convertPenToUsd, formatMoney } from './currency';

describe('convertPenToUsd', () => {
  it('converts soles to USD using the effective rate', () => {
    // effective_rate = 3.386 / 1.02 = 3.31961 -> 100 / 3.31961 = 30.12
    expect(convertPenToUsd(100, 3.319608)).toBeCloseTo(30.12, 2);
  });

  it('rounds to 2 decimals', () => {
    expect(convertPenToUsd(50, 3.319608)).toBe(15.06);
  });

  it('throws when the rate is missing or invalid', () => {
    expect(() => convertPenToUsd(100, 0)).toThrow();
    expect(() => convertPenToUsd(100, -1)).toThrow();
  });
});

describe('formatMoney', () => {
  it('formats PEN with S/ symbol', () => {
    expect(formatMoney(100, 'PEN')).toBe('S/ 100.00');
  });
  it('formats USD with US$ symbol', () => {
    expect(formatMoney(30.1, 'USD')).toBe('US$ 30.10');
  });
});
