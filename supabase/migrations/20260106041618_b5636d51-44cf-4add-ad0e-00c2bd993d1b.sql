-- =====================================================
-- MODELO DE BASE DE DATOS: PERSONAL SHOPPER BOXIFLY
-- =====================================================

-- 1️⃣ ENUMS PARA EL SERVICIO
-- =====================================================

-- Tipo de servicio PS
CREATE TYPE ps_service_type AS ENUM ('asistido', 'live');

-- Categorías de productos
CREATE TYPE ps_category AS ENUM (
  'moda',
  'electronica',
  'bebes',
  'hogar',
  'deportes',
  'belleza',
  'juguetes',
  'otros'
);

-- Estados de solicitud
CREATE TYPE ps_request_status AS ENUM (
  'recibida',
  'en_revision',
  'cotizada',
  'aprobada',
  'rechazada',
  'cancelada'
);

-- Estados de pedido (10 estados obligatorios)
CREATE TYPE ps_order_status AS ENUM (
  'solicitud_recibida',
  'en_revision',
  'aprobado_cliente',
  'compra_en_proceso',
  'producto_comprado',
  'en_almacen_usa',
  'en_transito',
  'en_aduanas',
  'en_reparto',
  'entregado'
);

-- Estados de sesión live
CREATE TYPE ps_live_status AS ENUM (
  'programada',
  'en_vivo',
  'finalizada',
  'cancelada'
);

-- Tipo de mensaje
CREATE TYPE ps_message_type AS ENUM ('texto', 'imagen', 'sistema');

-- Estado de pago PS
CREATE TYPE ps_payment_status AS ENUM ('pendiente', 'procesando', 'completado', 'fallido', 'reembolsado');

-- 2️⃣ TABLA: ps_requests (Solicitudes Personal Shopper)
-- =====================================================
CREATE TABLE public.ps_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo y categoría
  tipo_servicio ps_service_type NOT NULL DEFAULT 'asistido',
  categoria ps_category NOT NULL,
  
  -- Detalles del producto
  descripcion_producto TEXT NOT NULL,
  url_referencia TEXT,
  imagen_referencia TEXT,
  especificaciones JSONB DEFAULT '{}',
  
  -- Presupuesto
  presupuesto_min NUMERIC(10,2),
  presupuesto_max NUMERIC(10,2) NOT NULL,
  
  -- Estado y prioridad
  estado ps_request_status NOT NULL DEFAULT 'recibida',
  prioridad INTEGER DEFAULT 1 CHECK (prioridad BETWEEN 1 AND 5),
  
  -- Metadata
  notas_cliente TEXT,
  motivo_rechazo TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para ps_requests
CREATE INDEX idx_ps_requests_cliente ON public.ps_requests(cliente_id);
CREATE INDEX idx_ps_requests_estado ON public.ps_requests(estado);
CREATE INDEX idx_ps_requests_tipo ON public.ps_requests(tipo_servicio);
CREATE INDEX idx_ps_requests_created ON public.ps_requests(created_at DESC);

