-- Fix 1: Orders RLS policy - Remove vulnerable guest access condition
DROP POLICY IF EXISTS "Guests and users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

CREATE POLICY "Users can view own orders" 
ON orders FOR SELECT 
USING (
  auth.uid() = user_id OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'warehouse')
);

-- Fix 2: Update get_user_points_balance to include authorization check
CREATE OR REPLACE FUNCTION public.get_user_points_balance(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Authorize: user can only query their own points or admin can query any
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() != p_user_id AND NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: cannot access other users points';
  END IF;
  
  RETURN (
    SELECT COALESCE(SUM(points_earned - points_spent), 0)::INTEGER
    FROM public.loyalty_points
    WHERE user_id = p_user_id
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;

-- Fix 3: Update get_vip_tier_info to include authorization check
CREATE OR REPLACE FUNCTION public.get_vip_tier_info(p_user_id uuid)
RETURNS TABLE(tier text, lifetime_points integer, discount_percentage numeric, next_tier text, points_to_next_tier integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tier TEXT;
  user_points INTEGER;
  points_needed INTEGER;
BEGIN
  -- Authorize: user can only query their own tier info or admin can query any
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() != p_user_id AND NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: cannot access other users VIP info';
  END IF;

  -- Get user's current tier and lifetime points
  SELECT vip_tier, vip_points_lifetime
  INTO user_tier, user_points
  FROM profiles
  WHERE id = p_user_id;

  -- Calculate next tier and points needed
  IF user_tier = 'bronce' THEN
    next_tier := 'plata';
    points_needed := 300 - user_points;
  ELSIF user_tier = 'plata' THEN
    next_tier := 'oro';
    points_needed := 750 - user_points;
  ELSIF user_tier = 'oro' THEN
    next_tier := 'platino';
    points_needed := 1500 - user_points;
  ELSE
    next_tier := NULL;
    points_needed := 0;
  END IF;

  RETURN QUERY
  SELECT 
    user_tier,
    user_points,
    get_vip_discount(user_tier),
    next_tier,
    GREATEST(0, points_needed);
END;
$$;