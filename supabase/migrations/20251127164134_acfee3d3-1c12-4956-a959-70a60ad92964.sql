-- Add custom_charges column to tariffs table to store additional charges
ALTER TABLE public.tariffs 
ADD COLUMN IF NOT EXISTS custom_charges JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN public.tariffs.custom_charges IS 'Array of custom charges: [{"name": "Programa de Garantía", "amount": 0}]';