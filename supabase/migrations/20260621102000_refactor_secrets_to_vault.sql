-- ============================================================
-- Refactor: leer secretos desde Supabase Vault en vez de GUCs app.*
--
-- CONTEXTO / PORQUE
--   Este proyecto corre PostgreSQL 17. El rol `postgres` es DUENO de la
--   base pero NO superusuario. En PG15+ un ALTER DATABASE / ALTER ROLE de
--   un GUC custom (namespace `app.*`) requiere superusuario o un
--   GRANT SET ON PARAMETER que solo un superusuario puede otorgar ->
--   "permission denied" (esto aplica igual al SQL Editor del dashboard,
--   que tambien corre como `postgres`).
--
--   Consecuencia: `current_setting('app.*')` SIEMPRE devolvia NULL, asi que
--   las 3 automatizaciones quedaban inertes por su "degradacion segura":
--     - WhatsApp automatico por cambio de estado  (send_whatsapp_on_status_change)
--     - Cron de sync de tracking cada 2h          (job sync-tracking-every-2h)
--     - Email de upgrade VIP                       (notify_vip_upgrade)
--
-- SOLUCION (nativa y soportada): Supabase Vault.
--   Se guardan POR PROYECTO (distinto en staging y prod) dos secretos:
--     - project_url       p.ej. https://<ref>.supabase.co   (sin slash final)
--     - service_role_key  service-role JWT del proyecto
--   Las funciones SECURITY DEFINER (owner = postgres) y el cron (corre como
--   postgres) leen `vault.decrypted_secrets`. La URL de cada Edge Function
--   se construye como project_url || '/functions/v1/<nombre>'.
--
--   IMPORTANTE: esta migracion NO contiene valores de secretos. El Vault se
--   puebla por separado en cada proyecto (Management API / SQL fuera del repo).
--   Mismo codigo en staging y prod; solo cambia el contenido del Vault.
--   Degradacion segura: si los secretos no estan, no se hace el POST.
-- ============================================================

-- Extensiones necesarias (idempotente).
CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ------------------------------------------------------------
-- 1) Pilar #1 - WhatsApp automatico por cambio de estado
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.send_whatsapp_on_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template_name  TEXT;
  v_status_message TEXT;
  v_customer_name  TEXT;
  v_phone          TEXT;
  v_project_url    TEXT;
  v_func_url       TEXT;
  v_service_key    TEXT;
  v_dispatch       BOOLEAN := false;
