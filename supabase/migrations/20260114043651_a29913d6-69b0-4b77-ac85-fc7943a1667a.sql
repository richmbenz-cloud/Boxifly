-- Create ps_notifications table for Personal Shopper specific notifications
CREATE TABLE public.ps_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('nueva_solicitud', 'cotizacion_creada', 'cotizacion_modificada', 'cotizacion_aceptada', 'cotizacion_rechazada', 'cambio_estado', 'aprobacion_requerida', 'mensaje_nuevo', 'recordatorio')),
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  request_id UUID REFERENCES public.ps_requests(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.ps_orders(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES public.ps_quotes(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ps_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own PS notifications"
ON public.ps_notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own PS notifications"
ON public.ps_notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert PS notifications"
ON public.ps_notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin can view all PS notifications"
ON public.ps_notifications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

-- Enable realtime for PS notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.ps_notifications;

-- Create index for performance
CREATE INDEX idx_ps_notifications_user_id ON public.ps_notifications(user_id);
CREATE INDEX idx_ps_notifications_created_at ON public.ps_notifications(created_at DESC);
CREATE INDEX idx_ps_notifications_unread ON public.ps_notifications(user_id, is_read) WHERE is_read = false;

-- Function to create PS notification
CREATE OR REPLACE FUNCTION public.create_ps_notification(
  p_user_id UUID,
  p_tipo TEXT,
  p_titulo TEXT,
  p_mensaje TEXT,
  p_request_id UUID DEFAULT NULL,
  p_order_id UUID DEFAULT NULL,
  p_quote_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.ps_notifications (
    user_id, tipo, titulo, mensaje, request_id, order_id, quote_id, metadata
  ) VALUES (
    p_user_id, p_tipo, p_titulo, p_mensaje, p_request_id, p_order_id, p_quote_id, p_metadata
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Trigger: Notify client when a new quote is created
CREATE OR REPLACE FUNCTION public.notify_on_quote_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cliente_id UUID;
  v_producto TEXT;
BEGIN
  -- Get client ID from the request
  SELECT cliente_id, descripcion_producto INTO v_cliente_id, v_producto
  FROM public.ps_requests
  WHERE id = NEW.request_id;
  
  -- Create notification for client
  PERFORM create_ps_notification(
    v_cliente_id,
    'cotizacion_creada',
    'Nueva cotización recibida',
    'Has recibido una cotización para "' || v_producto || '" por $' || NEW.total_estimado,
    NEW.request_id,
    NULL,
    NEW.id,
    jsonb_build_object('total', NEW.total_estimado, 'expires_at', NEW.expires_at)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_quote_created
AFTER INSERT ON public.ps_quotes
FOR EACH ROW
WHEN (NEW.estado = 'pendiente')
EXECUTE FUNCTION public.notify_on_quote_created();

-- Trigger: Notify shopper when quote is accepted/rejected
CREATE OR REPLACE FUNCTION public.notify_on_quote_response()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_producto TEXT;
BEGIN
  -- Only trigger on state change to aceptada or rechazada
  IF OLD.estado = 'pendiente' AND NEW.estado IN ('aceptada', 'rechazada') THEN
    SELECT descripcion_producto INTO v_producto
    FROM public.ps_requests
    WHERE id = NEW.request_id;
    
    IF NEW.estado = 'aceptada' THEN
      PERFORM create_ps_notification(
        NEW.personal_shopper_id,
        'cotizacion_aceptada',
        '¡Cotización aceptada!',
        'El cliente ha aceptado tu cotización para "' || v_producto || '"',
        NEW.request_id,
        NULL,
        NEW.id,
        jsonb_build_object('total', NEW.total_estimado)
      );
    ELSE
      PERFORM create_ps_notification(
        NEW.personal_shopper_id,
        'cotizacion_rechazada',
        'Cotización rechazada',
        'El cliente ha rechazado tu cotización para "' || v_producto || '". Razón: ' || COALESCE(NEW.razon_rechazo, 'No especificada'),
        NEW.request_id,
        NULL,
        NEW.id,
        jsonb_build_object('razon', NEW.razon_rechazo)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_quote_response
AFTER UPDATE ON public.ps_quotes
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_quote_response();

-- Trigger: Notify on order status change
CREATE OR REPLACE FUNCTION public.notify_on_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_producto TEXT;
  v_estado_label TEXT;
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    SELECT descripcion_producto INTO v_producto
    FROM public.ps_requests
    WHERE id = NEW.request_id;
    
    -- Map status to readable label
    v_estado_label := CASE NEW.estado
      WHEN 'solicitud_recibida' THEN 'Solicitud recibida'
      WHEN 'en_revision' THEN 'En revisión'
      WHEN 'aprobado_cliente' THEN 'Aprobado por cliente'
      WHEN 'compra_en_proceso' THEN 'Compra en proceso'
      WHEN 'producto_comprado' THEN 'Producto comprado'
      WHEN 'en_almacen_usa' THEN 'En almacén USA'
      WHEN 'en_transito' THEN 'En tránsito a Perú'
      WHEN 'en_aduanas' THEN 'En aduanas'
      WHEN 'en_reparto' THEN 'En reparto'
      WHEN 'entregado' THEN 'Entregado'
      ELSE NEW.estado
    END;
    
    -- Notify client
    PERFORM create_ps_notification(
      NEW.cliente_id,
      'cambio_estado',
      'Tu pedido cambió de estado',
      'Tu pedido de "' || v_producto || '" ahora está: ' || v_estado_label,
      NEW.request_id,
      NEW.id,
      NULL,
      jsonb_build_object('estado_anterior', OLD.estado, 'estado_nuevo', NEW.estado)
    );
    
    -- Also notify shopper for key states
    IF NEW.estado IN ('aprobado_cliente', 'entregado') THEN
      PERFORM create_ps_notification(
        NEW.personal_shopper_id,
        'cambio_estado',
        CASE NEW.estado 
          WHEN 'aprobado_cliente' THEN 'Cliente aprobó el pedido'
          WHEN 'entregado' THEN '¡Pedido entregado!'
          ELSE 'Cambio de estado'
        END,
        'El pedido de "' || v_producto || '" ahora está: ' || v_estado_label,
        NEW.request_id,
        NEW.id,
        NULL,
        jsonb_build_object('estado_anterior', OLD.estado, 'estado_nuevo', NEW.estado)
      );
    END IF;
  END IF;
  
  -- Notify on approval required
  IF NEW.requires_client_approval = true AND OLD.requires_client_approval IS DISTINCT FROM NEW.requires_client_approval THEN
    PERFORM create_ps_notification(
      NEW.cliente_id,
      'aprobacion_requerida',
      'Se requiere tu aprobación',
      'El Personal Shopper necesita tu aprobación para continuar con el pedido de "' || v_producto || '"',
      NEW.request_id,
      NEW.id,
      NULL,
      jsonb_build_object('blocked_reason', NEW.blocked_reason)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_order_status_change
AFTER UPDATE ON public.ps_orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_order_status_change();

-- Trigger: Notify admin on new request (informativo)
CREATE OR REPLACE FUNCTION public.notify_admin_new_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- Get first admin to notify (in production, would notify all admins)
  SELECT ur.user_id INTO v_admin_id
  FROM public.user_roles ur
  WHERE ur.role = 'admin'
  LIMIT 1;
  
  IF v_admin_id IS NOT NULL THEN
    PERFORM create_ps_notification(
      v_admin_id,
      'nueva_solicitud',
      'Nueva solicitud PS recibida',
      'Se ha recibido una nueva solicitud de Personal Shopper: "' || NEW.descripcion_producto || '"',
      NEW.id,
      NULL,
      NULL,
      jsonb_build_object('categoria', NEW.categoria, 'tipo_servicio', NEW.tipo_servicio)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_admin_new_request
AFTER INSERT ON public.ps_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_new_request();