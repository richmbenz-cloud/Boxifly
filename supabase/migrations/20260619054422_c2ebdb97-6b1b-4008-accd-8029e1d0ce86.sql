
-- 1. referral_codes: remove public SELECT
DROP POLICY IF EXISTS "Anyone can view active codes for signup" ON public.referral_codes;

-- 2. testimonials: require authenticated user to insert
DROP POLICY IF EXISTS "Users can create testimonials" ON public.testimonials;
CREATE POLICY "Authenticated users can create testimonials"
  ON public.testimonials FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3. newsletter_subscribers: keep public insert but validate email
DROP POLICY IF EXISTS "Users can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe with valid email"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (email IS NOT NULL AND length(trim(email)) > 3 AND email LIKE '%@%');

-- 4. Fix functions with mutable search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_vip_tier(lifetime_points integer)
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_vip_discount(tier text)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $function$
BEGIN
  CASE tier
    WHEN 'platino' THEN RETURN 15.0;
    WHEN 'oro' THEN RETURN 10.0;
    WHEN 'plata' THEN RETURN 5.0;
    ELSE RETURN 0.0;
  END CASE;
END;
$function$;
