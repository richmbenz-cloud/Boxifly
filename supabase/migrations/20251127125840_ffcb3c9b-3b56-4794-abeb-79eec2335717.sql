-- Función para enviar notificación de upgrade VIP
CREATE OR REPLACE FUNCTION notify_vip_upgrade()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Solo notificar si el tier cambió y no es a bronce
  IF (OLD.vip_tier IS DISTINCT FROM NEW.vip_tier) AND NEW.vip_tier != 'bronce' THEN
    
    -- Obtener variables de entorno
    supabase_url := current_setting('app.settings.supabase_url', true);
    service_role_key := current_setting('app.settings.service_role_key', true);
    
    -- Llamar a la edge function para enviar el email
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/vip-upgrade-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
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

-- Crear trigger para detectar cambios en vip_tier
DROP TRIGGER IF EXISTS on_vip_tier_upgrade ON profiles;

CREATE TRIGGER on_vip_tier_upgrade
AFTER UPDATE OF vip_tier ON profiles
FOR EACH ROW
WHEN (OLD.vip_tier IS DISTINCT FROM NEW.vip_tier AND NEW.vip_tier != 'bronce')
EXECUTE FUNCTION notify_vip_upgrade();

-- Habilitar la extensión pg_net si no está habilitada
CREATE EXTENSION IF NOT EXISTS pg_net;

COMMENT ON TRIGGER on_vip_tier_upgrade ON profiles IS 
'Envía un email de felicitación cuando un usuario sube de nivel VIP';