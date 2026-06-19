-- Create tracking_events table for multi-carrier tracking
CREATE TABLE IF NOT EXISTS public.tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  carrier TEXT NOT NULL, -- 'dhl', 'fedex', 'usps', 'ups', 'olva'
  tracking_number TEXT NOT NULL,
  status TEXT NOT NULL,
  location TEXT,
  description TEXT,
  event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  raw_data JSONB, -- Store complete API response for debugging
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_tracking_events_package_id ON public.tracking_events(package_id);
CREATE INDEX idx_tracking_events_carrier ON public.tracking_events(carrier);
CREATE INDEX idx_tracking_events_tracking_number ON public.tracking_events(tracking_number);
CREATE INDEX idx_tracking_events_event_timestamp ON public.tracking_events(event_timestamp DESC);

-- Enable RLS
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own package tracking"
  ON public.tracking_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.packages
      WHERE packages.id = tracking_events.package_id
      AND packages.user_id = auth.uid()
    )
  );

CREATE POLICY "Warehouse and admins can view all tracking"
  ON public.tracking_events
  FOR SELECT
  USING (
    has_role(auth.uid(), 'warehouse'::user_role) 
    OR has_role(auth.uid(), 'admin'::user_role)
  );

CREATE POLICY "System can insert tracking events"
  ON public.tracking_events
  FOR INSERT
  WITH CHECK (true);

-- Update trigger
CREATE TRIGGER update_tracking_events_updated_at
  BEFORE UPDATE ON public.tracking_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();