-- Add range-based rate tables to tariffs
ALTER TABLE public.tariffs
ADD COLUMN IF NOT EXISTS weight_rates jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS customs_handling_rates jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS guarantee_rates jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tax_threshold numeric DEFAULT 200;

COMMENT ON COLUMN public.tariffs.weight_rates IS 'Array of {weight_min, weight_max, rate} for transport charges by weight range';
COMMENT ON COLUMN public.tariffs.customs_handling_rates IS 'Array of {value_min, value_max, fee} for customs handling by invoice value range';
COMMENT ON COLUMN public.tariffs.guarantee_rates IS 'Array of {value_min, value_max, percentage} for guarantee program by declared value range';
COMMENT ON COLUMN public.tariffs.tax_threshold IS 'CIF threshold above which 18% tax applies (default $200)';