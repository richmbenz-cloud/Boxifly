-- =====================================================
-- PS LIVE MODULE - COMPLETE DATABASE SCHEMA
-- =====================================================

-- 1. Extend ps_live_status enum with new states
ALTER TYPE ps_live_status ADD VALUE IF NOT EXISTS 'esperando_ps';
ALTER TYPE ps_live_status ADD VALUE IF NOT EXISTS 'pausada';
ALTER TYPE ps_live_status ADD VALUE IF NOT EXISTS 'expirada';

-- 2. Create ENUM for proposal response types
DO $$ BEGIN
  CREATE TYPE ps_live_proposal_response AS ENUM ('aprobada', 'rechazada', 'timeout_auto_aprobada', 'timeout_auto_rechazada', 'pendiente');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Create ENUM for silence rules
DO $$ BEGIN
  CREATE TYPE ps_live_silence_rule AS ENUM ('rechazar_auto', 'aprobar_auto', 'pasar_siguiente');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Create ENUM for approval type
DO $$ BEGIN
  CREATE TYPE ps_live_approval_type AS ENUM ('automatica', 'manual_por_item');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. Create ENUM for payment method type
DO $$ BEGIN
  CREATE TYPE ps_live_payment_method AS ENUM ('wallet', 'preautorizacion');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6. Create ENUM for PS Live order status
DO $$ BEGIN
  CREATE TYPE ps_live_order_status AS ENUM (
    'borrador',
    'pendiente_aprobacion',
    'aprobada',
    'en_sesion',
    'completada',
    'cancelada',
    'expirada'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- 7. PS LIVE ORDERS (BASE ORDER WITH RULES)
-- This is the MANDATORY prerequisite for any PS Live session
-- =====================================================
CREATE TABLE IF NOT EXISTS ps_live_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL,
  personal_shopper_id UUID,
  
  -- Financial limits (CRITICAL - non-negotiable)
  presupuesto_maximo NUMERIC NOT NULL CHECK (presupuesto_maximo > 0),
  presupuesto_gastado NUMERIC DEFAULT 0 CHECK (presupuesto_gastado >= 0),
  moneda TEXT NOT NULL DEFAULT 'USD',
  
  -- Category and store rules
  categorias_permitidas TEXT[] NOT NULL,
  tiendas_objetivo TEXT[],
  
  -- Session rules
  duracion_max_sesion INTEGER NOT NULL DEFAULT 60, -- minutes
  limite_items INTEGER NOT NULL DEFAULT 10,
  regla_silencio_segundos INTEGER NOT NULL DEFAULT 30,
  regla_silencio_accion ps_live_silence_rule NOT NULL DEFAULT 'rechazar_auto',
  
  -- Approval type
  tipo_aprobacion ps_live_approval_type NOT NULL DEFAULT 'manual_por_item',
  
  -- Payment
  metodo_pago ps_live_payment_method NOT NULL DEFAULT 'preautorizacion',
  
  -- Status
  estado ps_live_order_status NOT NULL DEFAULT 'borrador',
  
  -- Dates
  fecha_preferida DATE,
  hora_preferida_peru TIME,
  
  -- Terms and conditions
  terminos_aceptados BOOLEAN DEFAULT false,
  terminos_aceptados_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 8. Add session_id reference to link sessions with orders
ALTER TABLE ps_live_sessions 
  ADD COLUMN IF NOT EXISTS live_order_id UUID REFERENCES ps_live_orders(id);

-- =====================================================
-- 9. PS LIVE PROPOSALS (PRODUCT PROPOSALS DURING SESSION)
-- Every product the PS proposes is tracked here
-- =====================================================
CREATE TABLE IF NOT EXISTS ps_live_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ps_live_sessions(id) ON DELETE CASCADE,
  live_order_id UUID NOT NULL REFERENCES ps_live_orders(id),
  
  -- Product details
  nombre_producto TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC NOT NULL CHECK (precio > 0),
  tienda TEXT NOT NULL,
  categoria TEXT NOT NULL,
  imagen_url TEXT,
  
  -- Client response
  respuesta ps_live_proposal_response NOT NULL DEFAULT 'pendiente',
  respuesta_at TIMESTAMP WITH TIME ZONE,
  motivo_rechazo TEXT,
  
  -- Silence tracking
  silencio_aplicado BOOLEAN DEFAULT false,
  silencio_aplicado_at TIMESTAMP WITH TIME ZONE,
  
  -- Budget at time of proposal
  presupuesto_disponible_al_proponer NUMERIC NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 10. PS LIVE EVENTS (COMPLETE AUDIT TRAIL)
-- All session events for traceability
-- =====================================================
CREATE TABLE IF NOT EXISTS ps_live_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ps_live_sessions(id) ON DELETE CASCADE,
  
  -- Event type
  tipo TEXT NOT NULL, -- 'session_start', 'session_pause', 'proposal_created', 'proposal_approved', 'proposal_rejected', 'silence_timeout', 'budget_exceeded', 'session_end', etc.
  
  -- Actor
  actor_id UUID NOT NULL,
  actor_tipo TEXT NOT NULL, -- 'cliente', 'shopper', 'sistema'
  
  -- Event data
  descripcion TEXT NOT NULL,
  metadata JSONB,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 11. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE ps_live_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ps_live_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ps_live_events ENABLE ROW LEVEL SECURITY;

-- PS Live Orders policies
CREATE POLICY "Clients can view their own live orders"
  ON ps_live_orders FOR SELECT
  USING (auth.uid() = cliente_id);

CREATE POLICY "Clients can create their own live orders"
  ON ps_live_orders FOR INSERT
  WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Clients can update their own draft orders"
  ON ps_live_orders FOR UPDATE
  USING (auth.uid() = cliente_id AND estado = 'borrador');

CREATE POLICY "Shoppers can view assigned live orders"
  ON ps_live_orders FOR SELECT
  USING (auth.uid() = personal_shopper_id);

CREATE POLICY "Shoppers can update assigned live orders status"
  ON ps_live_orders FOR UPDATE
  USING (auth.uid() = personal_shopper_id);

CREATE POLICY "Admins can view all live orders"
  ON ps_live_orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- PS Live Proposals policies
CREATE POLICY "Clients can view proposals for their sessions"
  ON ps_live_proposals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ps_live_orders 
    WHERE ps_live_orders.id = ps_live_proposals.live_order_id 
    AND ps_live_orders.cliente_id = auth.uid()
  ));

