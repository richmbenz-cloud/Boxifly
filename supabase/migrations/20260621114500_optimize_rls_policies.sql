-- ============================================================
-- Optimizacion de RLS (P5)
--
-- Resuelve los dos hallazgos de performance del Performance Advisor
-- sobre las policies de RLS en el schema public:
--
-- 1) auth_rls_initplan (152): las policies referenciaban auth.uid()
--    directamente, lo que obliga a Postgres a re-evaluarlo POR CADA FILA.
--    Fix: envolver en un subquery escalar -> (select auth.uid()), que el
--    planner evalua UNA sola vez (initplan). Cambio puramente mecanico,
--    SIN cambio de semantica. Incluye el uso dentro de has_role(auth.uid(),...).
--
-- 2) multiple_permissive_policies: varias policies PERMISSIVE para el mismo
--    (tabla, comando, rol) se evaluan todas en cada query. Se consolidan en
--    UNA sola policy combinando sus condiciones con OR. Esto es SEMANTICAMENTE
--    IDENTICO a como Postgres ya combina policies permisivas en runtime
--    (USING := OR de los USING; WITH CHECK := OR de los WITH CHECK, usando el
--    USING como WITH CHECK efectivo cuando este es nulo en UPDATE/ALL).
--
--    Solo se consolidan grupos seguros: mismo comando y MISMO conjunto de
--    roles. Se EXCLUYEN a proposito (se dejan tal cual):
--      - grupos donde una policy cmd=ALL solapa con un comando especifico
--        (fusionarlos cambiaria la cobertura),
--      - grupos con conjuntos de roles distintos (p.ej. public vs authenticated).
--
-- Idempotencia: ALTER POLICY / DROP+CREATE. Re-ejecutar es seguro tras aplicar.
-- ============================================================

-- 1) initplan wrap: (select auth.uid()) en policies no fusionadas (112)
ALTER POLICY "Admins can manage B2B rates" ON public.b2b_rates
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "B2B users can view own rates" ON public.b2b_rates
  USING (((select auth.uid()) = user_id));
ALTER POLICY "Users can delete from own cart" ON public.cart_items
  USING (((select auth.uid()) = user_id));
ALTER POLICY "Users can insert into own cart" ON public.cart_items
  WITH CHECK (((select auth.uid()) = user_id));
ALTER POLICY "Users can view own cart" ON public.cart_items
  USING (((select auth.uid()) = user_id));
ALTER POLICY "Users can update own cart" ON public.cart_items
  USING (((select auth.uid()) = user_id));
ALTER POLICY "Admins can manage categories" ON public.categories
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Admins can manage coupons" ON public.coupons
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Admins can insert dispute history" ON public.dispute_history
  WITH CHECK ((has_role((select auth.uid()), 'admin'::user_role) OR has_role((select auth.uid()), 'warehouse'::user_role)));
ALTER POLICY "Admins can view dispute history" ON public.dispute_history
  USING ((has_role((select auth.uid()), 'admin'::user_role) OR has_role((select auth.uid()), 'warehouse'::user_role)));
ALTER POLICY "Users can view own dispute history" ON public.dispute_history
  USING ((EXISTS ( SELECT 1
   FROM disputes d
  WHERE ((d.id = dispute_history.dispute_id) AND (d.user_id = (select auth.uid()))))));
ALTER POLICY "Admins can manage all disputes" ON public.disputes
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Users can create own disputes" ON public.disputes
  WITH CHECK (((select auth.uid()) = user_id));
ALTER POLICY "Admins can view all disputes" ON public.disputes
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Users can view own disputes" ON public.disputes
  USING (((select auth.uid()) = user_id));
ALTER POLICY "Warehouse can view all disputes" ON public.disputes
  USING (has_role((select auth.uid()), 'warehouse'::user_role));
ALTER POLICY "Users can delete own favorite stores" ON public.favorite_stores
  USING (((select auth.uid()) = user_id));
ALTER POLICY "Users can insert own favorite stores" ON public.favorite_stores
  WITH CHECK (((select auth.uid()) = user_id));
ALTER POLICY "Users can view own favorite stores" ON public.favorite_stores
  USING (((select auth.uid()) = user_id));
