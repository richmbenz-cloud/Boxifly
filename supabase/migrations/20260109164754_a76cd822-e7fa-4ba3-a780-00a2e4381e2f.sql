-- ====================================================
-- TABLA: ps_client_approvals
-- Registro de aceptaciones explícitas del cliente por hitos
-- ====================================================

CREATE TABLE public.ps_client_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.ps_orders(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL,
  tipo_aprobacion TEXT NOT NULL, -- 'cotizacion', 'cambio_precio', 'autoriza_compra', 'acepta_riesgo', 'alternativa_rechazada', 'cambio_especificaciones'
  descripcion TEXT,
  monto_original NUMERIC(10,2),
  monto_nuevo NUMERIC(10,2),
  detalle_cambio JSONB, -- Información estructurada del cambio
  aprobado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  aprobado_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT
);

-- Índices
CREATE INDEX idx_ps_client_approvals_order ON public.ps_client_approvals(order_id);
CREATE INDEX idx_ps_client_approvals_cliente ON public.ps_client_approvals(cliente_id);
CREATE INDEX idx_ps_client_approvals_tipo ON public.ps_client_approvals(tipo_aprobacion);

-- Enable RLS
ALTER TABLE public.ps_client_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Clientes ven sus aprobaciones" ON public.ps_client_approvals
  FOR SELECT USING (auth.uid() = cliente_id);

CREATE POLICY "Shoppers ven aprobaciones de sus órdenes" ON public.ps_client_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ps_orders 
      WHERE ps_orders.id = ps_client_approvals.order_id 
      AND ps_orders.personal_shopper_id = auth.uid()
    )
  );

CREATE POLICY "Admins ven todas las aprobaciones" ON public.ps_client_approvals
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clientes crean sus aprobaciones" ON public.ps_client_approvals
  FOR INSERT WITH CHECK (auth.uid() = cliente_id);

-- ====================================================
-- TABLA: ps_decision_log
-- Registro de decisiones y autorizaciones del cliente (trazabilidad)
-- ====================================================

CREATE TABLE public.ps_decision_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.ps_orders(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL, -- Quien registró la decisión (cliente, PS, sistema)
  actor_tipo TEXT NOT NULL, -- 'cliente', 'shopper', 'sistema'
  tipo_decision TEXT NOT NULL, -- 'rechazo_alternativa', 'cambio_presupuesto', 'cambio_especificaciones', 'autoriza_riesgo', 'acepta_variacion_precio', 'acepta_demora'
  descripcion TEXT NOT NULL,
  contexto JSONB, -- Datos adicionales del contexto
  requires_approval BOOLEAN DEFAULT false, -- Si requiere aprobación del cliente para continuar
  approved BOOLEAN,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_ps_decision_log_order ON public.ps_decision_log(order_id);
CREATE INDEX idx_ps_decision_log_actor ON public.ps_decision_log(actor_id);
CREATE INDEX idx_ps_decision_log_tipo ON public.ps_decision_log(tipo_decision);

-- Enable RLS
ALTER TABLE public.ps_decision_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Clientes ven decisiones de sus órdenes" ON public.ps_decision_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ps_orders 
      WHERE ps_orders.id = ps_decision_log.order_id 
      AND ps_orders.cliente_id = auth.uid()
    )
  );

CREATE POLICY "Shoppers ven decisiones de sus órdenes" ON public.ps_decision_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ps_orders 
      WHERE ps_orders.id = ps_decision_log.order_id 
      AND ps_orders.personal_shopper_id = auth.uid()
    )
  );

CREATE POLICY "Admins ven todas las decisiones" ON public.ps_decision_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuarios autenticados insertan decisiones" ON public.ps_decision_log
  FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- ====================================================
-- TABLA: ps_live_incidents
-- Incidencias específicas de sesiones Live
-- ====================================================

CREATE TABLE public.ps_live_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.ps_live_sessions(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'cancelacion', 'reprogramacion', 'producto_no_disponible', 'grabacion_prohibida', 'problema_conexion', 'otro'
  descripcion TEXT NOT NULL,
  resolucion TEXT,
  producto_afectado TEXT,
  alternativa_ofrecida TEXT,
  cliente_decision TEXT, -- 'acepta_alternativa', 'solicita_reembolso', 'espera_restock', 'cancela'
  cliente_decision_at TIMESTAMP WITH TIME ZONE,
  reportado_por UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_ps_live_incidents_session ON public.ps_live_incidents(session_id);
CREATE INDEX idx_ps_live_incidents_tipo ON public.ps_live_incidents(tipo);

-- Enable RLS
ALTER TABLE public.ps_live_incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Shoppers ven incidentes de sus sesiones" ON public.ps_live_incidents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ps_live_sessions 
      WHERE ps_live_sessions.id = ps_live_incidents.session_id 
      AND ps_live_sessions.personal_shopper_id = auth.uid()
    )
  );

CREATE POLICY "Admins ven todos los incidentes" ON public.ps_live_incidents
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Shoppers crean incidentes de sus sesiones" ON public.ps_live_incidents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ps_live_sessions 
      WHERE ps_live_sessions.id = ps_live_incidents.session_id 
      AND ps_live_sessions.personal_shopper_id = auth.uid()
    )
  );

CREATE POLICY "Shoppers actualizan incidentes de sus sesiones" ON public.ps_live_incidents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.ps_live_sessions 
      WHERE ps_live_sessions.id = ps_live_incidents.session_id 
      AND ps_live_sessions.personal_shopper_id = auth.uid()
    )
  );

-- ====================================================
-- Agregar columna de bloqueo a ps_orders para control de estados
-- ====================================================

ALTER TABLE public.ps_orders 
ADD COLUMN IF NOT EXISTS requires_client_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS blocked_reason TEXT,
ADD COLUMN IF NOT EXISTS last_client_action_at TIMESTAMP WITH TIME ZONE;