-- Add traveler verification fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS traveler_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS traveler_verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS traveler_verified_by uuid REFERENCES auth.users(id);

-- Create KYC documents table
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_role text NOT NULL CHECK (user_role IN ('traveler', 'shopper')),
  document_type text NOT NULL CHECK (document_type IN ('dni', 'passport', 'license', 'selfie', 'proof_address')),
  document_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on kyc_documents
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- Users can view their own KYC documents
CREATE POLICY "Users can view own kyc documents"
ON public.kyc_documents
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own KYC documents
CREATE POLICY "Users can insert own kyc documents"
ON public.kyc_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending KYC documents
CREATE POLICY "Users can update own pending kyc documents"
ON public.kyc_documents
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all KYC documents
CREATE POLICY "Admins can view all kyc documents"
ON public.kyc_documents
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update KYC documents (review)
CREATE POLICY "Admins can update kyc documents"
ON public.kyc_documents
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON public.kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON public.kyc_documents(status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_role ON public.kyc_documents(user_role);

-- Add trigger for updated_at
CREATE TRIGGER update_kyc_documents_updated_at
BEFORE UPDATE ON public.kyc_documents
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();