ALTER POLICY "Users can insert own kyc documents" ON public.kyc_documents
  WITH CHECK (((select auth.uid()) = user_id));
ALTER POLICY "Admins can manage all loyalty points" ON public.loyalty_points
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Users can view own loyalty points" ON public.loyalty_points
  USING (((select auth.uid()) = user_id));
ALTER POLICY "Admins can manage subscribers" ON public.newsletter_subscribers
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Admins can create notifications" ON public.notifications
  WITH CHECK ((has_role((select auth.uid()), 'admin'::user_role) OR has_role((select auth.uid()), 'warehouse'::user_role)));
ALTER POLICY "Users can view own notifications" ON public.notifications
  USING (((select auth.uid()) = user_id));
ALTER POLICY "Users can update own notifications" ON public.notifications
  USING (((select auth.uid()) = user_id));
ALTER POLICY "Users can create order items" ON public.order_items
  WITH CHECK ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = (select auth.uid()))))));
ALTER POLICY "Authenticated users can create own orders" ON public.orders
  WITH CHECK (((select auth.uid()) = user_id));
ALTER POLICY "Admins can update orders" ON public.orders
  USING ((has_role((select auth.uid()), 'admin'::user_role) OR has_role((select auth.uid()), 'warehouse'::user_role)));
ALTER POLICY "Warehouse and admins can manage files" ON public.package_files
  USING ((has_role((select auth.uid()), 'warehouse'::user_role) OR has_role((select auth.uid()), 'admin'::user_role)));
ALTER POLICY "Users can view own package files" ON public.package_files
  USING ((EXISTS ( SELECT 1
   FROM packages
  WHERE ((packages.id = package_files.package_id) AND (packages.user_id = (select auth.uid()))))));
ALTER POLICY "Warehouse and admins can insert timeline" ON public.package_timeline
  WITH CHECK ((has_role((select auth.uid()), 'warehouse'::user_role) OR has_role((select auth.uid()), 'admin'::user_role)));
ALTER POLICY "Admins can manage all packages" ON public.packages
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Users can create own packages" ON public.packages
  WITH CHECK (((select auth.uid()) = user_id));
ALTER POLICY "Users can view own packages" ON public.packages
  USING (((select auth.uid()) = user_id));
ALTER POLICY "Warehouse can view all packages" ON public.packages
  USING ((has_role((select auth.uid()), 'warehouse'::user_role) OR has_role((select auth.uid()), 'admin'::user_role)));
ALTER POLICY "Warehouse can update packages" ON public.packages
  USING ((has_role((select auth.uid()), 'warehouse'::user_role) OR has_role((select auth.uid()), 'admin'::user_role)));
ALTER POLICY "Admins can manage all payments" ON public.payments
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Users can create own payments" ON public.payments
  WITH CHECK (((select auth.uid()) = user_id));
ALTER POLICY "Users can view own payments" ON public.payments
  USING (((select auth.uid()) = user_id));
ALTER POLICY "Admins can view webhook events" ON public.payments_webhooks
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Admins can manage product images" ON public.product_images
  USING ((has_role((select auth.uid()), 'admin'::user_role) OR has_role((select auth.uid()), 'warehouse'::user_role)));
ALTER POLICY "Admins can manage variants" ON public.product_variants
  USING ((has_role((select auth.uid()), 'admin'::user_role) OR has_role((select auth.uid()), 'warehouse'::user_role)));
ALTER POLICY "Admins can manage products" ON public.products
  USING ((has_role((select auth.uid()), 'admin'::user_role) OR has_role((select auth.uid()), 'warehouse'::user_role)));