-- 3️⃣ TABLA: ps_orders (Pedidos Personal Shopper)
-- =====================================================
CREATE TABLE public.ps_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.ps_requests(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  personal_shopper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Montos (Cliente nunca ve desglose interno)
  monto_producto NUMERIC(10,2) NOT NULL,
  comision_boxifly NUMERIC(10,2) NOT NULL DEFAULT 0,
  costo_envio_usa NUMERIC(10,2) DEFAULT 0,
  costo_servicio NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_cliente NUMERIC(10,2) NOT NULL,
  
  -- Comisión PS (solo visible para admin y PS)
  comision_ps NUMERIC(10,2) DEFAULT 0,
  
  -- Estado
  estado ps_order_status NOT NULL DEFAULT 'solicitud_recibida',
  
  -- Tracking
  tracking_usa TEXT,
  tracking_internacional TEXT,
  
  -- Fechas clave
  fecha_compra TIMESTAMPTZ,
  fecha_recepcion_usa TIMESTAMPTZ,
  fecha_envio_peru TIMESTAMPTZ,
  fecha_entrega TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- Índices para ps_orders
CREATE INDEX idx_ps_orders_cliente ON public.ps_orders(cliente_id);
CREATE INDEX idx_ps_orders_ps ON public.ps_orders(personal_shopper_id);
CREATE INDEX idx_ps_orders_request ON public.ps_orders(request_id);
CREATE INDEX idx_ps_orders_estado ON public.ps_orders(estado);
CREATE INDEX idx_ps_orders_created ON public.ps_orders(created_at DESC);

-- 4️⃣ TABLA: ps_order_status_history (Historial de estados)
-- =====================================================
CREATE TABLE public.ps_order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.ps_orders(id) ON DELETE CASCADE,
  
  -- Estado
  estado ps_order_status NOT NULL,
  estado_anterior ps_order_status,
  
  -- Detalles
  comentario TEXT,
  actualizado_por UUID REFERENCES auth.users(id),
  es_automatico BOOLEAN DEFAULT false,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para historial
CREATE INDEX idx_ps_status_history_order ON public.ps_order_status_history(order_id);
CREATE INDEX idx_ps_status_history_created ON public.ps_order_status_history(created_at DESC);

-- 5️⃣ TABLA: ps_messages (Mensajería interna)
-- =====================================================
CREATE TABLE public.ps_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.ps_orders(id) ON DELETE CASCADE,
  
  -- Emisor
  emisor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contenido
  mensaje TEXT NOT NULL,
  tipo ps_message_type NOT NULL DEFAULT 'texto',
  imagen_url TEXT,
  
  -- Lectura
  leido BOOLEAN DEFAULT false,
  leido_at TIMESTAMPTZ,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para mensajes
CREATE INDEX idx_ps_messages_order ON public.ps_messages(order_id);
CREATE INDEX idx_ps_messages_emisor ON public.ps_messages(emisor_id);
CREATE INDEX idx_ps_messages_created ON public.ps_messages(created_at DESC);

-- 6️⃣ TABLA: ps_payments (Pagos del servicio PS)
-- =====================================================
CREATE TABLE public.ps_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.ps_orders(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Monto
  monto NUMERIC(10,2) NOT NULL,
  moneda TEXT DEFAULT 'PEN',
  
  -- Método y estado
  metodo_pago TEXT,
  estado ps_payment_status NOT NULL DEFAULT 'pendiente',
  
  -- Referencias externas
  referencia_externa TEXT,
  gateway_response JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- Índices para pagos
CREATE INDEX idx_ps_payments_order ON public.ps_payments(order_id);
CREATE INDEX idx_ps_payments_cliente ON public.ps_payments(cliente_id);
CREATE INDEX idx_ps_payments_estado ON public.ps_payments(estado);

-- 7️⃣ TABLA: ps_live_sessions (Sesiones Live - estructura base)
-- =====================================================
CREATE TABLE public.ps_live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personal_shopper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Detalles de la sesión
  titulo TEXT NOT NULL,
  descripcion TEXT,
  categoria ps_category NOT NULL,
  
  -- Ubicación
  tienda TEXT NOT NULL,
  ubicacion TEXT NOT NULL,
  ciudad TEXT,
  
  -- Programación
  fecha DATE NOT NULL,
  hora_peru TIME NOT NULL,
  hora_usa TIME NOT NULL,
  duracion_estimada INTEGER DEFAULT 60, -- minutos
  
  -- Estado
  estado ps_live_status NOT NULL DEFAULT 'programada',
  
  -- Métricas (para futuro)
  max_viewers INTEGER DEFAULT 0,
  total_ventas NUMERIC(10,2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

-- Índices para sesiones live
CREATE INDEX idx_ps_live_sessions_ps ON public.ps_live_sessions(personal_shopper_id);
CREATE INDEX idx_ps_live_sessions_fecha ON public.ps_live_sessions(fecha);
CREATE INDEX idx_ps_live_sessions_estado ON public.ps_live_sessions(estado);
CREATE INDEX idx_ps_live_sessions_categoria ON public.ps_live_sessions(categoria);

-- 8️⃣ TABLA: ps_quotes (Cotizaciones)
-- =====================================================
CREATE TABLE public.ps_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.ps_requests(id) ON DELETE CASCADE,
  personal_shopper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Producto cotizado
  nombre_producto TEXT NOT NULL,
  descripcion TEXT,
  url_producto TEXT,
  imagen_url TEXT,
  
  -- Precios
  precio_producto NUMERIC(10,2) NOT NULL,
  impuestos_estimados NUMERIC(10,2) DEFAULT 0,
  costo_servicio NUMERIC(10,2) NOT NULL,
  total_estimado NUMERIC(10,2) NOT NULL,
  
  -- Estado
  es_seleccionada BOOLEAN DEFAULT false,
  notas_ps TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Índices para cotizaciones
CREATE INDEX idx_ps_quotes_request ON public.ps_quotes(request_id);
CREATE INDEX idx_ps_quotes_ps ON public.ps_quotes(personal_shopper_id);

-- 9️⃣ TABLA: ps_incidents (Incidencias)
-- =====================================================
CREATE TABLE public.ps_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.ps_orders(id) ON DELETE CASCADE,
  reportado_por UUID NOT NULL REFERENCES auth.users(id),
  
  -- Tipo de incidencia
  tipo TEXT NOT NULL CHECK (tipo IN (
    'producto_agotado',
    'cambio_precio',
    'error_talla',
    'error_color',
    'cancelacion_vendedor',
    'producto_danado',
    'otro'
  )),
  
  -- Detalles
  descripcion TEXT NOT NULL,
  evidencia_urls TEXT[],
  
  -- Resolución
  estado TEXT NOT NULL DEFAULT 'abierta' CHECK (estado IN ('abierta', 'en_proceso', 'resuelta', 'cerrada')),
  resolucion TEXT,
  resuelto_por UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Índices para incidencias
CREATE INDEX idx_ps_incidents_order ON public.ps_incidents(order_id);
CREATE INDEX idx_ps_incidents_estado ON public.ps_incidents(estado);

-- =====================================================
-- 🔐 RLS POLICIES
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.ps_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ps_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ps_order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ps_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ps_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ps_live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ps_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ps_incidents ENABLE ROW LEVEL SECURITY;

-- ===== PS_REQUESTS =====
-- Clientes pueden ver sus propias solicitudes
CREATE POLICY "Clientes ven sus solicitudes"
  ON public.ps_requests FOR SELECT
  USING (auth.uid() = cliente_id);

-- Clientes pueden crear solicitudes
CREATE POLICY "Clientes crean solicitudes"
  ON public.ps_requests FOR INSERT
  WITH CHECK (auth.uid() = cliente_id);

-- Clientes pueden actualizar sus solicitudes pendientes
CREATE POLICY "Clientes actualizan solicitudes pendientes"
  ON public.ps_requests FOR UPDATE
  USING (auth.uid() = cliente_id AND estado IN ('recibida', 'cotizada'));

-- PS verificados ven solicitudes aprobadas
CREATE POLICY "PS ven solicitudes disponibles"
  ON public.ps_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND shopper_verified = true
    )
    AND estado IN ('recibida', 'en_revision', 'cotizada', 'aprobada')
  );

-- Admin ve todo
CREATE POLICY "Admin gestiona solicitudes"
  ON public.ps_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- ===== PS_ORDERS =====
-- Clientes ven sus pedidos (sin detalles internos de comisiones)
CREATE POLICY "Clientes ven sus pedidos"
  ON public.ps_orders FOR SELECT
  USING (auth.uid() = cliente_id);

-- PS ven sus pedidos asignados
CREATE POLICY "PS ven pedidos asignados"
  ON public.ps_orders FOR SELECT
  USING (auth.uid() = personal_shopper_id);

-- PS pueden actualizar sus pedidos
CREATE POLICY "PS actualizan pedidos"
  ON public.ps_orders FOR UPDATE
  USING (auth.uid() = personal_shopper_id);

-- Admin gestiona todo
CREATE POLICY "Admin gestiona pedidos"
  ON public.ps_orders FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- ===== PS_ORDER_STATUS_HISTORY =====
-- Clientes ven historial de sus pedidos
CREATE POLICY "Clientes ven historial"
  ON public.ps_order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ps_orders 
      WHERE id = order_id AND cliente_id = auth.uid()
    )
  );

