-- Actualizar la función de notificación VIP para usar URL completa
CREATE OR REPLACE FUNCTION notify_vip_upgrade()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Solo notificar si el tier cambió y no es a bronce
  IF (OLD.vip_tier IS DISTINCT FROM NEW.vip_tier) AND NEW.vip_tier != 'bronce' THEN
    
    -- Llamar a la edge function para enviar el email usando la URL completa del proyecto
    PERFORM net.http_post(
      url := 'https://ivkfyzdsfpcjymlzerxf.supabase.co/functions/v1/vip-upgrade-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2a2Z5emRzZnBjanltbHplcnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMTEwMDQsImV4cCI6MjA3ODg4NzAwNH0.X0nbBpe4tzxHHoQJL3OzGuueN-dl8gQooIv8dzFCo-o'
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