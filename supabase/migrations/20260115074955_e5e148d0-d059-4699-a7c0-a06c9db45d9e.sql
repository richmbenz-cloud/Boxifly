-- Fix search_path for all PS Live functions
ALTER FUNCTION check_budget_available(UUID, NUMERIC) SET search_path = public;
ALTER FUNCTION approve_live_proposal(UUID, UUID) SET search_path = public;
ALTER FUNCTION reject_live_proposal(UUID, UUID, TEXT) SET search_path = public;
ALTER FUNCTION update_ps_live_orders_updated_at() SET search_path = public;
ALTER FUNCTION notify_live_proposal_created() SET search_path = public;
ALTER FUNCTION block_proposal_over_budget() SET search_path = public;