-- PS ven historial de sus pedidos
CREATE POLICY "PS ven historial"
  ON public.ps_order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ps_orders 
      WHERE id = order_id AND personal_shopper_id = auth.uid()
    )
  );

-- PS pueden insertar en historial
CREATE POLICY "PS insertan historial"
  ON public.ps_order_status_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ps_orders 
      WHERE id = order_id AND personal_shopper_id = auth.uid()
    )
  );

-- Admin gestiona historial
CREATE POLICY "Admin gestiona historial"
  ON public.ps_order_status_history FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- ===== PS_MESSAGES =====
-- Participantes ven mensajes
CREATE POLICY "Participantes ven mensajes"
  ON public.ps_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ps_orders 
      WHERE id = order_id 
      AND (cliente_id = auth.uid() OR personal_shopper_id = auth.uid())
    )
  );

-- Participantes envían mensajes
CREATE POLICY "Participantes envian mensajes"
  ON public.ps_messages FOR INSERT
  WITH CHECK (
    auth.uid() = emisor_id
    AND EXISTS (
      SELECT 1 FROM ps_orders 
      WHERE id = order_id 
      AND (cliente_id = auth.uid() OR personal_shopper_id = auth.uid())
    )
  );

-- Participantes marcan como leído
CREATE POLICY "Participantes marcan leido"
  ON public.ps_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM ps_orders 
      WHERE id = order_id 
      AND (cliente_id = auth.uid() OR personal_shopper_id = auth.uid())
    )
  );

