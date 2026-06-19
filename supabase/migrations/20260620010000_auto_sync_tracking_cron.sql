-- ============================================================
-- Auto-sync de tracking: ejecutar la Edge Function `sync-tracking`
-- periódicamente para que el estado de los paquetes avance solo.
--
-- Flujo: pg_cron (cada 2h) -> pg_net.http_post -> sync-tracking
--        -> consulta Aftership -> UPDATE packages.current_status
--        -> (triggers existentes) -> WhatsApp + notificación in-app.
--
-- Config requerida (se setea UNA vez, ver AFTERSHIP_INTEGRATION.md):
--   ALTER DATABASE postgres SET app.sync_tracking_url =
--     'https://<proj>.supabase.co/functions/v1/sync-tracking';
--   ALTER DATABASE postgres SET app.service_role_key = '<SERVICE_ROLE_KEY>';
-- (app.service_role_key ya se usa para el Pilar #1.)
-- ============================================================

-- Extensiones necesarias (idempotente).
CREATE EXTENSION IF NOT EXISTS pg_net  WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Quitar el job previo si existiera (re-ejecución segura de la migración).
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'sync-tracking-every-2h';

-- Programar la sincronización cada 2 horas.
-- El POST solo se dispara si la URL está configurada (degradación segura).
SELECT cron.schedule(
  'sync-tracking-every-2h',
  '0 */2 * * *',
  $$
  SELECT net.http_post(
    url     := current_setting('app.sync_tracking_url', true),
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body    := '{}'::jsonb
  )
  WHERE current_setting('app.sync_tracking_url', true) IS NOT NULL
    AND length(trim(current_setting('app.sync_tracking_url', true))) > 0;
  $$
);
