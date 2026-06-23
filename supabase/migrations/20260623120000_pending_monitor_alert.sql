-- ============================================================
-- Alerta de monitoreo de "pendientes" — cron de la Edge Function `pending-monitor`.
--
-- Programa un job pg_cron (cada 15 min) que invoca, vía pg_net, la Edge
-- Function `pending-monitor`. Esa función cuenta elementos atascados en
-- estado `pending` (WhatsApp sin enviar, pagos, KYC) y, si superan su umbral,
-- manda un email de alerta vía Resend a `ALERT_EMAIL`.
--
-- Mismo patrón que el resto de automatizaciones: la URL del proyecto y el
-- service_role_key se leen desde Supabase Vault (`project_url`,
-- `service_role_key`), poblados POR proyecto (staging/prod) fuera del repo.
-- Mismo código en ambos entornos; solo cambia el contenido del Vault.
--
-- Notas:
--   * Idempotente / re-ejecutable: desprograma cualquier versión previa del job.
--   * Degradación segura: si no hay secretos en Vault, el POST no se dispara
--     (el WHERE deja el SELECT en cero filas).
--   * No toca otros jobs ni secretos: solo gestiona `pending-monitor-*`.
-- ============================================================

-- Extensiones necesarias (idempotente).
CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Quitar versiones previas del job (re-ejecución segura).
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'pending-monitor-every-15min';

-- Programar el monitoreo cada 15 minutos.
-- El POST solo se dispara si `project_url` existe en Vault (degradación segura).
SELECT cron.schedule(
  'pending-monitor-every-15min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url     := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url' LIMIT 1)
               || '/functions/v1/pending-monitor',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
    ),
    body    := '{}'::jsonb
  )
  WHERE EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name = 'project_url')
    AND EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name = 'service_role_key');
  $$
);
