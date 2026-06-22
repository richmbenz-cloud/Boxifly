-- ============================================================
-- Fase 1 — bajar la frecuencia del cron de sync-tracking a ~10 min.
--
-- El job original (`20260620010000_auto_sync_tracking_cron.sql`) corría
-- cada 2 horas (`0 */2 * * *`). Mientras Realtime + el feed de checkpoints
-- dan la sensación de "tiempo real" en la UI, el cron sigue siendo la
-- fuente que avanza `packages.current_status` desde AfterShip. Bajarlo a
-- 10 min reduce la latencia hasta tener el webhook (Fase 2), que lo dejará
-- como simple red de seguridad / reconciliación.
--
-- Idempotente: desprograma cualquier versión previa del job antes de crearlo.
-- Degradación segura: el POST solo se dispara si `app.sync_tracking_url`
-- está configurada en la BD.
-- ============================================================

-- Quitar versiones previas del job (re-ejecución segura).
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'sync-tracking-every-2h';
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'sync-tracking-every-10min';

-- Programar la sincronización cada 10 minutos.
SELECT cron.schedule(
  'sync-tracking-every-10min',
  '*/10 * * * *',
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
