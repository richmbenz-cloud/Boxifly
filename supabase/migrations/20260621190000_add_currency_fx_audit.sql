-- Currency selector (USD/PEN) + FX audit for Izipay payments.
-- Adds per-payment currency/exchange-rate audit columns and a daily
-- SBS/SUNAT exchange-rate cache table. Aligned with SUNAT (casa de cambio).

-- 1. Audit columns on the existing webhook/payment log table.
ALTER TABLE public.payments_webhooks
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'PEN',
  ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(12,6),
  ADD COLUMN IF NOT EXISTS base_amount_pen NUMERIC(12,2);

COMMENT ON COLUMN public.payments_webhooks.currency IS 'Charge currency sent to Izipay (PEN or USD).';
COMMENT ON COLUMN public.payments_webhooks.exchange_rate IS 'Effective PEN->USD rate applied (SBS venta with margin). NULL for native PEN charges.';
COMMENT ON COLUMN public.payments_webhooks.base_amount_pen IS 'Order total in soles (canonical), regardless of charge currency.';

-- 2. Daily exchange-rate cache (one row per day/currency pair).
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_date DATE NOT NULL,
  base_currency TEXT NOT NULL DEFAULT 'USD',
  quote_currency TEXT NOT NULL DEFAULT 'PEN',
  sbs_venta NUMERIC(12,6) NOT NULL,
  sbs_compra NUMERIC(12,6),
  margin NUMERIC(6,4) NOT NULL DEFAULT 0.02,
  effective_rate NUMERIC(12,6) NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (rate_date, base_currency, quote_currency)
);

COMMENT ON TABLE public.exchange_rates IS 'Daily SBS/SUNAT USD->PEN rate cache. effective_rate = sbs_venta / (1 + margin); amount_usd = amount_pen / effective_rate.';

-- 3. RLS: only the service role (edge function) writes; admins can read for audit.
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view exchange rates"
  ON public.exchange_rates
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::user_role));

-- 4. Fast lookup of the latest rate.
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON public.exchange_rates(rate_date DESC);
