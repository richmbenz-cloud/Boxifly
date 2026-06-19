
-- =====================================================
-- PS LIVE BACKEND HARDENING - CRITICAL ADJUSTMENTS
-- =====================================================

-- 1. Add lock mechanism columns to ps_live_sessions
ALTER TABLE public.ps_live_sessions
ADD COLUMN IF NOT EXISTS locked_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS locked_by uuid DEFAULT NULL,
ADD COLUMN IF NOT EXISTS lock_reason text DEFAULT NULL;

-- 2. Add budget_exhausted flag to ps_live_orders
ALTER TABLE public.ps_live_orders
ADD COLUMN IF NOT EXISTS budget_exhausted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS budget_exhausted_at timestamptz DEFAULT NULL;

-- =====================================================
-- RPC: START SESSION (Atomic with lock)
-- =====================================================
CREATE OR REPLACE FUNCTION public.start_ps_live_session(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session RECORD;
  v_order RECORD;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get session with lock
  SELECT * INTO v_session
  FROM ps_live_sessions
  WHERE id = p_session_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  
  -- Verify ownership
  IF v_session.personal_shopper_id != v_user_id THEN
    RAISE EXCEPTION 'Not authorized to start this session';
  END IF;
  
  -- Check state
  IF v_session.estado != 'esperando_ps' THEN
    RAISE EXCEPTION 'Session cannot be started from state: %', v_session.estado;
  END IF;
  
  -- Check if already locked by another process
  IF v_session.locked_at IS NOT NULL AND v_session.locked_by != v_user_id THEN
    RAISE EXCEPTION 'Session is locked by another process';
  END IF;
  
  -- Verify linked order is approved
  IF v_session.live_order_id IS NOT NULL THEN
    SELECT * INTO v_order
    FROM ps_live_orders
    WHERE id = v_session.live_order_id
    FOR UPDATE;
    
    IF NOT FOUND OR (v_order.estado != 'aprobada' AND v_order.estado != 'en_sesion') THEN
      RAISE EXCEPTION 'Linked order is not approved';
    END IF;
    
    -- Update order to en_sesion
    UPDATE ps_live_orders
    SET estado = 'en_sesion', updated_at = now()
    WHERE id = v_session.live_order_id;
  END IF;
  
  -- Lock and start session
  UPDATE ps_live_sessions
  SET 
    estado = 'en_vivo',
    started_at = now(),
    locked_at = now(),
    locked_by = v_user_id,
    lock_reason = 'session_active'
  WHERE id = p_session_id;
  
  -- Log event
  INSERT INTO ps_live_events (session_id, tipo, actor_id, actor_tipo, descripcion, metadata)
  VALUES (
    p_session_id,
    'session_start',
    v_user_id,
    'shopper',
    'Sesión en vivo iniciada',
    jsonb_build_object('started_at', now())
  );
  
  RETURN jsonb_build_object('success', true, 'estado', 'en_vivo', 'started_at', now());
END;
$$;

-- =====================================================
-- RPC: PAUSE SESSION (Atomic)
-- =====================================================
CREATE OR REPLACE FUNCTION public.pause_ps_live_session(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session RECORD;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  SELECT * INTO v_session
  FROM ps_live_sessions
  WHERE id = p_session_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  
  IF v_session.personal_shopper_id != v_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  IF v_session.estado != 'en_vivo' THEN
    RAISE EXCEPTION 'Can only pause active sessions';
  END IF;
  
  UPDATE ps_live_sessions
  SET 
    estado = 'pausada',
    lock_reason = 'session_paused'
  WHERE id = p_session_id;
  
  INSERT INTO ps_live_events (session_id, tipo, actor_id, actor_tipo, descripcion)
  VALUES (p_session_id, 'session_pause', v_user_id, 'shopper', 'Sesión pausada');
  
  RETURN jsonb_build_object('success', true, 'estado', 'pausada');
END;
$$;

-- =====================================================
-- RPC: RESUME SESSION (Atomic)
-- =====================================================
CREATE OR REPLACE FUNCTION public.resume_ps_live_session(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session RECORD;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  SELECT * INTO v_session
  FROM ps_live_sessions
  WHERE id = p_session_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  
  IF v_session.personal_shopper_id != v_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  IF v_session.estado != 'pausada' THEN
    RAISE EXCEPTION 'Can only resume paused sessions';
  END IF;
  
  -- Check if budget exhausted
  IF EXISTS (
    SELECT 1 FROM ps_live_orders 
    WHERE id = v_session.live_order_id AND budget_exhausted = true
  ) THEN
    RAISE EXCEPTION 'Cannot resume: budget exhausted';
  END IF;
  
  UPDATE ps_live_sessions
  SET 
    estado = 'en_vivo',
    lock_reason = 'session_active'
  WHERE id = p_session_id;
  
  INSERT INTO ps_live_events (session_id, tipo, actor_id, actor_tipo, descripcion)
  VALUES (p_session_id, 'session_resume', v_user_id, 'shopper', 'Sesión reanudada');
  
  RETURN jsonb_build_object('success', true, 'estado', 'en_vivo');
END;
$$;

-- =====================================================
-- RPC: END SESSION (Atomic with unlock)
-- =====================================================
CREATE OR REPLACE FUNCTION public.end_ps_live_session(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session RECORD;
  v_user_id uuid;
  v_total_approved numeric;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  SELECT * INTO v_session
  FROM ps_live_sessions
  WHERE id = p_session_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  
  IF v_session.personal_shopper_id != v_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  IF v_session.estado NOT IN ('en_vivo', 'pausada') THEN
    RAISE EXCEPTION 'Can only end active or paused sessions';
  END IF;
  
  -- Calculate total approved
  SELECT COALESCE(SUM(precio), 0) INTO v_total_approved
  FROM ps_live_proposals
  WHERE session_id = p_session_id AND respuesta = 'aprobada';
  
  -- Update session
  UPDATE ps_live_sessions
  SET 
    estado = 'finalizada',
    ended_at = now(),
    total_ventas = v_total_approved,
    locked_at = NULL,
    locked_by = NULL,
    lock_reason = NULL
  WHERE id = p_session_id;
  
  -- Update linked order
  IF v_session.live_order_id IS NOT NULL THEN
    UPDATE ps_live_orders
    SET 
      estado = 'completada',
      completed_at = now(),
      updated_at = now()
    WHERE id = v_session.live_order_id;
  END IF;
  
  INSERT INTO ps_live_events (session_id, tipo, actor_id, actor_tipo, descripcion, metadata)
  VALUES (
    p_session_id,
    'session_end',
    v_user_id,
    'shopper',
    'Sesión finalizada',
    jsonb_build_object('ended_at', now(), 'total_ventas', v_total_approved)
  );
  
  RETURN jsonb_build_object('success', true, 'estado', 'finalizada', 'total_ventas', v_total_approved);
END;
$$;

-- =====================================================
-- RPC: APPLY SILENCE RULE (Backend resolution)
-- =====================================================
CREATE OR REPLACE FUNCTION public.apply_silence_rule_to_proposal(p_proposal_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_proposal RECORD;
  v_order RECORD;
  v_action ps_live_silence_rule;
  v_new_response ps_live_proposal_response;
BEGIN
  -- Get proposal with lock
  SELECT * INTO v_proposal
  FROM ps_live_proposals
  WHERE id = p_proposal_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;
  
  IF v_proposal.respuesta != 'pendiente' THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Already responded');
  END IF;
  
  IF v_proposal.silencio_aplicado = true THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Silence already applied');
  END IF;
  
  -- Get order rules
  SELECT * INTO v_order
  FROM ps_live_orders
  WHERE id = v_proposal.live_order_id;
  
  v_action := v_order.regla_silencio_accion;
  
  -- Apply the rule
  CASE v_action
    WHEN 'rechazar_auto' THEN
      v_new_response := 'timeout_auto_rechazada';
    WHEN 'aprobar_auto' THEN
      -- Check budget before auto-approving
      IF (v_order.presupuesto_maximo - v_order.presupuesto_gastado) >= v_proposal.precio THEN
        v_new_response := 'timeout_auto_aprobada';
        -- Update budget
        UPDATE ps_live_orders
        SET presupuesto_gastado = presupuesto_gastado + v_proposal.precio,
            updated_at = now()
        WHERE id = v_proposal.live_order_id;
      ELSE
        v_new_response := 'timeout_auto_rechazada';
      END IF;
    WHEN 'pasar_siguiente' THEN
      v_new_response := 'timeout_auto_rechazada';
  END CASE;
  
  -- Update proposal
  UPDATE ps_live_proposals
  SET 
    respuesta = v_new_response,
    respuesta_at = now(),
    silencio_aplicado = true,
    silencio_aplicado_at = now()
  WHERE id = p_proposal_id;
  
  -- Log event
  INSERT INTO ps_live_events (session_id, tipo, actor_id, actor_tipo, descripcion, metadata)
  VALUES (
    v_proposal.session_id,
    'silence_rule_applied',
    v_order.cliente_id,
    'sistema',
    'Regla de silencio aplicada: ' || v_action::text,
    jsonb_build_object(
      'proposal_id', p_proposal_id,
      'action', v_action,
      'result', v_new_response
    )
  );
  
  RETURN jsonb_build_object('success', true, 'action', v_action, 'result', v_new_response);
END;
$$;

-- =====================================================
-- TRIGGER: CHECK BUDGET EXHAUSTED AFTER APPROVAL
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_budget_exhausted_after_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_session_id uuid;
BEGIN
  -- Only check on budget update
  IF NEW.presupuesto_gastado >= NEW.presupuesto_maximo AND 
     (OLD.budget_exhausted IS NULL OR OLD.budget_exhausted = false) THEN
    
    -- Mark as exhausted
    NEW.budget_exhausted := true;
    NEW.budget_exhausted_at := now();
    
    -- Get active session
    SELECT id INTO v_session_id
    FROM ps_live_sessions
    WHERE live_order_id = NEW.id AND estado IN ('en_vivo', 'pausada')
    LIMIT 1;
    
    IF v_session_id IS NOT NULL THEN
      -- Log budget exhausted event
      INSERT INTO ps_live_events (session_id, tipo, actor_id, actor_tipo, descripcion, metadata)
      VALUES (
        v_session_id,
        'budget_exhausted',
        NEW.cliente_id,
        'sistema',
        'Presupuesto máximo alcanzado',
        jsonb_build_object(
          'presupuesto_maximo', NEW.presupuesto_maximo,
          'presupuesto_gastado', NEW.presupuesto_gastado
        )
      );
      
      -- Auto-pause session when budget exhausted
      UPDATE ps_live_sessions
      SET estado = 'pausada',
          lock_reason = 'budget_exhausted'
      WHERE id = v_session_id AND estado = 'en_vivo';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_check_budget_exhausted ON ps_live_orders;
CREATE TRIGGER trigger_check_budget_exhausted
  BEFORE UPDATE OF presupuesto_gastado ON ps_live_orders
  FOR EACH ROW
  EXECUTE FUNCTION check_budget_exhausted_after_approval();

-- =====================================================
-- RPC: CREATE PROPOSAL (Enhanced with full validation)
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_ps_live_proposal(
  p_session_id uuid,
  p_live_order_id uuid,
  p_nombre_producto text,
  p_precio numeric,
  p_tienda text,
  p_categoria text,
  p_descripcion text DEFAULT NULL,
  p_imagen_url text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_order RECORD;
  v_session RECORD;
  v_disponible numeric;
  v_items_count integer;
  v_proposal_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get order with lock
  SELECT * INTO v_order
  FROM ps_live_orders
  WHERE id = p_live_order_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Verify shopper
  IF v_order.personal_shopper_id != v_user_id THEN
    RAISE EXCEPTION 'Not authorized to create proposals';
  END IF;
  
  -- Check session is active
  SELECT * INTO v_session
  FROM ps_live_sessions
  WHERE id = p_session_id AND live_order_id = p_live_order_id;
  
  IF NOT FOUND OR v_session.estado != 'en_vivo' THEN
    RAISE EXCEPTION 'Session is not active';
  END IF;
  
  -- Check budget exhausted
  IF v_order.budget_exhausted = true THEN
    RAISE EXCEPTION 'Budget exhausted';
  END IF;
  
  -- Calculate available budget
  v_disponible := v_order.presupuesto_maximo - v_order.presupuesto_gastado;
  
  IF v_disponible < p_precio THEN
    RAISE EXCEPTION 'Insufficient budget. Available: %, Requested: %', v_disponible, p_precio;
  END IF;
  
  -- Check category is allowed
  IF NOT (p_categoria = ANY(v_order.categorias_permitidas)) THEN
    RAISE EXCEPTION 'Category not allowed: %', p_categoria;
  END IF;
  
  -- Check item limit
  SELECT COUNT(*) INTO v_items_count
  FROM ps_live_proposals
  WHERE live_order_id = p_live_order_id AND respuesta = 'aprobada';
  
  IF v_items_count >= v_order.limite_items THEN
    RAISE EXCEPTION 'Item limit reached: %', v_order.limite_items;
  END IF;
  
  -- Create proposal
  INSERT INTO ps_live_proposals (
    session_id, live_order_id, nombre_producto, precio, tienda, 
    categoria, descripcion, imagen_url, presupuesto_disponible_al_proponer
  ) VALUES (
    p_session_id, p_live_order_id, p_nombre_producto, p_precio, p_tienda,
    p_categoria, p_descripcion, p_imagen_url, v_disponible
  )
  RETURNING id INTO v_proposal_id;
  
  -- Log event
  INSERT INTO ps_live_events (session_id, tipo, actor_id, actor_tipo, descripcion, metadata)
  VALUES (
    p_session_id,
    'proposal_created',
    v_user_id,
    'shopper',
    'Nueva propuesta: ' || p_nombre_producto,
    jsonb_build_object(
      'proposal_id', v_proposal_id,
      'producto', p_nombre_producto,
      'precio', p_precio,
      'presupuesto_disponible', v_disponible
    )
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'proposal_id', v_proposal_id,
    'presupuesto_disponible', v_disponible - p_precio
  );
END;
$$;

-- =====================================================
-- UPDATE EXISTING RPCs: Ensure SECURITY DEFINER
-- =====================================================

-- approve_live_proposal already has SECURITY DEFINER, enhance validation
CREATE OR REPLACE FUNCTION public.approve_live_proposal(p_proposal_id uuid, p_cliente_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_proposal RECORD;
  v_disponible NUMERIC;
  v_auth_user uuid;
BEGIN
  v_auth_user := auth.uid();
  
  -- Critical: Verify authenticated user matches claimed client
  IF v_auth_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF v_auth_user != p_cliente_id THEN
    RAISE EXCEPTION 'Client ID mismatch';
  END IF;
  
  -- Get proposal details with lock
  SELECT * INTO v_proposal 
  FROM ps_live_proposals 
  WHERE id = p_proposal_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Propuesta no encontrada';
  END IF;
  
  IF v_proposal.respuesta != 'pendiente' THEN
    RAISE EXCEPTION 'Propuesta ya fue respondida';
  END IF;
  
  -- Check budget with lock
  SELECT (presupuesto_maximo - presupuesto_gastado) INTO v_disponible
  FROM ps_live_orders
  WHERE id = v_proposal.live_order_id AND cliente_id = p_cliente_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Orden no encontrada o no pertenece al cliente';
  END IF;
  
  IF v_disponible < v_proposal.precio THEN
    RAISE EXCEPTION 'Presupuesto insuficiente';
  END IF;
  
  -- Update proposal
  UPDATE ps_live_proposals
  SET respuesta = 'aprobada', respuesta_at = now()
  WHERE id = p_proposal_id;
  
  -- Update budget spent (this will trigger budget_exhausted check)
  UPDATE ps_live_orders
  SET presupuesto_gastado = presupuesto_gastado + v_proposal.precio,
      updated_at = now()
  WHERE id = v_proposal.live_order_id;
  
  -- Create event
  INSERT INTO ps_live_events (session_id, tipo, actor_id, actor_tipo, descripcion, metadata)
  VALUES (
    v_proposal.session_id,
    'proposal_approved',
    p_cliente_id,
    'cliente',
    'Propuesta aprobada: ' || v_proposal.nombre_producto,
    jsonb_build_object(
      'proposal_id', p_proposal_id,
      'producto', v_proposal.nombre_producto,
      'precio', v_proposal.precio
    )
  );
  
  RETURN true;
END;
$$;

-- reject_live_proposal - enhance with auth validation
CREATE OR REPLACE FUNCTION public.reject_live_proposal(p_proposal_id uuid, p_cliente_id uuid, p_motivo text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_proposal RECORD;
  v_auth_user uuid;
BEGIN
  v_auth_user := auth.uid();
  
  IF v_auth_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF v_auth_user != p_cliente_id THEN
    RAISE EXCEPTION 'Client ID mismatch';
  END IF;
  
  SELECT * INTO v_proposal 
  FROM ps_live_proposals 
  WHERE id = p_proposal_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Propuesta no encontrada';
  END IF;
  
  IF v_proposal.respuesta != 'pendiente' THEN
    RAISE EXCEPTION 'Propuesta ya fue respondida';
  END IF;
  
  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM ps_live_orders 
    WHERE id = v_proposal.live_order_id AND cliente_id = p_cliente_id
  ) THEN
    RAISE EXCEPTION 'No tienes permiso para esta acción';
  END IF;
  
  -- Update proposal
  UPDATE ps_live_proposals
  SET respuesta = 'rechazada', 
      respuesta_at = now(),
      motivo_rechazo = p_motivo
  WHERE id = p_proposal_id;
  
  -- Create event
  INSERT INTO ps_live_events (session_id, tipo, actor_id, actor_tipo, descripcion, metadata)
  VALUES (
    v_proposal.session_id,
    'proposal_rejected',
    p_cliente_id,
    'cliente',
    'Propuesta rechazada: ' || v_proposal.nombre_producto,
    jsonb_build_object(
      'proposal_id', p_proposal_id,
      'producto', v_proposal.nombre_producto,
      'motivo', p_motivo
    )
  );
  
  RETURN true;
END;
$$;

-- =====================================================
-- RLS: Client read-only viewer during session
-- =====================================================

-- Clients can only view (not modify) session data during active sessions
-- Already enforced by existing policies, but let's add explicit viewer policy

CREATE POLICY "Clients view sessions as observers"
ON public.ps_live_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ps_live_orders
    WHERE ps_live_orders.id = ps_live_sessions.live_order_id
    AND ps_live_orders.cliente_id = auth.uid()
  )
);

-- Ensure clients cannot update sessions
DROP POLICY IF EXISTS "Clients cannot update sessions" ON ps_live_sessions;

-- =====================================================
-- Enable realtime for new columns
-- =====================================================
-- Already enabled for ps_live_orders table
