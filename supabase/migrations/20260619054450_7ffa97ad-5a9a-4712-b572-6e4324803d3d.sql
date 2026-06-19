
DROP POLICY IF EXISTS "System can insert loyalty points" ON public.loyalty_points;
CREATE POLICY "System can insert loyalty points" ON public.loyalty_points
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert webhook events" ON public.payments_webhooks;
CREATE POLICY "System can insert webhook events" ON public.payments_webhooks
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert PS notifications" ON public.ps_notifications;
CREATE POLICY "System can insert PS notifications" ON public.ps_notifications
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Sistema inserta pagos" ON public.ps_payments;
CREATE POLICY "Sistema inserta pagos" ON public.ps_payments
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can create rewards" ON public.referral_rewards;
CREATE POLICY "System can create rewards" ON public.referral_rewards
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert tracking events" ON public.tracking_events;
CREATE POLICY "System can insert tracking events" ON public.tracking_events
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert whatsapp messages" ON public.whatsapp_messages;
CREATE POLICY "System can insert whatsapp messages" ON public.whatsapp_messages
  FOR INSERT TO service_role WITH CHECK (true);