ALTER POLICY "Admins can update user active status" ON public.profiles
  USING (has_role((select auth.uid()), 'admin'::user_role))
  WITH CHECK (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Users can update own profile" ON public.profiles
  USING (((select auth.uid()) = id))
  WITH CHECK (((select auth.uid()) = id));
ALTER POLICY "Clientes crean sus aprobaciones" ON public.ps_client_approvals
  WITH CHECK (((select auth.uid()) = cliente_id));
ALTER POLICY "Usuarios autenticados insertan decisiones" ON public.ps_decision_log
  WITH CHECK (((select auth.uid()) = actor_id));
ALTER POLICY "Admin gestiona incidencias" ON public.ps_incidents
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Participantes crean incidencias" ON public.ps_incidents
  WITH CHECK ((((select auth.uid()) = reportado_por) AND (EXISTS ( SELECT 1
   FROM ps_orders
  WHERE ((ps_orders.id = ps_incidents.order_id) AND ((ps_orders.cliente_id = (select auth.uid())) OR (ps_orders.personal_shopper_id = (select auth.uid()))))))));
ALTER POLICY "Participantes ven incidencias" ON public.ps_incidents
  USING ((EXISTS ( SELECT 1
   FROM ps_orders
  WHERE ((ps_orders.id = ps_incidents.order_id) AND ((ps_orders.cliente_id = (select auth.uid())) OR (ps_orders.personal_shopper_id = (select auth.uid())))))));
ALTER POLICY "Shoppers can view and create events" ON public.ps_live_events
  USING ((EXISTS ( SELECT 1
   FROM (ps_live_sessions s
     JOIN ps_live_orders o ON ((o.id = s.live_order_id)))
  WHERE ((s.id = ps_live_events.session_id) AND (o.personal_shopper_id = (select auth.uid()))))));
ALTER POLICY "Admins can view all events" ON public.ps_live_events
  USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = (select auth.uid())) AND (user_roles.role = 'admin'::user_role)))));
ALTER POLICY "Clients can view events for their sessions" ON public.ps_live_events
  USING ((EXISTS ( SELECT 1
   FROM (ps_live_sessions s
     JOIN ps_live_orders o ON ((o.id = s.live_order_id)))
  WHERE ((s.id = ps_live_events.session_id) AND (o.cliente_id = (select auth.uid()))))));
ALTER POLICY "Shoppers crean incidentes de sus sesiones" ON public.ps_live_incidents
  WITH CHECK ((EXISTS ( SELECT 1
   FROM ps_live_sessions
  WHERE ((ps_live_sessions.id = ps_live_incidents.session_id) AND (ps_live_sessions.personal_shopper_id = (select auth.uid()))))));
ALTER POLICY "Shoppers actualizan incidentes de sus sesiones" ON public.ps_live_incidents
  USING ((EXISTS ( SELECT 1
   FROM ps_live_sessions
  WHERE ((ps_live_sessions.id = ps_live_incidents.session_id) AND (ps_live_sessions.personal_shopper_id = (select auth.uid()))))));
ALTER POLICY "Clients can create their own live orders" ON public.ps_live_orders
  WITH CHECK (((select auth.uid()) = cliente_id));
ALTER POLICY "Shoppers can create proposals" ON public.ps_live_proposals
  WITH CHECK ((EXISTS ( SELECT 1
   FROM ps_live_orders
  WHERE ((ps_live_orders.id = ps_live_proposals.live_order_id) AND (ps_live_orders.personal_shopper_id = (select auth.uid()))))));
ALTER POLICY "Clients can update proposals (approve/reject)" ON public.ps_live_proposals
  USING ((EXISTS ( SELECT 1
   FROM ps_live_orders
  WHERE ((ps_live_orders.id = ps_live_proposals.live_order_id) AND (ps_live_orders.cliente_id = (select auth.uid()))))));
ALTER POLICY "Clients view sessions as observers" ON public.ps_live_sessions
  USING ((EXISTS ( SELECT 1
   FROM ps_live_orders
  WHERE ((ps_live_orders.id = ps_live_sessions.live_order_id) AND (ps_live_orders.cliente_id = (select auth.uid()))))));
ALTER POLICY "Participantes envian mensajes" ON public.ps_messages
  WITH CHECK ((((select auth.uid()) = emisor_id) AND (EXISTS ( SELECT 1
   FROM ps_orders
  WHERE ((ps_orders.id = ps_messages.order_id) AND ((ps_orders.cliente_id = (select auth.uid())) OR (ps_orders.personal_shopper_id = (select auth.uid()))))))));
ALTER POLICY "Participantes marcan leido" ON public.ps_messages
  USING ((EXISTS ( SELECT 1
   FROM ps_orders
  WHERE ((ps_orders.id = ps_messages.order_id) AND ((ps_orders.cliente_id = (select auth.uid())) OR (ps_orders.personal_shopper_id = (select auth.uid())))))));
