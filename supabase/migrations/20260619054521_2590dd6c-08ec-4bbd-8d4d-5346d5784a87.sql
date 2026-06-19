
DROP POLICY IF EXISTS "Everyone can view active coupons" ON public.coupons;
CREATE POLICY "Authenticated users can view active coupons" ON public.coupons
  FOR SELECT TO authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));
