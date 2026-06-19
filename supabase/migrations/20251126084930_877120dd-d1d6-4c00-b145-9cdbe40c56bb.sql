-- Add affidavit completion tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS affidavit_signed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS affidavit_signed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS affidavit_signature_url TEXT;

-- Create a table to store signed affidavit documents
CREATE TABLE IF NOT EXISTS public.traveler_affidavits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_dni TEXT NOT NULL,
  client_address TEXT NOT NULL,
  traveler_name TEXT NOT NULL,
  traveler_dni TEXT NOT NULL,
  signature_data TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.traveler_affidavits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own affidavits
CREATE POLICY "Users can view own affidavits"
  ON public.traveler_affidavits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own affidavits
CREATE POLICY "Users can insert own affidavits"
  ON public.traveler_affidavits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all affidavits
CREATE POLICY "Admins can view all affidavits"
  ON public.traveler_affidavits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_traveler_affidavits_user_id ON public.traveler_affidavits(user_id);
CREATE INDEX IF NOT EXISTS idx_traveler_affidavits_signed_at ON public.traveler_affidavits(signed_at DESC);