-- Admin ve todos los mensajes
CREATE POLICY "Admin ve mensajes"
  ON public.ps_messages FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- ===== PS_PAYMENTS =====
-- Clientes ven sus pagos
CREATE POLICY "Clientes ven sus pagos"
  ON public.ps_payments FOR SELECT
  USING (auth.uid() = cliente_id);

-- Admin gestiona pagos
CREATE POLICY "Admin gestiona pagos"
  ON public.ps_payments FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Sistema puede insertar pagos
CREATE POLICY "Sistema inserta pagos"
  ON public.ps_payments FOR INSERT
  WITH CHECK (true);

-- ===== PS_LIVE_SESSIONS =====
-- Todos ven sesiones programadas/en vivo
CREATE POLICY "Publico ve sesiones activas"
  ON public.ps_live_sessions FOR SELECT
  USING (estado IN ('programada', 'en_vivo'));

-- PS gestionan sus sesiones
CREATE POLICY "PS gestionan sus sesiones"
  ON public.ps_live_sessions FOR ALL
  USING (auth.uid() = personal_shopper_id);

-- Admin gestiona sesiones
CREATE POLICY "Admin gestiona sesiones"
  ON public.ps_live_sessions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- ===== PS_QUOTES =====
-- Clientes ven cotizaciones de sus solicitudes
CREATE POLICY "Clientes ven cotizaciones"
  ON public.ps_quotes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ps_requests 
      WHERE id = request_id AND cliente_id = auth.uid()
    )
  );

-- PS crean cotizaciones
CREATE POLICY "PS crean cotizaciones"
  ON public.ps_quotes FOR INSERT
  WITH CHECK (auth.uid() = personal_shopper_id);

-- PS ven sus cotizaciones
CREATE POLICY "PS ven sus cotizaciones"
  ON public.ps_quotes FOR SELECT
  USING (auth.uid() = personal_shopper_id);

-- Admin gestiona cotizaciones
CREATE POLICY "Admin gestiona cotizaciones"
  ON public.ps_quotes FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- ===== PS_INCIDENTS =====
-- Participantes ven incidencias
CREATE POLICY "Participantes ven incidencias"
  ON public.ps_incidents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ps_orders 
      WHERE id = order_id 
      AND (cliente_id = auth.uid() OR personal_shopper_id = auth.uid())
    )
  );

-- Participantes crean incidencias
CREATE POLICY "Participantes crean incidencias"
  ON public.ps_incidents FOR INSERT
  WITH CHECK (
    auth.uid() = reportado_por
    AND EXISTS (
      SELECT 1 FROM ps_orders 
      WHERE id = order_id 
      AND (cliente_id = auth.uid() OR personal_shopper_id = auth.uid())
    )
  );

-- Admin gestiona incidencias
CREATE POLICY "Admin gestiona incidencias"
  ON public.ps_incidents FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- 🔄 TRIGGERS
-- =====================================================

-- Trigger para updated_at en ps_requests
CREATE TRIGGER update_ps_requests_updated_at
  BEFORE UPDATE ON public.ps_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para updated_at en ps_orders
CREATE TRIGGER update_ps_orders_updated_at
  BEFORE UPDATE ON public.ps_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Función para registrar cambios de estado automáticamente
CREATE OR REPLACE FUNCTION public.log_ps_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.estado IS DISTINCT FROM NEW.estado) THEN
    INSERT INTO public.ps_order_status_history (
      order_id, 
      estado, 
      estado_anterior, 
      actualizado_por,
      es_automatico
    )
    VALUES (
      NEW.id, 
      NEW.estado, 
      OLD.estado, 
      auth.uid(),
      auth.uid() IS NULL
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para log automático de cambios de estado
CREATE TRIGGER log_ps_order_status
  AFTER UPDATE ON public.ps_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.log_ps_order_status_change();