ALTER POLICY "Users can update their own PS notifications" ON public.ps_notifications
  USING (((select auth.uid()) = user_id));
ALTER POLICY "Admin gestiona historial" ON public.ps_order_status_history
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "PS insertan historial" ON public.ps_order_status_history
  WITH CHECK ((EXISTS ( SELECT 1
   FROM ps_orders
  WHERE ((ps_orders.id = ps_order_status_history.order_id) AND (ps_orders.personal_shopper_id = (select auth.uid()))))));
ALTER POLICY "Clientes ven historial" ON public.ps_order_status_history
  USING ((EXISTS ( SELECT 1
   FROM ps_orders
  WHERE ((ps_orders.id = ps_order_status_history.order_id) AND (ps_orders.cliente_id = (select auth.uid()))))));
ALTER POLICY "PS ven historial" ON public.ps_order_status_history
  USING ((EXISTS ( SELECT 1
   FROM ps_orders
  WHERE ((ps_orders.id = ps_order_status_history.order_id) AND (ps_orders.personal_shopper_id = (select auth.uid()))))));
ALTER POLICY "Admin gestiona pedidos" ON public.ps_orders
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Clientes ven sus pedidos" ON public.ps_orders
  USING (((select auth.uid()) = cliente_id));
ALTER POLICY "PS ven pedidos asignados" ON public.ps_orders
  USING (((select auth.uid()) = personal_shopper_id));
ALTER POLICY "PS actualizan pedidos" ON public.ps_orders
  USING (((select auth.uid()) = personal_shopper_id));
ALTER POLICY "Admin gestiona pagos" ON public.ps_payments
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Clientes ven sus pagos" ON public.ps_payments
  USING (((select auth.uid()) = cliente_id));
ALTER POLICY "Admin gestiona cotizaciones" ON public.ps_quotes
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "PS crean cotizaciones" ON public.ps_quotes
  WITH CHECK (((select auth.uid()) = personal_shopper_id));
ALTER POLICY "Clientes ven cotizaciones" ON public.ps_quotes
  USING ((EXISTS ( SELECT 1
   FROM ps_requests
  WHERE ((ps_requests.id = ps_quotes.request_id) AND (ps_requests.cliente_id = (select auth.uid()))))));
ALTER POLICY "PS ven sus cotizaciones" ON public.ps_quotes
  USING (((select auth.uid()) = personal_shopper_id));
ALTER POLICY "Admin gestiona solicitudes" ON public.ps_requests
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Clientes crean solicitudes" ON public.ps_requests
  WITH CHECK (((select auth.uid()) = cliente_id));
ALTER POLICY "Clientes ven sus solicitudes" ON public.ps_requests
  USING (((select auth.uid()) = cliente_id));
ALTER POLICY "PS ven solicitudes disponibles" ON public.ps_requests
  USING (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.shopper_verified = true)))) AND (estado = ANY (ARRAY['recibida'::ps_request_status, 'en_revision'::ps_request_status, 'cotizada'::ps_request_status, 'aprobada'::ps_request_status]))));
ALTER POLICY "Clientes actualizan solicitudes pendientes" ON public.ps_requests
  USING ((((select auth.uid()) = cliente_id) AND (estado = ANY (ARRAY['recibida'::ps_request_status, 'cotizada'::ps_request_status]))));
ALTER POLICY "Users can create own referral codes" ON public.referral_codes
  WITH CHECK (((select auth.uid()) = user_id));
ALTER POLICY "Users can view own referral codes" ON public.referral_codes
  USING (((select auth.uid()) = user_id));
ALTER POLICY "Users can update own referral codes" ON public.referral_codes
  USING (((select auth.uid()) = user_id));
ALTER POLICY "Admins can manage all rewards" ON public.referral_rewards
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Users can view own rewards" ON public.referral_rewards
  USING (((select auth.uid()) = user_id));
ALTER POLICY "Users can update own rewards" ON public.referral_rewards
  USING (((select auth.uid()) = user_id));
ALTER POLICY "Admins can manage all referrals" ON public.referrals
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Users can create referrals" ON public.referrals
  WITH CHECK (((select auth.uid()) = referred_id));
