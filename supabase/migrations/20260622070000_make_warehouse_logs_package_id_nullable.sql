-- Make warehouse_logs.package_id nullable as a safety net.
--
-- Root cause of "warehouse_logs never records anything":
--   supabase/functions/whatsapp-notify/index.ts inserted `parameters.trackingNumber || 'N/A'`
--   into warehouse_logs.package_id, which is a uuid FK -> packages.id. A tracking number
--   (or the literal 'N/A') is not a valid package UUID, so every insert failed with a
--   foreign-key violation (SQLSTATE 23503) and no row was ever written.
--
-- The primary fix lives in the edge function (it now resolves the real package UUID by
-- tracking_number). This migration is the defensive complement: allow NULL so a
-- notification log is never lost when a package cannot be resolved. The foreign-key
-- constraint is preserved and still rejects non-existent UUIDs; only NULL is permitted.

alter table public.warehouse_logs
  alter column package_id drop not null;
