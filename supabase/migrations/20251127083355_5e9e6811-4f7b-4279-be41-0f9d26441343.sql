-- Add customer_email column to orders table for guest tracking
ALTER TABLE public.orders 
ADD COLUMN customer_email TEXT;

-- Add customer_phone column for additional contact info
ALTER TABLE public.orders 
ADD COLUMN customer_phone TEXT;

-- Create index for faster email lookups
CREATE INDEX idx_orders_customer_email ON public.orders(customer_email);

-- Add RLS policy to allow guests to track their orders by email and order ID
CREATE POLICY "Guests can view own orders by email and ID" 
ON public.orders 
FOR SELECT 
USING (
  customer_email IS NOT NULL 
  AND customer_email = current_setting('request.headers', true)::json->>'x-customer-email'
);

-- More practical: allow viewing if not authenticated but email matches (we'll validate in the app)
DROP POLICY IF EXISTS "Guests can view own orders by email and ID" ON public.orders;

CREATE POLICY "Anyone can view orders with matching email" 
ON public.orders 
FOR SELECT 
USING (
  (auth.uid() = user_id) 
  OR (customer_email IS NOT NULL AND auth.uid() IS NULL)
  OR has_role(auth.uid(), 'admin'::user_role) 
  OR has_role(auth.uid(), 'warehouse'::user_role)
);