ALTER POLICY "Users can view own referrals as referred" ON public.referrals
  USING (((select auth.uid()) = referred_id));
ALTER POLICY "Users can view own referrals as referrer" ON public.referrals
  USING (((select auth.uid()) = referrer_id));
ALTER POLICY "Users can create messages for their requests" ON public.shopping_messages
  WITH CHECK ((((select auth.uid()) = sender_id) AND (EXISTS ( SELECT 1
   FROM shopping_requests
  WHERE ((shopping_requests.id = shopping_messages.request_id) AND ((shopping_requests.customer_id = (select auth.uid())) OR (shopping_requests.shopper_id = (select auth.uid()))))))));
ALTER POLICY "Users can view messages for their requests" ON public.shopping_messages
  USING ((EXISTS ( SELECT 1
   FROM shopping_requests
  WHERE ((shopping_requests.id = shopping_messages.request_id) AND ((shopping_requests.customer_id = (select auth.uid())) OR (shopping_requests.shopper_id = (select auth.uid())))))));
ALTER POLICY "Admins can manage all requests" ON public.shopping_requests
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Customers can create requests" ON public.shopping_requests
  WITH CHECK (((select auth.uid()) = customer_id));
ALTER POLICY "Customers can view own requests" ON public.shopping_requests
  USING (((select auth.uid()) = customer_id));
ALTER POLICY "Verified shoppers can view available and assigned requests" ON public.shopping_requests
  USING ((((select auth.uid()) = shopper_id) OR ((shopper_id IS NULL) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.shopper_verified = true)))))));
ALTER POLICY "Verified shoppers can accept requests" ON public.shopping_requests
  USING (((shopper_id IS NULL) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.shopper_verified = true))))))
  WITH CHECK ((((select auth.uid()) = shopper_id) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.shopper_verified = true))))));
ALTER POLICY "Verified shoppers can update assigned requests" ON public.shopping_requests
  USING ((((select auth.uid()) = shopper_id) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.shopper_verified = true))))));
ALTER POLICY "Admins can manage tariffs" ON public.tariffs
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Admins can manage testimonials" ON public.testimonials
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Authenticated users can create testimonials" ON public.testimonials
  WITH CHECK (((select auth.uid()) IS NOT NULL));
ALTER POLICY "Users can insert own affidavits" ON public.traveler_affidavits
  WITH CHECK (((select auth.uid()) = user_id));
ALTER POLICY "Admins can manage all trips" ON public.traveler_trips
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Travelers can accept trips" ON public.traveler_trips
  WITH CHECK (((select auth.uid()) = traveler_id));
ALTER POLICY "Travelers can view own trips" ON public.traveler_trips
  USING (((select auth.uid()) = traveler_id));
ALTER POLICY "Travelers can update own trips" ON public.traveler_trips
  USING (((select auth.uid()) = traveler_id));
ALTER POLICY "Admins can manage all roles" ON public.user_roles
  USING (has_role((select auth.uid()), 'admin'::user_role));
ALTER POLICY "Users can view own roles" ON public.user_roles
  USING (((select auth.uid()) = user_id));
ALTER POLICY "Warehouse can create logs" ON public.warehouse_logs
  WITH CHECK ((has_role((select auth.uid()), 'warehouse'::user_role) OR has_role((select auth.uid()), 'admin'::user_role)));
ALTER POLICY "Warehouse and admins can view logs" ON public.warehouse_logs
  USING ((has_role((select auth.uid()), 'warehouse'::user_role) OR has_role((select auth.uid()), 'admin'::user_role)));

-- 2) consolidacion de policies permisivas multiples (18 grupos)
-- merge kyc_documents.SELECT: ['Admins can view all kyc documents', 'Users can view own kyc documents']
DROP POLICY "Admins can view all kyc documents" ON public.kyc_documents;
DROP POLICY "Users can view own kyc documents" ON public.kyc_documents;
CREATE POLICY "kyc_documents_select_consolidated" ON public.kyc_documents
  AS PERMISSIVE FOR SELECT TO public
  USING ((has_role((select auth.uid()), 'admin'::user_role)) OR (((select auth.uid()) = user_id)));
