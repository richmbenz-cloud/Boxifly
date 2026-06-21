export type Currency = 'PEN' | 'USD';

/**
 * Convert a soles (PEN) amount into USD using the effective rate returned by
 * the `exchange-rate` edge function. The effective rate already includes the
 * configured margin, so the customer pays slightly more USD and the FX spread
 * never produces a loss when the dollars are converted back to soles.
 *
 * amount_usd = amount_pen / effective_rate
 */
export function convertPenToUsd(amountPen: number, effectiveRate: number): number {
  if (!effectiveRate || effectiveRate <= 0) {
    throw new Error('Tipo de cambio no disponible');
  }
  return Math.round((amountPen / effectiveRate) * 100) / 100;
}

/** Format a money amount with the right symbol for the given currency. */
export function formatMoney(amount: number, currency: Currency): string {
  const symbol = currency === 'USD' ? 'US$' : 'S/';
  return `${symbol} ${amount.toFixed(2)}`;
}
