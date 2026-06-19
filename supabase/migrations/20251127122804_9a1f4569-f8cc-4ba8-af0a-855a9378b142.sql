-- Update loyalty points trigger to award 1 point per S/33 spent
CREATE OR REPLACE FUNCTION public.award_loyalty_points_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
      -- Award 1 point for every 33 soles spent (rounded down)
      points_to_award := FLOOR(NEW.total_amount / 33);
      
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
          'Puntos ganados por compra en tienda online #' || SUBSTRING(NEW.id::TEXT, 1, 8),
          now() + interval '1 year'
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;