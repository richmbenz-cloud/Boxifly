-- FIX CRÍTICO: notify_package_status_change() rompía TODO cambio de estado de paquete.
--
-- Síntoma: cualquier UPDATE de packages.current_status fallaba con
--   ERROR 42883: operator does not exist: jsonb -> package_status
-- Causa: `status_messages->NEW.current_status` indexa un JSONB con un valor de
--   tipo enum `package_status`; el operador `->` solo acepta text/int, no el enum.
-- Efecto: ningún paquete podía avanzar (received_warehouse, consolidación,
--   tránsito, ready_delivery, etc.), bloqueando el ciclo completo y el dashboard.
-- Solución: castear el enum a texto -> `(NEW.current_status::text)`.
--
-- Detectado en QA sobre STAGING (replica el estado de producción).

CREATE OR REPLACE FUNCTION public.notify_package_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  status_messages JSONB;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Define status change messages
  status_messages := '{
    "prealerted": {"title": "Paquete Prealertado", "message": "Tu paquete ha sido prealertado y está en camino al warehouse"},
    "received_warehouse": {"title": "Paquete Recibido", "message": "Tu paquete ha sido recibido en nuestro warehouse de USA"},
    "ready_consolidation": {"title": "Listo para Consolidar", "message": "Tu paquete está listo para ser consolidado"},
    "consolidated": {"title": "Paquete Consolidado", "message": "Tu paquete ha sido consolidado con otros envíos"},
    "ready_international": {"title": "Listo para Envío Internacional", "message": "Tu paquete está listo para ser enviado a Perú"},
    "in_transit": {"title": "En Tránsito", "message": "Tu paquete está en camino a Perú"},
    "arrived_peru": {"title": "Llegó a Perú", "message": "Tu paquete ha llegado a Perú"},
    "ready_delivery": {"title": "Listo para Entrega", "message": "Tu paquete está listo para ser entregado. Por favor procede con el pago"},
    "delivered": {"title": "Paquete Entregado", "message": "Tu paquete ha sido entregado exitosamente"}
  }'::JSONB;

  -- Get the title and message for the new status.
  -- FIX: cast el enum package_status a text para el operador jsonb `->`.
  notification_title := status_messages->(NEW.current_status::text)->>'title';
  notification_message := status_messages->(NEW.current_status::text)->>'message';

  -- Insert notification if status changed
  IF (TG_OP = 'UPDATE' AND OLD.current_status IS DISTINCT FROM NEW.current_status) THEN
    INSERT INTO public.notifications (user_id, package_id, title, message)
    VALUES (
      NEW.user_id,
      NEW.id,
      notification_title,
      notification_message || ' - Tracking: ' || NEW.tracking_number
    );
  END IF;

  RETURN NEW;
END;
$$;
