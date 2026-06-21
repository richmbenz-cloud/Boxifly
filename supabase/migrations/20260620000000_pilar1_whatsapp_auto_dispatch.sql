-- ============================================================
-- Pilar #1 — Notificaciones WhatsApp automáticas
--
-- Problema: el trigger `send_whatsapp_on_status_change` solo
-- registraba el mensaje en `whatsapp_messages` (historial) pero
-- NUNCA invocaba la Edge Function `whatsapp-notify`, por lo que
-- ningún WhatsApp real se enviaba al cambiar el estado.
--
-- Solución: usar pg_net para que el trigger haga un POST HTTP
-- asíncrono a la Edge Function `whatsapp-notify`, la cual ya
-- reenvía el mensaje a n8n (N8N_WHATSAPP_WEBHOOK_URL) y de ahí
-- a la API de WhatsApp. Reutiliza las plantillas existentes.
-- ============================================================

-- 1) Extensión pg_net (HTTP desde Postgres). Idempotente.
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2) Reescritura del trigger de WhatsApp.
--    Mapea estado -> (template de la Edge Function, mensaje legible),
--    busca nombre + teléfono del cliente, registra el historial e
--    invoca la Edge Function vía net.http_post.
--
--    Config requerida (se setea UNA vez, ver WHATSAPP_INTEGRATION.md):
--      ALTER DATABASE postgres SET app.whatsapp_notify_url = 'https://<proj>.supabase.co/functions/v1/whatsapp-notify';
--      ALTER DATABASE postgres SET app.service_role_key   = '<SERVICE_ROLE_KEY>';
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
  v_func_url       TEXT;
  v_service_key    TEXT;
  v_dispatch       BOOLEAN := false;
BEGIN
  -- Solo actuar cuando el estado realmente cambió.
  IF NOT (TG_OP = 'UPDATE' AND OLD.current_status IS DISTINCT FROM NEW.current_status) THEN
    RETURN NEW;
  END IF;

  -- Mapear el nuevo estado al template (Edge Function) y a un mensaje legible.
  CASE NEW.current_status
    WHEN 'prealerted' THEN
      v_template_name := 'package_prealerted';        v_status_message := 'Tu paquete ha sido prealertado';
    WHEN 'received_warehouse' THEN
      v_template_name := 'package_received';           v_status_message := 'Tu paquete ha sido recibido en USA';
    WHEN 'ready_consolidation' THEN
      v_template_name := 'package_ready_consolidation'; v_status_message := 'Tu paquete está listo para consolidar';
    WHEN 'consolidated' THEN
      v_template_name := 'package_consolidated';       v_status_message := 'Tu paquete ha sido consolidado';
    WHEN 'in_transit' THEN
      v_template_name := 'package_in_transit';         v_status_message := 'Tu paquete está en tránsito a Perú';
    WHEN 'arrived_peru' THEN
      v_template_name := 'package_arrived_peru';       v_status_message := 'Tu paquete llegó a Perú';
    WHEN 'ready_delivery' THEN
      v_template_name := 'package_ready_delivery';     v_status_message := 'Tu paquete está listo para entrega';
    WHEN 'delivered' THEN
      v_template_name := 'package_delivered';          v_status_message := 'Tu paquete ha sido entregado';
    ELSE
      RETURN NEW; -- estados sin notificación
  END CASE;

  -- Datos del cliente.
  SELECT full_name, phone INTO v_customer_name, v_phone
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Config de la Edge Function (puede no estar seteada todavía).
  v_func_url    := current_setting('app.whatsapp_notify_url', true);
  v_service_key := current_setting('app.service_role_key', true);

  -- Solo despachamos si hay teléfono y la URL está configurada.
  v_dispatch := (v_phone IS NOT NULL AND length(trim(v_phone)) > 0
                 AND v_func_url IS NOT NULL AND length(trim(v_func_url)) > 0);

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

  -- Disparo HTTP asíncrono a la Edge Function (fire-and-forget).
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

-- 3) Re-asegurar el trigger (idempotente).
DROP TRIGGER IF EXISTS trigger_whatsapp_on_status_change ON public.packages;
CREATE TRIGGER trigger_whatsapp_on_status_change
  AFTER UPDATE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.send_whatsapp_on_status_change();
