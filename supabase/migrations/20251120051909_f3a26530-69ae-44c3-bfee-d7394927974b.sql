-- Create function to send notification on package status change
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

  -- Get the title and message for the new status
  notification_title := status_messages->NEW.current_status->>'title';
  notification_message := status_messages->NEW.current_status->>'message';

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

-- Create trigger for package status changes
DROP TRIGGER IF EXISTS trigger_notify_package_status ON public.packages;
CREATE TRIGGER trigger_notify_package_status
  AFTER UPDATE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_package_status_change();