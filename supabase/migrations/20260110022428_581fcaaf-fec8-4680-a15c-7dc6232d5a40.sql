-- ===========================================
-- MÓDULO FORMAL DE COTIZACIONES PS + BLOQUEO DE ESTADOS
-- ===========================================

-- 1. Crear enum para estados de cotización
CREATE TYPE public.ps_quote_status AS ENUM (
  'pendiente',      -- Recién creada, esperando revisión del cliente
  'aceptada',       -- Cliente aprobó la cotización
  'rechazada',      -- Cliente rechazó la cotización
  'expirada',       -- La cotización expiró sin respuesta
  'modificada'      -- Fue reemplazada por una nueva cotización
);

-- 2. Agregar columna estado a ps_quotes
ALTER TABLE public.ps_quotes 
ADD COLUMN estado public.ps_quote_status NOT NULL DEFAULT 'pendiente';

-- Agregar columna para registrar cuando se respondió
ALTER TABLE public.ps_quotes 
ADD COLUMN respondida_at TIMESTAMP WITH TIME ZONE;

-- Agregar columna para razón de rechazo
ALTER TABLE public.ps_quotes 
ADD COLUMN razon_rechazo TEXT;

-- 3. Crear función para validar avance de estado (BLOQUEO CRÍTICO)
-- Esta función verifica si el pedido puede avanzar de estado
CREATE OR REPLACE FUNCTION public.can_advance_ps_order_status(
  p_order_id UUID,
  p_new_status public.ps_order_status
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_requires_approval BOOLEAN;
  v_current_status public.ps_order_status;
  v_approval_exists BOOLEAN;
BEGIN
  -- Obtener estado actual del pedido
  SELECT requires_client_approval, estado 
  INTO v_requires_approval, v_current_status
  FROM ps_orders 
  WHERE id = p_order_id;
  
  -- Si no existe el pedido, denegar
  IF v_current_status IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Si no requiere aprobación, permitir avance
  IF v_requires_approval IS NOT TRUE THEN
    RETURN TRUE;
  END IF;
  
  -- Estados críticos que requieren aprobación explícita del cliente
  -- antes de poder avanzar
  IF v_current_status IN ('en_revision', 'aprobado_cliente') THEN
    -- Verificar que existe una aprobación válida para este pedido
    SELECT EXISTS (
      SELECT 1 FROM ps_client_approvals
      WHERE order_id = p_order_id
        AND aprobado = TRUE
        AND tipo_aprobacion IN ('cotizacion_aceptada', 'autorizacion_compra', 'cambio_precio')
    ) INTO v_approval_exists;
    
    IF NOT v_approval_exists THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 4. Trigger para bloquear avance de estado sin aprobación
CREATE OR REPLACE FUNCTION public.block_ps_order_advance_without_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_can_advance BOOLEAN;
BEGIN
  -- Solo verificar si el estado está cambiando
  IF OLD.estado = NEW.estado THEN
    RETURN NEW;
  END IF;
  
  -- Verificar si puede avanzar
  SELECT public.can_advance_ps_order_status(NEW.id, NEW.estado) INTO v_can_advance;
  
  IF NOT v_can_advance THEN
    RAISE EXCEPTION 'No se puede avanzar el estado del pedido. Se requiere aprobación del cliente.';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_block_ps_order_advance
BEFORE UPDATE OF estado ON public.ps_orders
FOR EACH ROW
EXECUTE FUNCTION public.block_ps_order_advance_without_approval();

-- 5. Función para marcar cotizaciones como expiradas
CREATE OR REPLACE FUNCTION public.expire_ps_quotes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE ps_quotes
  SET estado = 'expirada'
  WHERE estado = 'pendiente'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$;

-- 6. Función para aprobar una cotización (con registro de aprobación)
CREATE OR REPLACE FUNCTION public.approve_ps_quote(
  p_quote_id UUID,
  p_cliente_id UUID,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request_id UUID;
  v_order_id UUID;
  v_total_estimado NUMERIC;
  v_ps_id UUID;
BEGIN
  -- Obtener datos de la cotización
  SELECT request_id, personal_shopper_id, total_estimado
  INTO v_request_id, v_ps_id, v_total_estimado
  FROM ps_quotes
  WHERE id = p_quote_id AND estado = 'pendiente';
  
  IF v_request_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Marcar cotización como aceptada
  UPDATE ps_quotes
  SET estado = 'aceptada', 
      es_seleccionada = TRUE,
      respondida_at = NOW()
  WHERE id = p_quote_id;
  
  -- Marcar otras cotizaciones del request como modificadas
  UPDATE ps_quotes
  SET estado = 'modificada'
  WHERE request_id = v_request_id 
    AND id != p_quote_id 
    AND estado = 'pendiente';
  
  -- Actualizar estado del request
  UPDATE ps_requests
  SET estado = 'aprobada', updated_at = NOW()
  WHERE id = v_request_id;
  
  -- Crear o actualizar la orden
  SELECT id INTO v_order_id
  FROM ps_orders
  WHERE request_id = v_request_id;
  
  IF v_order_id IS NULL THEN
    -- Crear nueva orden
    INSERT INTO ps_orders (
      request_id, cliente_id, personal_shopper_id,
      monto_producto, costo_servicio, total_cliente,
      estado, requires_client_approval
    )
    SELECT 
      v_request_id, p_cliente_id, v_ps_id,
      precio_producto, costo_servicio, total_estimado,
      'aprobado_cliente', FALSE
    FROM ps_quotes
    WHERE id = p_quote_id
    RETURNING id INTO v_order_id;
  ELSE
    -- Actualizar orden existente
    UPDATE ps_orders
    SET estado = 'aprobado_cliente',
        requires_client_approval = FALSE,
        updated_at = NOW()
    WHERE id = v_order_id;
  END IF;
  
  -- Registrar aprobación del cliente
  INSERT INTO ps_client_approvals (
    order_id, cliente_id, tipo_aprobacion,
    descripcion, monto_original, monto_nuevo,
    aprobado, aprobado_at, ip_address, user_agent
  ) VALUES (
    v_order_id, p_cliente_id, 'cotizacion_aceptada',
    'Cliente aprobó la cotización', v_total_estimado, v_total_estimado,
    TRUE, NOW(), p_ip_address, p_user_agent
  );
  
  -- Registrar en decision log
  INSERT INTO ps_decision_log (
    order_id, actor_id, actor_tipo,
    tipo_decision, descripcion, approved, approved_at
  ) VALUES (
    v_order_id, p_cliente_id, 'cliente',
    'aprobacion_cotizacion', 'Cotización aprobada por el cliente',
    TRUE, NOW()
  );
  
  RETURN TRUE;
END;
$$;

-- 7. Función para rechazar una cotización
CREATE OR REPLACE FUNCTION public.reject_ps_quote(
  p_quote_id UUID,
  p_cliente_id UUID,
  p_razon TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request_id UUID;
BEGIN
  -- Obtener request_id
  SELECT request_id INTO v_request_id
  FROM ps_quotes
  WHERE id = p_quote_id AND estado = 'pendiente';
  
  IF v_request_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Marcar cotización como rechazada
  UPDATE ps_quotes
  SET estado = 'rechazada', 
      razon_rechazo = p_razon,
      respondida_at = NOW()
  WHERE id = p_quote_id;
  
  -- Registrar en decision log
  INSERT INTO ps_decision_log (
    order_id, actor_id, actor_tipo,
    tipo_decision, descripcion, contexto
  )
  SELECT 
    o.id, p_cliente_id, 'cliente',
    'rechazo_cotizacion', 'Cotización rechazada por el cliente',
    jsonb_build_object('razon', p_razon, 'quote_id', p_quote_id)
  FROM ps_orders o
  WHERE o.request_id = v_request_id;
  
  RETURN TRUE;
END;
$$;

-- 8. Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_ps_quotes_estado ON ps_quotes(estado);
CREATE INDEX IF NOT EXISTS idx_ps_quotes_expires_at ON ps_quotes(expires_at) WHERE estado = 'pendiente';
CREATE INDEX IF NOT EXISTS idx_ps_client_approvals_tipo ON ps_client_approvals(tipo_aprobacion);
CREATE INDEX IF NOT EXISTS idx_ps_client_approvals_aprobado ON ps_client_approvals(aprobado) WHERE aprobado = TRUE;