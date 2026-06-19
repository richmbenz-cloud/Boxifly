-- Make user_id nullable in orders table to support guest checkout
ALTER TABLE public.orders 
ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing RLS policy that requires auth.uid()
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;

-- Create new policy that allows authenticated users to create their own orders
CREATE POLICY "Users can create own orders"
ON public.orders
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND user_id IS NULL AND customer_email IS NOT NULL)
);

-- Update the view policy to allow guests to view their orders by email
DROP POLICY IF EXISTS "Anyone can view orders with matching email" ON public.orders;

CREATE POLICY "Guests and users can view own orders"
ON public.orders
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND customer_email IS NOT NULL) OR
  has_role(auth.uid(), 'admin'::user_role) OR 
  has_role(auth.uid(), 'warehouse'::user_role)
);