BEGIN
  -- Solo actuar cuando el estado realmente cambio.
  IF NOT (TG_OP = 'UPDATE' AND OLD.current_status IS DISTINCT FROM NEW.current_status) THEN
    RETURN NEW;
  END IF;

  -- Mapear el nuevo estado al template (Edge Function) y a un mensaje legible.
  CASE NEW.current_status
    WHEN 'prealerted' THEN
      v_template_name := 'package_prealerted';         v_status_message := 'Tu paquete ha sido prealertado';
    WHEN 'received_warehouse' THEN
      v_template_name := 'package_received';            v_status_message := 'Tu paquete ha sido recibido en USA';
    WHEN 'ready_consolidation' THEN
      v_template_name := 'package_ready_consolidation'; v_status_message := 'Tu paquete esta listo para consolidar';
    WHEN 'consolidated' THEN
      v_template_name := 'package_consolidated';        v_status_message := 'Tu paquete ha sido consolidado';
    WHEN 'in_transit' THEN
      v_template_name := 'package_in_transit';          v_status_message := 'Tu paquete esta en transito a Peru';
    WHEN 'arrived_peru' THEN
      v_template_name := 'package_arrived_peru';        v_status_message := 'Tu paquete llego a Peru';
    WHEN 'ready_delivery' THEN
      v_template_name := 'package_ready_delivery';      v_status_message := 'Tu paquete esta listo para entrega';
    WHEN 'delivered' THEN
      v_template_name := 'package_delivered';           v_status_message := 'Tu paquete ha sido entregado';
    ELSE
      RETURN NEW; -- estados sin notificacion
  END CASE;

  -- Datos del cliente.
  SELECT full_name, phone INTO v_customer_name, v_phone
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Config desde Vault (project_url + service_role_key). Mismo codigo staging/prod.
  v_project_url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url' LIMIT 1);
  v_service_key := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1);
  v_func_url := CASE
                  WHEN v_project_url IS NOT NULL AND length(trim(v_project_url)) > 0
                  THEN rtrim(trim(v_project_url), '/') || '/functions/v1/whatsapp-notify'
                  ELSE NULL
                END;

  -- Solo despachamos si hay telefono y la URL esta disponible.
  v_dispatch := (v_phone IS NOT NULL AND length(trim(v_phone)) > 0
                 AND v_func_url IS NOT NULL
                 AND v_service_key IS NOT NULL AND length(trim(v_service_key)) > 0);

  -- Historial (message_type = estado crudo para que lo muestre WhatsAppHistory).
  INSERT INTO public.whatsapp_messages (
    package_id, user_id, message_type, content, status, tracking_number
  ) VALUES (
    NEW.id,
    NEW.user_id,
    NEW.current_status,
    v_status_message,
    CASE WHEN v_dispatch THEN 'sent' ELSE 'pending' END,
    NEW.tracking_number
  );

  -- Disparo HTTP asincrono a la Edge Function (fire-and-forget).
  IF v_dispatch THEN
    PERFORM net.http_post(
      url     := v_func_url,
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body    := jsonb_build_object(
        'userId',       NEW.user_id,
        'phone',        v_phone,
        'templateName', v_template_name,
        'parameters', jsonb_build_object(
          'customerName',   COALESCE(v_customer_name, 'Cliente'),
          'trackingNumber', NEW.tracking_number,
          'status',         NEW.current_status,
          'statusMessage',  v_status_message
        )
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Re-asegurar el trigger (idempotente).
DROP TRIGGER IF EXISTS trigger_whatsapp_on_status_change ON public.packages;
CREATE TRIGGER trigger_whatsapp_on_status_change
  AFTER UPDATE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.send_whatsapp_on_status_change();

-- ------------------------------------------------------------
-- 2) Email de upgrade VIP
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_vip_upgrade()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supabase_url     TEXT;
  v_service_role_key TEXT;
BEGIN
  -- Solo notificar si el tier cambio y no es a bronce.
  IF (OLD.vip_tier IS DISTINCT FROM NEW.vip_tier) AND NEW.vip_tier <> 'bronce' THEN

    -- Config desde Vault (project_url + service_role_key).
    v_supabase_url     := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url' LIMIT 1);
    v_service_role_key := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1);

    -- Degradacion segura: si la config no esta, no intentamos el POST.
    IF v_supabase_url IS NULL OR length(trim(v_supabase_url)) = 0
       OR v_service_role_key IS NULL OR length(trim(v_service_role_key)) = 0 THEN
      RAISE LOG 'notify_vip_upgrade: secretos de Vault (project_url/service_role_key) no configurados; se omite el POST.';
      RETURN NEW;
    END IF;

    PERFORM net.http_post(
      url := rtrim(trim(v_supabase_url), '/') || '/functions/v1/vip-upgrade-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_role_key
      ),
      body := jsonb_build_object(
        'userId', NEW.id,
        'oldTier', COALESCE(OLD.vip_tier, 'bronce'),
        'newTier', NEW.vip_tier,
        'lifetimePoints', NEW.vip_points_lifetime
      )
    );

    RAISE LOG 'VIP upgrade notification triggered for user % from % to %',
      NEW.id, COALESCE(OLD.vip_tier, 'bronce'), NEW.vip_tier;
  END IF;

  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------
-- 3) Cron de auto-sync de tracking (cada 2h)
-- ------------------------------------------------------------
-- Quitar el job previo si existiera (re-ejecucion segura de la migracion).
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'sync-tracking-every-2h';

-- Re-programar leyendo project_url + service_role_key desde Vault.
-- El POST solo se dispara si project_url esta presente (degradacion segura).
SELECT cron.schedule(
  'sync-tracking-every-2h',
  '0 */2 * * *',
  $cron$
  SELECT net.http_post(
    url := rtrim(trim((SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url' LIMIT 1)), '/')
           || '/functions/v1/sync-tracking',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
    ),
    body := '{}'::jsonb
  )
  WHERE EXISTS (
    SELECT 1 FROM vault.decrypted_secrets
    WHERE name = 'project_url' AND length(trim(decrypted_secret)) > 0
  );
  $cron$
);
