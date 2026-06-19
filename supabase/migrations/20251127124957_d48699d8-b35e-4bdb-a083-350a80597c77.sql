-- Add VIP program columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS vip_tier TEXT DEFAULT 'bronce',
ADD COLUMN IF NOT EXISTS vip_points_lifetime INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS vip_updated_at TIMESTAMPTZ DEFAULT now();

-- Create function to calculate VIP tier based on lifetime points
CREATE OR REPLACE FUNCTION calculate_vip_tier(lifetime_points INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF lifetime_points >= 1500 THEN
    RETURN 'platino';
  ELSIF lifetime_points >= 750 THEN
    RETURN 'oro';
  ELSIF lifetime_points >= 300 THEN
    RETURN 'plata';
  ELSE
    RETURN 'bronce';
  END IF;
END;
$$;

-- Create function to get VIP discount percentage
CREATE OR REPLACE FUNCTION get_vip_discount(tier TEXT)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  CASE tier
    WHEN 'platino' THEN RETURN 15.0;
    WHEN 'oro' THEN RETURN 10.0;
    WHEN 'plata' THEN RETURN 5.0;
    ELSE RETURN 0.0;
  END CASE;
END;
$$;

-- Create function to update user VIP tier
CREATE OR REPLACE FUNCTION update_user_vip_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_points INTEGER;
  new_tier TEXT;
BEGIN
  -- Calculate total lifetime points earned for the user
  SELECT COALESCE(SUM(points_earned), 0)
  INTO total_points
  FROM loyalty_points
  WHERE user_id = NEW.user_id
  AND transaction_type = 'earned';

  -- Calculate new tier
  new_tier := calculate_vip_tier(total_points);

  -- Update profile with new tier and lifetime points
  UPDATE profiles
  SET 
    vip_tier = new_tier,
    vip_points_lifetime = total_points,
    vip_updated_at = now()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Create trigger to update VIP tier when loyalty points change
DROP TRIGGER IF EXISTS trigger_update_vip_tier ON loyalty_points;
CREATE TRIGGER trigger_update_vip_tier
AFTER INSERT OR UPDATE ON loyalty_points
FOR EACH ROW
WHEN (NEW.transaction_type = 'earned')
EXECUTE FUNCTION update_user_vip_tier();

-- Create function to get VIP tier info
CREATE OR REPLACE FUNCTION get_vip_tier_info(p_user_id UUID)
RETURNS TABLE (
  tier TEXT,
  lifetime_points INTEGER,
  discount_percentage NUMERIC,
  next_tier TEXT,
  points_to_next_tier INTEGER
)
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

-- Update existing users to set initial VIP tier
DO $$
DECLARE
  user_record RECORD;
  total_points INTEGER;
  new_tier TEXT;
BEGIN
  FOR user_record IN SELECT DISTINCT user_id FROM loyalty_points
  LOOP
    -- Calculate total lifetime points for this user
    SELECT COALESCE(SUM(points_earned), 0)
    INTO total_points
    FROM loyalty_points
    WHERE user_id = user_record.user_id
    AND transaction_type = 'earned';

    -- Calculate tier
    new_tier := calculate_vip_tier(total_points);

    -- Update profile
    UPDATE profiles
    SET 
      vip_tier = new_tier,
      vip_points_lifetime = total_points,
      vip_updated_at = now()
    WHERE id = user_record.user_id;
  END LOOP;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_vip_tier ON profiles(vip_tier);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user_type ON loyalty_points(user_id, transaction_type);