CREATE POLICY "Clients can update proposals (approve/reject)"
  ON ps_live_proposals FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM ps_live_orders 
    WHERE ps_live_orders.id = ps_live_proposals.live_order_id 
    AND ps_live_orders.cliente_id = auth.uid()
  ));

CREATE POLICY "Shoppers can create proposals"
  ON ps_live_proposals FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM ps_live_orders 
    WHERE ps_live_orders.id = ps_live_proposals.live_order_id 
    AND ps_live_orders.personal_shopper_id = auth.uid()
  ));

CREATE POLICY "Shoppers can view their proposals"
  ON ps_live_proposals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ps_live_orders 
    WHERE ps_live_orders.id = ps_live_proposals.live_order_id 
    AND ps_live_orders.personal_shopper_id = auth.uid()
  ));

CREATE POLICY "Admins can view all proposals"
  ON ps_live_proposals FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- PS Live Events policies
CREATE POLICY "Clients can view events for their sessions"
  ON ps_live_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ps_live_sessions s
    JOIN ps_live_orders o ON o.id = s.live_order_id
    WHERE s.id = ps_live_events.session_id 
    AND o.cliente_id = auth.uid()
  ));

CREATE POLICY "Shoppers can view and create events"
  ON ps_live_events FOR ALL
  USING (EXISTS (
    SELECT 1 FROM ps_live_sessions s
    JOIN ps_live_orders o ON o.id = s.live_order_id
    WHERE s.id = ps_live_events.session_id 
    AND o.personal_shopper_id = auth.uid()
  ));

CREATE POLICY "Admins can view all events"
  ON ps_live_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- =====================================================