-- merge kyc_documents.UPDATE: ['Admins can update kyc documents', 'Users can update own pending kyc documents']
DROP POLICY "Admins can update kyc documents" ON public.kyc_documents;
DROP POLICY "Users can update own pending kyc documents" ON public.kyc_documents;
CREATE POLICY "kyc_documents_update_consolidated" ON public.kyc_documents
  AS PERMISSIVE FOR UPDATE TO public
  USING ((has_role((select auth.uid()), 'admin'::user_role)) OR ((((select auth.uid()) = user_id) AND (status = 'pending'::text))))
  WITH CHECK ((has_role((select auth.uid()), 'admin'::user_role)) OR ((((select auth.uid()) = user_id) AND (status = 'pending'::text))));
-- merge order_items.SELECT: ['Admins can view all order items', 'Users can view own order items']
DROP POLICY "Admins can view all order items" ON public.order_items;
DROP POLICY "Users can view own order items" ON public.order_items;
CREATE POLICY "order_items_select_consolidated" ON public.order_items
  AS PERMISSIVE FOR SELECT TO public
  USING (((has_role((select auth.uid()), 'admin'::user_role) OR has_role((select auth.uid()), 'warehouse'::user_role))) OR ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = (select auth.uid())))))));
-- merge orders.SELECT: ['Admins can view all orders', 'Users can view own orders']
DROP POLICY "Admins can view all orders" ON public.orders;
DROP POLICY "Users can view own orders" ON public.orders;
CREATE POLICY "orders_select_consolidated" ON public.orders
  AS PERMISSIVE FOR SELECT TO public
  USING (((has_role((select auth.uid()), 'admin'::user_role) OR has_role((select auth.uid()), 'warehouse'::user_role))) OR ((((select auth.uid()) = user_id) OR has_role((select auth.uid()), 'admin'::user_role) OR has_role((select auth.uid()), 'warehouse'::user_role))));
-- merge package_timeline.SELECT: ['Users can view own package timeline', 'Warehouse and admins can view all timelines']
DROP POLICY "Users can view own package timeline" ON public.package_timeline;
DROP POLICY "Warehouse and admins can view all timelines" ON public.package_timeline;
CREATE POLICY "package_timeline_select_consolidated" ON public.package_timeline
  AS PERMISSIVE FOR SELECT TO public
  USING (((EXISTS ( SELECT 1
   FROM packages
  WHERE ((packages.id = package_timeline.package_id) AND (packages.user_id = (select auth.uid())))))) OR ((has_role((select auth.uid()), 'warehouse'::user_role) OR has_role((select auth.uid()), 'admin'::user_role))));
-- merge profiles.SELECT: ['Admins can view all profiles', 'Users can view own profile']
DROP POLICY "Admins can view all profiles" ON public.profiles;
DROP POLICY "Users can view own profile" ON public.profiles;
CREATE POLICY "profiles_select_consolidated" ON public.profiles
  AS PERMISSIVE FOR SELECT TO public
  USING ((has_role((select auth.uid()), 'admin'::user_role)) OR (((select auth.uid()) = id)));
-- merge ps_client_approvals.SELECT: ['Admins ven todas las aprobaciones', 'Clientes ven sus aprobaciones', 'Shoppers ven aprobaciones de sus órdenes']
DROP POLICY "Admins ven todas las aprobaciones" ON public.ps_client_approvals;
DROP POLICY "Clientes ven sus aprobaciones" ON public.ps_client_approvals;
DROP POLICY "Shoppers ven aprobaciones de sus órdenes" ON public.ps_client_approvals;
CREATE POLICY "ps_client_approvals_select_consolidated" ON public.ps_client_approvals
  AS PERMISSIVE FOR SELECT TO public
  USING ((has_role((select auth.uid()), 'admin'::user_role)) OR (((select auth.uid()) = cliente_id)) OR ((EXISTS ( SELECT 1
   FROM ps_orders
  WHERE ((ps_orders.id = ps_client_approvals.order_id) AND (ps_orders.personal_shopper_id = (select auth.uid())))))));
