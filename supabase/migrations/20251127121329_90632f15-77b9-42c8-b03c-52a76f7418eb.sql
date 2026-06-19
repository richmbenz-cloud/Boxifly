-- Create loyalty points table
CREATE TABLE IF NOT EXISTS public.loyalty_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  points_earned INTEGER NOT NULL DEFAULT 0,
  points_spent INTEGER NOT NULL DEFAULT 0,
  points_balance INTEGER NOT NULL DEFAULT 0,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'expired')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

-- Users can view their own points
CREATE POLICY "Users can view own loyalty points"
  ON public.loyalty_points
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert points
CREATE POLICY "System can insert loyalty points"
  ON public.loyalty_points
  FOR INSERT
  WITH CHECK (true);

-- Admins can manage all points
CREATE POLICY "Admins can manage all loyalty points"
  ON public.loyalty_points
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::user_role));

-- Create indexes
CREATE INDEX idx_loyalty_points_user_id ON public.loyalty_points(user_id);
CREATE INDEX idx_loyalty_points_order_id ON public.loyalty_points(order_id);
CREATE INDEX idx_loyalty_points_created_at ON public.loyalty_points(created_at DESC);

-- Create function to calculate total points balance for a user
CREATE OR REPLACE FUNCTION public.get_user_points_balance(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(points_earned - points_spent), 0)::INTEGER
  FROM public.loyalty_points
  WHERE user_id = p_user_id
  AND (expires_at IS NULL OR expires_at > now());
$$;

-- Create trigger function to award points on order completion
CREATE OR REPLACE FUNCTION public.award_loyalty_points_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  points_to_award INTEGER;
  user_exists BOOLEAN;
BEGIN
  -- Only award points when order status changes to 'delivered'
  IF (TG_OP = 'UPDATE' AND NEW.status = 'delivered' AND OLD.status != 'delivered') THEN
    -- Check if user is a real user (not a guest)
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = NEW.user_id::uuid) INTO user_exists;
    
    IF user_exists THEN
      -- Award 1 point for every 10 soles spent (rounded down)
      points_to_award := FLOOR(NEW.total_amount / 10);
      
      IF points_to_award > 0 THEN
        INSERT INTO public.loyalty_points (
          user_id,
          order_id,
          points_earned,
          points_balance,
          transaction_type,
          description,
          expires_at
        ) VALUES (
          NEW.user_id,
          NEW.id,
          points_to_award,
          points_to_award,
          'earned',
          'Puntos ganados por pedido #' || SUBSTRING(NEW.id::TEXT, 1, 8),
          now() + interval '1 year'
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_award_loyalty_points ON public.orders;
CREATE TRIGGER trigger_award_loyalty_points
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.award_loyalty_points_on_order();