-- 12. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_ps_live_orders_cliente ON ps_live_orders(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ps_live_orders_shopper ON ps_live_orders(personal_shopper_id);
CREATE INDEX IF NOT EXISTS idx_ps_live_orders_estado ON ps_live_orders(estado);
CREATE INDEX IF NOT EXISTS idx_ps_live_proposals_session ON ps_live_proposals(session_id);
CREATE INDEX IF NOT EXISTS idx_ps_live_proposals_order ON ps_live_proposals(live_order_id);
CREATE INDEX IF NOT EXISTS idx_ps_live_proposals_respuesta ON ps_live_proposals(respuesta);
CREATE INDEX IF NOT EXISTS idx_ps_live_events_session ON ps_live_events(session_id);
CREATE INDEX IF NOT EXISTS idx_ps_live_events_tipo ON ps_live_events(tipo);

-- =====================================================
-- 13. ENABLE REALTIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE ps_live_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE ps_live_proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE ps_live_events;

-- =====================================================
-- 14. FUNCTION: Check if budget allows new proposal
-- =====================================================
CREATE OR REPLACE FUNCTION check_budget_available(p_live_order_id UUID, p_amount NUMERIC)
RETURNS BOOLEAN AS $$
DECLARE
  v_disponible NUMERIC;
BEGIN
  SELECT (presupuesto_maximo - presupuesto_gastado) INTO v_disponible
  FROM ps_live_orders
  WHERE id = p_live_order_id;
  
  RETURN v_disponible >= p_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 15. FUNCTION: Process proposal approval
-- Updates budget and creates event
-- =====================================================
CREATE OR REPLACE FUNCTION approve_live_proposal(
  p_proposal_id UUID,
  p_cliente_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_proposal RECORD;
  v_disponible NUMERIC;
BEGIN
  -- Get proposal details
  SELECT * INTO v_proposal FROM ps_live_proposals WHERE id = p_proposal_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Propuesta no encontrada';
  END IF;
  
  IF v_proposal.respuesta != 'pendiente' THEN
    RAISE EXCEPTION 'Propuesta ya fue respondida';
  END IF;
  
  -- Check budget
  SELECT (presupuesto_maximo - presupuesto_gastado) INTO v_disponible
  FROM ps_live_orders
  WHERE id = v_proposal.live_order_id AND cliente_id = p_cliente_id;
  
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
  
  -- Update budget spent
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 16. FUNCTION: Reject proposal
-- =====================================================
CREATE OR REPLACE FUNCTION reject_live_proposal(
  p_proposal_id UUID,
  p_cliente_id UUID,
  p_motivo TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_proposal RECORD;
BEGIN
  SELECT * INTO v_proposal FROM ps_live_proposals WHERE id = p_proposal_id;
  
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 17. TRIGGER: Auto-update timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_ps_live_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ps_live_orders_updated_at ON ps_live_orders;
CREATE TRIGGER trg_ps_live_orders_updated_at
BEFORE UPDATE ON ps_live_orders
FOR EACH ROW
EXECUTE FUNCTION update_ps_live_orders_updated_at();

-- =====================================================
-- 18. TRIGGER: Notify on proposal creation
-- =====================================================
CREATE OR REPLACE FUNCTION notify_live_proposal_created()
RETURNS TRIGGER AS $$
DECLARE
  v_cliente_id UUID;
BEGIN
  -- Get client ID
  SELECT cliente_id INTO v_cliente_id
  FROM ps_live_orders
  WHERE id = NEW.live_order_id;
  
  -- Create notification for client
  INSERT INTO ps_notifications (user_id, tipo, titulo, mensaje, order_id, metadata)
  VALUES (
    v_cliente_id,
    'propuesta_live',
    '🛒 Nueva propuesta en vivo',
    'El Personal Shopper te propone: ' || NEW.nombre_producto || ' por $' || NEW.precio,
    NULL,
    jsonb_build_object('proposal_id', NEW.id, 'session_id', NEW.session_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_live_proposal ON ps_live_proposals;
CREATE TRIGGER trg_notify_live_proposal
AFTER INSERT ON ps_live_proposals
FOR EACH ROW
EXECUTE FUNCTION notify_live_proposal_created();

-- =====================================================
-- 19. TRIGGER: Block proposals if budget exceeded
-- =====================================================
CREATE OR REPLACE FUNCTION block_proposal_over_budget()
RETURNS TRIGGER AS $$
DECLARE
  v_disponible NUMERIC;
BEGIN
  SELECT (presupuesto_maximo - presupuesto_gastado) INTO v_disponible
  FROM ps_live_orders
  WHERE id = NEW.live_order_id;
  
  IF v_disponible < NEW.precio THEN
    RAISE EXCEPTION 'No se puede proponer: el precio ($%) excede el presupuesto disponible ($%)', NEW.precio, v_disponible;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_over_budget ON ps_live_proposals;
CREATE TRIGGER trg_block_over_budget
BEFORE INSERT ON ps_live_proposals
FOR EACH ROW
EXECUTE FUNCTION block_proposal_over_budget();