-- Create traveler_trips table for travelers who transport packages
CREATE TABLE public.traveler_trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  traveler_id UUID NOT NULL,
  package_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  commission NUMERIC NOT NULL DEFAULT 0,
  travel_date TIMESTAMP WITH TIME ZONE,
  origin TEXT NOT NULL DEFAULT 'Miami, USA',
  destination TEXT NOT NULL DEFAULT 'Lima, Peru',
  weight NUMERIC,
  notes TEXT,
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_traveler_trips_traveler_id ON public.traveler_trips(traveler_id);
CREATE INDEX idx_traveler_trips_package_id ON public.traveler_trips(package_id);
CREATE INDEX idx_traveler_trips_status ON public.traveler_trips(status);

-- Enable Row Level Security
ALTER TABLE public.traveler_trips ENABLE ROW LEVEL SECURITY;

-- Create policies for traveler_trips
CREATE POLICY "Travelers can view own trips" 
ON public.traveler_trips 
FOR SELECT 
USING (auth.uid() = traveler_id);

CREATE POLICY "Travelers can accept trips" 
ON public.traveler_trips 
FOR INSERT 
WITH CHECK (auth.uid() = traveler_id);

CREATE POLICY "Travelers can update own trips" 
ON public.traveler_trips 
FOR UPDATE 
USING (auth.uid() = traveler_id);

CREATE POLICY "Admins can manage all trips" 
ON public.traveler_trips 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_traveler_trips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_traveler_trips_updated_at
BEFORE UPDATE ON public.traveler_trips
FOR EACH ROW
EXECUTE FUNCTION public.update_traveler_trips_updated_at();