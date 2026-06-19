-- Create table for Culqi webhook events
CREATE TABLE IF NOT EXISTS public.payments_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  charge_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  raw JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments_webhooks ENABLE ROW LEVEL SECURITY;

-- Allow system/service to insert webhook events
CREATE POLICY "System can insert webhook events"
  ON public.payments_webhooks
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view webhook events
CREATE POLICY "Admins can view webhook events"
  ON public.payments_webhooks
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::user_role));

-- Create index for faster queries
CREATE INDEX idx_payments_webhooks_charge_id ON public.payments_webhooks(charge_id);
CREATE INDEX idx_payments_webhooks_event_type ON public.payments_webhooks(event_type);
CREATE INDEX idx_payments_webhooks_created_at ON public.payments_webhooks(created_at DESC);