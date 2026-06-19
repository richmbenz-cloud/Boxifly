-- Create storage bucket for package photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('package-photos', 'package-photos', true);

-- RLS policies for package-photos bucket
CREATE POLICY "Anyone can view package photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'package-photos');

CREATE POLICY "Authenticated users can upload package photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'package-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own package photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'package-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own package photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'package-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add delivery_type column to packages table
ALTER TABLE public.packages 
ADD COLUMN delivery_type TEXT DEFAULT 'pickup';

-- Create tariffs table for dynamic pricing
CREATE TABLE public.tariffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  base_rate_per_kg DECIMAL(10,2) NOT NULL,
  customs_percentage DECIMAL(5,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.tariffs ENABLE ROW LEVEL SECURITY;

-- RLS for tariffs
CREATE POLICY "Everyone can view active tariffs"
ON public.tariffs FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage tariffs"
ON public.tariffs FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default tariff
INSERT INTO public.tariffs (name, base_rate_per_kg, customs_percentage, delivery_fee)
VALUES ('Tarifa Estándar', 8.50, 18.0, 15.00);

-- Add trigger for tariffs updated_at
CREATE TRIGGER update_tariffs_updated_at
  BEFORE UPDATE ON public.tariffs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add volumetric_weight to packages
ALTER TABLE public.packages
ADD COLUMN volumetric_weight DECIMAL(10,2);

-- Add cost breakdown columns
ALTER TABLE public.packages
ADD COLUMN weight_cost DECIMAL(10,2),
ADD COLUMN customs_cost DECIMAL(10,2),
ADD COLUMN delivery_cost DECIMAL(10,2);

-- Create function to calculate volumetric weight
CREATE OR REPLACE FUNCTION public.calculate_volumetric_weight(
  dimensions_str TEXT
)
RETURNS DECIMAL AS $$
DECLARE
  length_cm DECIMAL;
  width_cm DECIMAL;
  height_cm DECIMAL;
  volumetric DECIMAL;
BEGIN
  -- Parse dimensions (format: "LxWxH")
  IF dimensions_str IS NULL OR dimensions_str = '' THEN
    RETURN 0;
  END IF;
  
  -- Simple parsing (assumes format like "30x20x15")
  length_cm := SPLIT_PART(dimensions_str, 'x', 1)::DECIMAL;
  width_cm := SPLIT_PART(dimensions_str, 'x', 2)::DECIMAL;
  height_cm := SPLIT_PART(dimensions_str, 'x', 3)::DECIMAL;
  
  -- Volumetric weight formula: (L x W x H) / 5000
  volumetric := (length_cm * width_cm * height_cm) / 5000.0;
  
  RETURN volumetric;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END;
$$ LANGUAGE plpgsql;