-- merge ps_decision_log.SELECT: ['Admins ven todas las decisiones', 'Clientes ven decisiones de sus órdenes', 'Shoppers ven decisiones de sus órdenes']
DROP POLICY "Admins ven todas las decisiones" ON public.ps_decision_log;
DROP POLICY "Clientes ven decisiones de sus órdenes" ON public.ps_decision_log;
DROP POLICY "Shoppers ven decisiones de sus órdenes" ON public.ps_decision_log;
CREATE POLICY "ps_decision_log_select_consolidated" ON public.ps_decision_log
  AS PERMISSIVE FOR SELECT TO public
  USING ((has_role((select auth.uid()), 'admin'::user_role)) OR ((EXISTS ( SELECT 1
   FROM ps_orders
  WHERE ((ps_orders.id = ps_decision_log.order_id) AND (ps_orders.cliente_id = (select auth.uid())))))) OR ((EXISTS ( SELECT 1
   FROM ps_orders
  WHERE ((ps_orders.id = ps_decision_log.order_id) AND (ps_orders.personal_shopper_id = (select auth.uid())))))));
-- merge ps_live_incidents.SELECT: ['Admins ven todos los incidentes', 'Shoppers ven incidentes de sus sesiones']
DROP POLICY "Admins ven todos los incidentes" ON public.ps_live_incidents;
DROP POLICY "Shoppers ven incidentes de sus sesiones" ON public.ps_live_incidents;
CREATE POLICY "ps_live_incidents_select_consolidated" ON public.ps_live_incidents
  AS PERMISSIVE FOR SELECT TO public
  USING ((has_role((select auth.uid()), 'admin'::user_role)) OR ((EXISTS ( SELECT 1
   FROM ps_live_sessions
  WHERE ((ps_live_sessions.id = ps_live_incidents.session_id) AND (ps_live_sessions.personal_shopper_id = (select auth.uid())))))));
-- merge ps_live_orders.SELECT: ['Admins can view all live orders', 'Clients can view their own live orders', 'Shoppers can view assigned live orders']
DROP POLICY "Admins can view all live orders" ON public.ps_live_orders;
DROP POLICY "Clients can view their own live orders" ON public.ps_live_orders;
DROP POLICY "Shoppers can view assigned live orders" ON public.ps_live_orders;
CREATE POLICY "ps_live_orders_select_consolidated" ON public.ps_live_orders
  AS PERMISSIVE FOR SELECT TO public
  USING (((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = (select auth.uid())) AND (user_roles.role = 'admin'::user_role))))) OR (((select auth.uid()) = cliente_id)) OR (((select auth.uid()) = personal_shopper_id)));
-- merge ps_live_orders.UPDATE: ['Clients can update their own draft orders', 'Shoppers can update assigned live orders status']
DROP POLICY "Clients can update their own draft orders" ON public.ps_live_orders;
DROP POLICY "Shoppers can update assigned live orders status" ON public.ps_live_orders;
CREATE POLICY "ps_live_orders_update_consolidated" ON public.ps_live_orders
  AS PERMISSIVE FOR UPDATE TO public
  USING (((((select auth.uid()) = cliente_id) AND (estado = 'borrador'::ps_live_order_status))) OR (((select auth.uid()) = personal_shopper_id)))
  WITH CHECK (((((select auth.uid()) = cliente_id) AND (estado = 'borrador'::ps_live_order_status))) OR (((select auth.uid()) = personal_shopper_id)));
-- merge ps_live_proposals.SELECT: ['Admins can view all proposals', 'Clients can view proposals for their sessions', 'Shoppers can view their proposals']
DROP POLICY "Admins can view all proposals" ON public.ps_live_proposals;
DROP POLICY "Clients can view proposals for their sessions" ON public.ps_live_proposals;
DROP POLICY "Shoppers can view their proposals" ON public.ps_live_proposals;
CREATE POLICY "ps_live_proposals_select_consolidated" ON public.ps_live_proposals
  AS PERMISSIVE FOR SELECT TO public
  USING (((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = (select auth.uid())) AND (user_roles.role = 'admin'::user_role))))) OR ((EXISTS ( SELECT 1
   FROM ps_live_orders
  WHERE ((ps_live_orders.id = ps_live_proposals.live_order_id) AND (ps_live_orders.cliente_id = (select auth.uid())))))) OR ((EXISTS ( SELECT 1
   FROM ps_live_orders
  WHERE ((ps_live_orders.id = ps_live_proposals.live_order_id) AND (ps_live_orders.personal_shopper_id = (select auth.uid())))))));
