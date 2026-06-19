-- Crear tabla para historial de mensajes WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message_type TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX idx_whatsapp_messages_package_id ON public.whatsapp_messages(package_id);
CREATE INDEX idx_whatsapp_messages_user_id ON public.whatsapp_messages(user_id);
CREATE INDEX idx_whatsapp_messages_timestamp ON public.whatsapp_messages(timestamp DESC);

-- RLS Policies
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver sus propios mensajes
CREATE POLICY "Users can view own whatsapp messages"
ON public.whatsapp_messages
FOR SELECT
USING (auth.uid() = user_id);

-- Admin y warehouse pueden ver todos los mensajes
CREATE POLICY "Admin and warehouse can view all whatsapp messages"
ON public.whatsapp_messages
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::user_role) OR 
  has_role(auth.uid(), 'warehouse'::user_role)
);

-- Sistema puede insertar mensajes
CREATE POLICY "System can insert whatsapp messages"
ON public.whatsapp_messages
FOR INSERT
WITH CHECK (true);

-- Función para enviar notificación WhatsApp automática
CREATE OR REPLACE FUNCTION public.send_whatsapp_on_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  message_template TEXT;
  message_type TEXT;
BEGIN
  -- Determinar plantilla según el nuevo estado
  CASE NEW.current_status
    WHEN 'received_warehouse' THEN
      message_template := 'Tu paquete ' || NEW.tracking_number || ' ha sido recibido en nuestro warehouse de USA. ¡Pronto será procesado!';
      message_type := 'received_warehouse';
    WHEN 'consolidated' THEN
      message_template := 'Tu consolidación está lista. Tu paquete ' || NEW.tracking_number || ' ha sido consolidado con otros envíos para reducir costos.';
      message_type := 'consolidated';
    WHEN 'in_transit' THEN
      message_template := 'Tu paquete ' || NEW.tracking_number || ' ha sido enviado a Perú.' || 
        CASE 
          WHEN NEW.international_tracking IS NOT NULL THEN ' Tracking internacional: ' || NEW.international_tracking
          ELSE ''
        END;
      message_type := 'in_transit';
    WHEN 'ready_delivery' THEN
      message_template := 'Tu paquete ' || NEW.tracking_number || ' está listo para recojo. Por favor procede con el pago para coordinar la entrega.';
      message_type := 'ready_delivery';
    ELSE
      -- No enviar mensaje para otros estados
      RETURN NEW;
  END CASE;

  -- Insertar mensaje en historial solo si el estado cambió
  IF (TG_OP = 'UPDATE' AND OLD.current_status IS DISTINCT FROM NEW.current_status) THEN
    INSERT INTO public.whatsapp_messages (
      package_id,
      user_id,
      message_type,
      content,
      status,
      tracking_number
    ) VALUES (
      NEW.id,
      NEW.user_id,
      message_type,
      message_template,
      'sent',
      NEW.tracking_number
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Crear trigger para enviar WhatsApp automáticamente
DROP TRIGGER IF EXISTS trigger_whatsapp_on_status_change ON public.packages;
CREATE TRIGGER trigger_whatsapp_on_status_change
  AFTER UPDATE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.send_whatsapp_on_status_change();