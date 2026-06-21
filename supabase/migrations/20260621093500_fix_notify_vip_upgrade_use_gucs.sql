-- ============================================================
-- Fix: notify_vip_upgrade() apuntaba a un proyecto MUERTO/ajeno
-- (ivkfyzdsfpcjymlzerxf) con URL y anon key HARDCODEADAS, introducido
-- en la migracion 20251127125947. Eso (a) rompia el email de upgrade VIP
-- (POST a un proyecto que devuelve 403) y (b) dejaba un secreto stale en el repo.
--
-- Solucion: volver a leer la config desde GUCs de base de datos
--   - app.settings.supabase_url
--   - app.settings.service_role_key
-- (se setean una vez con ALTER DATABASE ...; ver setup de GUCs de prod).
-- Degradacion segura: si no estan configurados, no se hace el POST.
-- ============================================================

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

    v_supabase_url     := current_setting('app.settings.supabase_url', true);
    v_service_role_key := current_setting('app.settings.service_role_key', true);

    -- Degradacion segura: si la config no esta, no intentamos el POST.
    IF v_supabase_url IS NULL OR length(trim(v_supabase_url)) = 0
       OR v_service_role_key IS NULL OR length(trim(v_service_role_key)) = 0 THEN
      RAISE LOG 'notify_vip_upgrade: app.settings.* no configurados; se omite el POST.';
      RETURN NEW;
    END IF;

    PERFORM net.http_post(
      url := v_supabase_url || '/functions/v1/vip-upgrade-notification',
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