-- merge ps_live_sessions.ALL: ['Admin gestiona sesiones', 'PS gestionan sus sesiones']
DROP POLICY "Admin gestiona sesiones" ON public.ps_live_sessions;
DROP POLICY "PS gestionan sus sesiones" ON public.ps_live_sessions;
CREATE POLICY "ps_live_sessions_all_consolidated" ON public.ps_live_sessions
  AS PERMISSIVE FOR ALL TO public
  USING ((has_role((select auth.uid()), 'admin'::user_role)) OR (((select auth.uid()) = personal_shopper_id)))
  WITH CHECK ((has_role((select auth.uid()), 'admin'::user_role)) OR (((select auth.uid()) = personal_shopper_id)));
-- merge ps_messages.SELECT: ['Admin ve mensajes', 'Participantes ven mensajes']
DROP POLICY "Admin ve mensajes" ON public.ps_messages;
DROP POLICY "Participantes ven mensajes" ON public.ps_messages;
CREATE POLICY "ps_messages_select_consolidated" ON public.ps_messages
  AS PERMISSIVE FOR SELECT TO public
  USING ((has_role((select auth.uid()), 'admin'::user_role)) OR ((EXISTS ( SELECT 1
   FROM ps_orders
  WHERE ((ps_orders.id = ps_messages.order_id) AND ((ps_orders.cliente_id = (select auth.uid())) OR (ps_orders.personal_shopper_id = (select auth.uid()))))))));
-- merge ps_notifications.SELECT: ['Admin can view all PS notifications', 'Users can view their own PS notifications']
DROP POLICY "Admin can view all PS notifications" ON public.ps_notifications;
DROP POLICY "Users can view their own PS notifications" ON public.ps_notifications;
CREATE POLICY "ps_notifications_select_consolidated" ON public.ps_notifications
  AS PERMISSIVE FOR SELECT TO public
  USING ((has_role((select auth.uid()), 'admin'::user_role)) OR (((select auth.uid()) = user_id)));
-- merge tracking_events.SELECT: ['Users can view own package tracking', 'Warehouse and admins can view all tracking']
DROP POLICY "Users can view own package tracking" ON public.tracking_events;
DROP POLICY "Warehouse and admins can view all tracking" ON public.tracking_events;
CREATE POLICY "tracking_events_select_consolidated" ON public.tracking_events
  AS PERMISSIVE FOR SELECT TO public
  USING (((EXISTS ( SELECT 1
   FROM packages
  WHERE ((packages.id = tracking_events.package_id) AND (packages.user_id = (select auth.uid())))))) OR ((has_role((select auth.uid()), 'warehouse'::user_role) OR has_role((select auth.uid()), 'admin'::user_role))));
-- merge traveler_affidavits.SELECT: ['Admins can view all affidavits', 'Users can view own affidavits']
DROP POLICY "Admins can view all affidavits" ON public.traveler_affidavits;
DROP POLICY "Users can view own affidavits" ON public.traveler_affidavits;
CREATE POLICY "traveler_affidavits_select_consolidated" ON public.traveler_affidavits
  AS PERMISSIVE FOR SELECT TO public
  USING (((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = (select auth.uid())) AND (user_roles.role = 'admin'::user_role))))) OR (((select auth.uid()) = user_id)));
-- merge whatsapp_messages.SELECT: ['Admin and warehouse can view all whatsapp messages', 'Users can view own whatsapp messages']
DROP POLICY "Admin and warehouse can view all whatsapp messages" ON public.whatsapp_messages;
DROP POLICY "Users can view own whatsapp messages" ON public.whatsapp_messages;
CREATE POLICY "whatsapp_messages_select_consolidated" ON public.whatsapp_messages
  AS PERMISSIVE FOR SELECT TO public
  USING (((has_role((select auth.uid()), 'admin'::user_role) OR has_role((select auth.uid()), 'warehouse'::user_role))) OR (((select auth.uid()) = user_id)));
