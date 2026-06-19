-- Add verification status to profiles for shoppers
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS shopper_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shopper_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS shopper_verified_by UUID REFERENCES auth.users(id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_shopper_verified ON public.profiles(shopper_verified) WHERE shopper_verified = true;

-- Update RLS policies for shopping_requests to only allow verified shoppers
DROP POLICY IF EXISTS "Shoppers can view assigned requests" ON public.shopping_requests;
DROP POLICY IF EXISTS "Shoppers can update assigned requests" ON public.shopping_requests;

-- Only verified shoppers can view available requests
CREATE POLICY "Verified shoppers can view available and assigned requests"
ON public.shopping_requests
FOR SELECT
TO authenticated
USING (
  (auth.uid() = shopper_id) OR 
  (
    shopper_id IS NULL AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND shopper_verified = true
    )
  )
);

-- Only verified shoppers can update assigned requests
CREATE POLICY "Verified shoppers can update assigned requests"
ON public.shopping_requests
FOR UPDATE
TO authenticated
USING (
  auth.uid() = shopper_id AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND shopper_verified = true
  )
);

-- Only verified shoppers can accept requests (set themselves as shopper)
CREATE POLICY "Verified shoppers can accept requests"
ON public.shopping_requests
FOR UPDATE
TO authenticated
USING (
  shopper_id IS NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND shopper_verified = true
  )
)
WITH CHECK (
  auth.uid() = shopper_id AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND shopper_verified = true
  )
);