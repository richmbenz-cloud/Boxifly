-- ============================================================
-- Consolidación del cron de sync-tracking — dejar UN SOLO disparador.
--
-- Contexto: la Edge Function `sync-tracking` se estaba disparando por DOS
-- caminos en paralelo:
--   1. pg_cron en la BD  -> `sync-tracking-every-2h` (prod) /
--                           `sync-tracking-every-10min` (staging),
--                           via migraciones 20260620010000 y 20260622093100.
--   2. GitHub Actions    -> `.github/workflows/sync-tracking-cron.yml`
--                           (cada 30 min, contra prod).
--
-- El pg_cron depende de `app.sync_tracking_url` + `app.service_role_key`
-- (config en Vault/DB) que históricamente fallaba; el workflow de GitHub
-- Actions no depende de Vault y es el camino confiable. Con el webhook de
-- AfterShip (Fase 2) en marcha, el batch-sync pasa a ser red de seguridad,
-- así que basta UN disparador.
--
-- DECISIÓN: GitHub Actions queda como único disparador del batch sync.
--           Esta migración ELIMINA el pg_cron de sync-tracking.
--
-- Notas:
--   * Idempotente y db-reset-safe: si los jobs no existen, los `unschedule`
--     son no-ops (el SELECT sobre cero filas no hace nada).
--   * NO toca `app.sync_tracking_url` ni `app.service_role_key`: otros jobs
--     podrían usarlos. Solo desprograma los jobs de sync-tracking.
--   * Staging: el workflow de GitHub Actions apunta solo a prod
--     (SUPABASE_PROD_URL), por lo que staging deja de tener sync programado.
--     Para staging usar `workflow_dispatch` manual o invocar la función a mano.
-- ============================================================

-- pg_cron debe existir para poder consultar cron.job (idempotente).
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Desprogramar TODAS las versiones del job de sync-tracking.
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname IN ('sync-tracking-every-2h', 'sync-tracking-every-10min');
