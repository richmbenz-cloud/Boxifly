-- Create shopping_requests table for personal shopper service
CREATE TABLE public.shopping_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  shopper_id UUID,
  product_name TEXT NOT NULL,
  product_url TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  approximate_price NUMERIC,
  product_description TEXT,
  special_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  shopper_commission NUMERIC DEFAULT 0,
  actual_cost NUMERIC,
  purchased_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  tracking_number TEXT,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX idx_shopping_requests_customer_id ON public.shopping_requests(customer_id);
CREATE INDEX idx_shopping_requests_shopper_id ON public.shopping_requests(shopper_id);
CREATE INDEX idx_shopping_requests_status ON public.shopping_requests(status);

-- Enable Row Level Security
ALTER TABLE public.shopping_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for shopping_requests
CREATE POLICY "Customers can view own requests" 
ON public.shopping_requests 
FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create requests" 
ON public.shopping_requests 
FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Shoppers can view assigned requests" 
ON public.shopping_requests 
FOR SELECT 
USING (auth.uid() = shopper_id OR shopper_id IS NULL);

CREATE POLICY "Shoppers can update assigned requests" 
ON public.shopping_requests 
FOR UPDATE 
USING (auth.uid() = shopper_id);

CREATE POLICY "Admins can manage all requests" 
ON public.shopping_requests 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_shopping_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_shopping_requests_updated_at
BEFORE UPDATE ON public.shopping_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_shopping_requests_updated_at();

-- Create shopping_messages table for communication
CREATE TABLE public.shopping_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.shopping_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for messages
CREATE INDEX idx_shopping_messages_request_id ON public.shopping_messages(request_id);

-- Enable RLS on messages
ALTER TABLE public.shopping_messages ENABLE ROW LEVEL SECURITY;

-- Policies for messages
CREATE POLICY "Users can view messages for their requests" 
ON public.shopping_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.shopping_requests 
    WHERE id = request_id 
    AND (customer_id = auth.uid() OR shopper_id = auth.uid())
  )
);

CREATE POLICY "Users can create messages for their requests" 
ON public.shopping_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.shopping_requests 
    WHERE id = request_id 
    AND (customer_id = auth.uid() OR shopper_id = auth.uid())
  )
);