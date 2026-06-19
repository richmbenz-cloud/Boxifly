
-- 1. Storage: remove broad SELECT policies (public CDN URLs continue to work for public buckets)
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view user avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view package photos" ON storage.objects;

-- 2. Trigger / system-only SECURITY DEFINER functions (called only by triggers or service_role)
DO $$
DECLARE
  fn text;
  trigger_fns text[] := ARRAY[
    'award_loyalty_points_on_order()',
    'block_ps_order_advance_without_approval()',
    'check_budget_exhausted_after_approval()',
    'handle_new_user_registration()',
    'log_ps_order_status_change()',
    'notify_admin_new_request()',
    'notify_live_proposal_created()',
    'notify_on_order_status_change()',
    'notify_on_quote_created()',
    'notify_on_quote_response()',
    'notify_package_status_change()',
    'notify_vip_upgrade()',
    'send_whatsapp_on_status_change()',
    'track_package_status_change()',
    'update_user_vip_tier()',
    'expire_ps_quotes()',
    'generate_referral_code()',
    'can_advance_ps_order_status(uuid, ps_order_status)',
    'check_budget_available(uuid, numeric)',
    'create_ps_notification(uuid, text, text, text, uuid, uuid, uuid, jsonb)',
    'complete_referral(uuid)',
    'apply_silence_rule_to_proposal(uuid)'
  ];
BEGIN
  FOREACH fn IN ARRAY trigger_fns LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', fn);
  END LOOP;
END $$;

-- 3. User-facing RPC functions: revoke anon only; keep authenticated
DO $$
DECLARE
  fn text;
  user_fns text[] := ARRAY[
    'approve_live_proposal(uuid, uuid)',
    'reject_live_proposal(uuid, uuid, text)',
    'approve_ps_quote(uuid, uuid, text, text)',
    'reject_ps_quote(uuid, uuid, text, text, text)',
    'start_ps_live_session(uuid)',
    'pause_ps_live_session(uuid)',
    'resume_ps_live_session(uuid)',
    'end_ps_live_session(uuid)',
    'create_ps_live_proposal(uuid, uuid, text, numeric, text, text, text, text)',
    'get_user_points_balance(uuid)',
    'get_vip_tier_info(uuid)',
    'has_role(uuid, user_role)'
  ];
BEGIN
  FOREACH fn IN ARRAY user_fns LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon', fn);
  END LOOP;
END $$;
