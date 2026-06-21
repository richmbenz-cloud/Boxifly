-- ============================================================
-- Consolidacion de policies permisivas multiples (P5 - parte 2)
--
-- Resuelve `multiple_permissive_policies` descomponiendo las policies
-- cmd=ALL (que aplicaban a TODOS los comandos y solapaban con las
-- policies de comando especifico) en policies POR-COMANDO, y combinando
-- por (tabla, comando, rol) con OR.
--
-- GARANTIA DE EQUIVALENCIA: para cada (tabla, comando, rol concreto) el
-- conjunto de condiciones USING/CHECK aplicables es IDENTICO antes y
-- despues (verificado por matriz de acceso). OR del mismo conjunto de
-- condiciones == como Postgres ya combina policies permisivas en runtime.
-- Mantiene el wrap (select auth.uid()) del fix de initplan.
--
-- Afecta 29 tablas. Cada (rol, accion) queda con exactamente 1 policy.
-- ============================================================

drop policy if exists "Admins can manage B2B rates" on public."b2b_rates";
drop policy if exists "B2B users can view own rates" on public."b2b_rates";
drop policy if exists "Admins can manage categories" on public."categories";
drop policy if exists "Everyone can view active categories" on public."categories";
drop policy if exists "Admins can manage coupons" on public."coupons";
drop policy if exists "Authenticated users can view active coupons" on public."coupons";
drop policy if exists "Admins can insert dispute history" on public."dispute_history";
drop policy if exists "Admins can view dispute history" on public."dispute_history";
drop policy if exists "Users can view own dispute history" on public."dispute_history";
drop policy if exists "Admins can manage all disputes" on public."disputes";
drop policy if exists "Users can create own disputes" on public."disputes";
drop policy if exists "Admins can view all disputes" on public."disputes";
drop policy if exists "Users can view own disputes" on public."disputes";
drop policy if exists "Warehouse can view all disputes" on public."disputes";
drop policy if exists "Admins can manage all loyalty points" on public."loyalty_points";
drop policy if exists "System can insert loyalty points" on public."loyalty_points";
drop policy if exists "Users can view own loyalty points" on public."loyalty_points";
drop policy if exists "Admins can manage subscribers" on public."newsletter_subscribers";
drop policy if exists "Anyone can subscribe with valid email" on public."newsletter_subscribers";
drop policy if exists "Warehouse and admins can manage files" on public."package_files";
drop policy if exists "Users can view own package files" on public."package_files";
drop policy if exists "Admins can manage all packages" on public."packages";
drop policy if exists "Users can create own packages" on public."packages";
drop policy if exists "Users can view own packages" on public."packages";
drop policy if exists "Warehouse can view all packages" on public."packages";
drop policy if exists "Warehouse can update packages" on public."packages";
drop policy if exists "Admins can manage all payments" on public."payments";
drop policy if exists "Users can create own payments" on public."payments";
drop policy if exists "Users can view own payments" on public."payments";
drop policy if exists "Admins can manage product images" on public."product_images";
drop policy if exists "Everyone can view product images" on public."product_images";
drop policy if exists "Admins can manage variants" on public."product_variants";
drop policy if exists "Everyone can view available variants" on public."product_variants";
drop policy if exists "Admins can manage products" on public."products";
drop policy if exists "Everyone can view active products" on public."products";
drop policy if exists "profiles_select_consolidated" on public."profiles";
drop policy if exists "Admins can update user active status" on public."profiles";
drop policy if exists "Users can update own profile" on public."profiles";
drop policy if exists "Admin gestiona incidencias" on public."ps_incidents";
drop policy if exists "Participantes crean incidencias" on public."ps_incidents";
drop policy if exists "Participantes ven incidencias" on public."ps_incidents";
drop policy if exists "Shoppers can view and create events" on public."ps_live_events";
drop policy if exists "Admins can view all events" on public."ps_live_events";
drop policy if exists "Clients can view events for their sessions" on public."ps_live_events";
drop policy if exists "ps_live_sessions_all_consolidated" on public."ps_live_sessions";
drop policy if exists "Authenticated users view active sessions" on public."ps_live_sessions";
drop policy if exists "Clients view sessions as observers" on public."ps_live_sessions";
drop policy if exists "Admin gestiona historial" on public."ps_order_status_history";
drop policy if exists "PS insertan historial" on public."ps_order_status_history";
drop policy if exists "Clientes ven historial" on public."ps_order_status_history";
drop policy if exists "PS ven historial" on public."ps_order_status_history";
drop policy if exists "Admin gestiona pedidos" on public."ps_orders";
drop policy if exists "Clientes ven sus pedidos" on public."ps_orders";
drop policy if exists "PS ven pedidos asignados" on public."ps_orders";
drop policy if exists "PS actualizan pedidos" on public."ps_orders";
drop policy if exists "Admin gestiona pagos" on public."ps_payments";
drop policy if exists "Sistema inserta pagos" on public."ps_payments";
drop policy if exists "Clientes ven sus pagos" on public."ps_payments";
drop policy if exists "Admin gestiona cotizaciones" on public."ps_quotes";
drop policy if exists "PS crean cotizaciones" on public."ps_quotes";
drop policy if exists "Clientes ven cotizaciones" on public."ps_quotes";
drop policy if exists "PS ven sus cotizaciones" on public."ps_quotes";
drop policy if exists "Admin gestiona solicitudes" on public."ps_requests";
drop policy if exists "Clientes crean solicitudes" on public."ps_requests";
drop policy if exists "Clientes ven sus solicitudes" on public."ps_requests";
drop policy if exists "PS ven solicitudes disponibles" on public."ps_requests";
drop policy if exists "Clientes actualizan solicitudes pendientes" on public."ps_requests";
drop policy if exists "Admins can manage all rewards" on public."referral_rewards";
drop policy if exists "System can create rewards" on public."referral_rewards";
drop policy if exists "Users can view own rewards" on public."referral_rewards";
drop policy if exists "Users can update own rewards" on public."referral_rewards";
drop policy if exists "Admins can manage all referrals" on public."referrals";
drop policy if exists "Users can create referrals" on public."referrals";
drop policy if exists "Users can view own referrals as referred" on public."referrals";
drop policy if exists "Users can view own referrals as referrer" on public."referrals";
drop policy if exists "Admins can manage all requests" on public."shopping_requests";
drop policy if exists "Customers can create requests" on public."shopping_requests";
drop policy if exists "Customers can view own requests" on public."shopping_requests";
drop policy if exists "Verified shoppers can view available and assigned requests" on public."shopping_requests";
drop policy if exists "Verified shoppers can accept requests" on public."shopping_requests";
drop policy if exists "Verified shoppers can update assigned requests" on public."shopping_requests";
drop policy if exists "Admins can manage tariffs" on public."tariffs";
drop policy if exists "Everyone can view active tariffs" on public."tariffs";
drop policy if exists "Admins can manage testimonials" on public."testimonials";
drop policy if exists "Authenticated users can create testimonials" on public."testimonials";
drop policy if exists "Everyone can view approved testimonials" on public."testimonials";
drop policy if exists "Admins can manage all trips" on public."traveler_trips";
drop policy if exists "Travelers can accept trips" on public."traveler_trips";
drop policy if exists "Travelers can view own trips" on public."traveler_trips";
drop policy if exists "Travelers can update own trips" on public."traveler_trips";
drop policy if exists "Admins can manage all roles" on public."user_roles";
drop policy if exists "Users can view own roles" on public."user_roles";

create policy "b2b_rates_delete_all" on public."b2b_rates" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "b2b_rates_insert_all" on public."b2b_rates" as permissive for insert to public
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "b2b_rates_select_all" on public."b2b_rates" as permissive for select to public
  using (((( SELECT auth.uid() AS uid) = user_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "b2b_rates_update_all" on public."b2b_rates" as permissive for update to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "categories_delete_all" on public."categories" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "categories_insert_all" on public."categories" as permissive for insert to public
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "categories_select_all" on public."categories" as permissive for select to public
  using (((is_active = true)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "categories_update_all" on public."categories" as permissive for update to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "coupons_delete_all" on public."coupons" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "coupons_insert_all" on public."coupons" as permissive for insert to public
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "coupons_select_anon_svc" on public."coupons" as permissive for select to anon, service_role
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "coupons_select_auth" on public."coupons" as permissive for select to authenticated
  using ((((is_active = true) AND ((expires_at IS NULL) OR (expires_at > now())))) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "coupons_update_all" on public."coupons" as permissive for update to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "dispute_history_insert_all" on public."dispute_history" as permissive for insert to public
  with check ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role)));

create policy "dispute_history_select_anon_svc" on public."dispute_history" as permissive for select to anon, service_role
  using ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role)));

create policy "dispute_history_select_auth" on public."dispute_history" as permissive for select to authenticated
  using (((EXISTS ( SELECT 1
   FROM disputes d
  WHERE ((d.id = dispute_history.dispute_id) AND (d.user_id = ( SELECT auth.uid() AS uid)))))) OR ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role))));

create policy "disputes_delete_all" on public."disputes" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "disputes_insert_all" on public."disputes" as permissive for insert to public
  with check (((( SELECT auth.uid() AS uid) = user_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "disputes_select_all" on public."disputes" as permissive for select to public
  using (((( SELECT auth.uid() AS uid) = user_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)) OR (has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role)));

create policy "disputes_update_all" on public."disputes" as permissive for update to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "loyalty_points_delete_all" on public."loyalty_points" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "loyalty_points_insert_anon_auth" on public."loyalty_points" as permissive for insert to anon, authenticated
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "loyalty_points_insert_svc" on public."loyalty_points" as permissive for insert to service_role
  with check ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)) OR (true));

create policy "loyalty_points_select_all" on public."loyalty_points" as permissive for select to public
  using (((( SELECT auth.uid() AS uid) = user_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "loyalty_points_update_all" on public."loyalty_points" as permissive for update to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "newsletter_subscribers_delete_all" on public."newsletter_subscribers" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "newsletter_subscribers_insert_anon_auth" on public."newsletter_subscribers" as permissive for insert to anon, authenticated
  with check ((((email IS NOT NULL) AND (length(TRIM(BOTH FROM email)) > 3) AND (email ~~ '%@%'::text))) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "newsletter_subscribers_insert_svc" on public."newsletter_subscribers" as permissive for insert to service_role
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "newsletter_subscribers_select_all" on public."newsletter_subscribers" as permissive for select to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "newsletter_subscribers_update_all" on public."newsletter_subscribers" as permissive for update to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "package_files_delete_all" on public."package_files" as permissive for delete to public
  using ((has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "package_files_insert_all" on public."package_files" as permissive for insert to public
  with check ((has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "package_files_select_all" on public."package_files" as permissive for select to public
  using (((EXISTS ( SELECT 1
   FROM packages
  WHERE ((packages.id = package_files.package_id) AND (packages.user_id = ( SELECT auth.uid() AS uid)))))) OR ((has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))));

create policy "package_files_update_all" on public."package_files" as permissive for update to public
  using ((has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)))
  with check ((has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "packages_delete_all" on public."packages" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "packages_insert_all" on public."packages" as permissive for insert to public
  with check (((( SELECT auth.uid() AS uid) = user_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "packages_select_all" on public."packages" as permissive for select to public
  using (((( SELECT auth.uid() AS uid) = user_id)) OR ((has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "packages_update_all" on public."packages" as permissive for update to public
  using (((has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)))
  with check (((has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "payments_delete_all" on public."payments" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "payments_insert_all" on public."payments" as permissive for insert to public
  with check (((( SELECT auth.uid() AS uid) = user_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "payments_select_all" on public."payments" as permissive for select to public
  using (((( SELECT auth.uid() AS uid) = user_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "payments_update_all" on public."payments" as permissive for update to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "product_images_delete_all" on public."product_images" as permissive for delete to public
  using ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role)));

create policy "product_images_insert_all" on public."product_images" as permissive for insert to public
  with check ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role)));

create policy "product_images_select_all" on public."product_images" as permissive for select to public
  using (((EXISTS ( SELECT 1
   FROM products
  WHERE ((products.id = product_images.product_id) AND (products.is_active = true))))) OR ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role))));

create policy "product_images_update_all" on public."product_images" as permissive for update to public
  using ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role)))
  with check ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role)));

create policy "product_variants_delete_all" on public."product_variants" as permissive for delete to public
  using ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role)));

create policy "product_variants_insert_all" on public."product_variants" as permissive for insert to public
  with check ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role)));

create policy "product_variants_select_all" on public."product_variants" as permissive for select to public
  using (((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role))) OR ((is_available = true)));

create policy "product_variants_update_all" on public."product_variants" as permissive for update to public
  using ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role)))
  with check ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role)));

create policy "products_delete_all" on public."products" as permissive for delete to public
  using ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role)));

create policy "products_insert_all" on public."products" as permissive for insert to public
  with check ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role)));

create policy "products_select_all" on public."products" as permissive for select to public
  using (((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role))) OR ((is_active = true)));

create policy "products_update_all" on public."products" as permissive for update to public
  using ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role)))
  with check ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR has_role(( SELECT auth.uid() AS uid), 'warehouse'::user_role)));

create policy "profiles_select_all" on public."profiles" as permissive for select to public
  using ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR (( SELECT auth.uid() AS uid) = id)));

create policy "profiles_update_anon_svc" on public."profiles" as permissive for update to anon, service_role
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "profiles_update_auth" on public."profiles" as permissive for update to authenticated
  using (((( SELECT auth.uid() AS uid) = id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)))
  with check (((( SELECT auth.uid() AS uid) = id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "ps_incidents_delete_all" on public."ps_incidents" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "ps_incidents_insert_all" on public."ps_incidents" as permissive for insert to public
  with check ((((( SELECT auth.uid() AS uid) = reportado_por) AND (EXISTS ( SELECT 1
   FROM ps_orders
  WHERE ((ps_orders.id = ps_incidents.order_id) AND ((ps_orders.cliente_id = ( SELECT auth.uid() AS uid)) OR (ps_orders.personal_shopper_id = ( SELECT auth.uid() AS uid)))))))) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "ps_incidents_select_all" on public."ps_incidents" as permissive for select to public
  using (((EXISTS ( SELECT 1
   FROM ps_orders
  WHERE ((ps_orders.id = ps_incidents.order_id) AND ((ps_orders.cliente_id = ( SELECT auth.uid() AS uid)) OR (ps_orders.personal_shopper_id = ( SELECT auth.uid() AS uid))))))) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "ps_incidents_update_all" on public."ps_incidents" as permissive for update to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "ps_live_events_delete_all" on public."ps_live_events" as permissive for delete to public
  using ((EXISTS ( SELECT 1
   FROM (ps_live_sessions s
     JOIN ps_live_orders o ON ((o.id = s.live_order_id)))
  WHERE ((s.id = ps_live_events.session_id) AND (o.personal_shopper_id = ( SELECT auth.uid() AS uid))))));

create policy "ps_live_events_insert_all" on public."ps_live_events" as permissive for insert to public
  with check ((EXISTS ( SELECT 1
   FROM (ps_live_sessions s
     JOIN ps_live_orders o ON ((o.id = s.live_order_id)))
  WHERE ((s.id = ps_live_events.session_id) AND (o.personal_shopper_id = ( SELECT auth.uid() AS uid))))));

create policy "ps_live_events_select_all" on public."ps_live_events" as permissive for select to public
  using (((EXISTS ( SELECT 1
   FROM (ps_live_sessions s
     JOIN ps_live_orders o ON ((o.id = s.live_order_id)))
  WHERE ((s.id = ps_live_events.session_id) AND (o.cliente_id = ( SELECT auth.uid() AS uid)))))) OR ((EXISTS ( SELECT 1
   FROM (ps_live_sessions s
     JOIN ps_live_orders o ON ((o.id = s.live_order_id)))
  WHERE ((s.id = ps_live_events.session_id) AND (o.personal_shopper_id = ( SELECT auth.uid() AS uid)))))) OR ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.role = 'admin'::user_role))))));

create policy "ps_live_events_update_all" on public."ps_live_events" as permissive for update to public
  using ((EXISTS ( SELECT 1
   FROM (ps_live_sessions s
     JOIN ps_live_orders o ON ((o.id = s.live_order_id)))
  WHERE ((s.id = ps_live_events.session_id) AND (o.personal_shopper_id = ( SELECT auth.uid() AS uid))))))
  with check ((EXISTS ( SELECT 1
   FROM (ps_live_sessions s
     JOIN ps_live_orders o ON ((o.id = s.live_order_id)))
  WHERE ((s.id = ps_live_events.session_id) AND (o.personal_shopper_id = ( SELECT auth.uid() AS uid))))));

create policy "ps_live_sessions_delete_all" on public."ps_live_sessions" as permissive for delete to public
  using ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR (( SELECT auth.uid() AS uid) = personal_shopper_id)));

create policy "ps_live_sessions_insert_all" on public."ps_live_sessions" as permissive for insert to public
  with check ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR (( SELECT auth.uid() AS uid) = personal_shopper_id)));

create policy "ps_live_sessions_select_anon_svc" on public."ps_live_sessions" as permissive for select to anon, service_role
  using (((EXISTS ( SELECT 1
   FROM ps_live_orders
  WHERE ((ps_live_orders.id = ps_live_sessions.live_order_id) AND (ps_live_orders.cliente_id = ( SELECT auth.uid() AS uid)))))) OR ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR (( SELECT auth.uid() AS uid) = personal_shopper_id))));

create policy "ps_live_sessions_select_auth" on public."ps_live_sessions" as permissive for select to authenticated
  using (((EXISTS ( SELECT 1
   FROM ps_live_orders
  WHERE ((ps_live_orders.id = ps_live_sessions.live_order_id) AND (ps_live_orders.cliente_id = ( SELECT auth.uid() AS uid)))))) OR ((estado = ANY (ARRAY['programada'::ps_live_status, 'en_vivo'::ps_live_status]))) OR ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR (( SELECT auth.uid() AS uid) = personal_shopper_id))));

create policy "ps_live_sessions_update_all" on public."ps_live_sessions" as permissive for update to public
  using ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR (( SELECT auth.uid() AS uid) = personal_shopper_id)))
  with check ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role) OR (( SELECT auth.uid() AS uid) = personal_shopper_id)));

create policy "ps_order_status_history_delete_all" on public."ps_order_status_history" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "ps_order_status_history_insert_all" on public."ps_order_status_history" as permissive for insert to public
  with check (((EXISTS ( SELECT 1
   FROM ps_orders
  WHERE ((ps_orders.id = ps_order_status_history.order_id) AND (ps_orders.personal_shopper_id = ( SELECT auth.uid() AS uid)))))) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "ps_order_status_history_select_all" on public."ps_order_status_history" as permissive for select to public
  using (((EXISTS ( SELECT 1
   FROM ps_orders
  WHERE ((ps_orders.id = ps_order_status_history.order_id) AND (ps_orders.cliente_id = ( SELECT auth.uid() AS uid)))))) OR ((EXISTS ( SELECT 1
   FROM ps_orders
  WHERE ((ps_orders.id = ps_order_status_history.order_id) AND (ps_orders.personal_shopper_id = ( SELECT auth.uid() AS uid)))))) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "ps_order_status_history_update_all" on public."ps_order_status_history" as permissive for update to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "ps_orders_delete_all" on public."ps_orders" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "ps_orders_insert_all" on public."ps_orders" as permissive for insert to public
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "ps_orders_select_all" on public."ps_orders" as permissive for select to public
  using (((( SELECT auth.uid() AS uid) = cliente_id)) OR ((( SELECT auth.uid() AS uid) = personal_shopper_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "ps_orders_update_all" on public."ps_orders" as permissive for update to public
  using (((( SELECT auth.uid() AS uid) = personal_shopper_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)))
  with check (((( SELECT auth.uid() AS uid) = personal_shopper_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "ps_payments_delete_all" on public."ps_payments" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "ps_payments_insert_anon_auth" on public."ps_payments" as permissive for insert to anon, authenticated
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "ps_payments_insert_svc" on public."ps_payments" as permissive for insert to service_role
  with check ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)) OR (true));

create policy "ps_payments_select_all" on public."ps_payments" as permissive for select to public
  using (((( SELECT auth.uid() AS uid) = cliente_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "ps_payments_update_all" on public."ps_payments" as permissive for update to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "ps_quotes_delete_all" on public."ps_quotes" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "ps_quotes_insert_all" on public."ps_quotes" as permissive for insert to public
  with check (((( SELECT auth.uid() AS uid) = personal_shopper_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "ps_quotes_select_all" on public."ps_quotes" as permissive for select to public
  using (((( SELECT auth.uid() AS uid) = personal_shopper_id)) OR ((EXISTS ( SELECT 1
   FROM ps_requests
  WHERE ((ps_requests.id = ps_quotes.request_id) AND (ps_requests.cliente_id = ( SELECT auth.uid() AS uid)))))) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "ps_quotes_update_all" on public."ps_quotes" as permissive for update to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "ps_requests_delete_all" on public."ps_requests" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "ps_requests_insert_all" on public."ps_requests" as permissive for insert to public
  with check (((( SELECT auth.uid() AS uid) = cliente_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "ps_requests_select_all" on public."ps_requests" as permissive for select to public
  using (((( SELECT auth.uid() AS uid) = cliente_id)) OR (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.shopper_verified = true)))) AND (estado = ANY (ARRAY['recibida'::ps_request_status, 'en_revision'::ps_request_status, 'cotizada'::ps_request_status, 'aprobada'::ps_request_status])))) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "ps_requests_update_all" on public."ps_requests" as permissive for update to public
  using ((((( SELECT auth.uid() AS uid) = cliente_id) AND (estado = ANY (ARRAY['recibida'::ps_request_status, 'cotizada'::ps_request_status])))) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)))
  with check ((((( SELECT auth.uid() AS uid) = cliente_id) AND (estado = ANY (ARRAY['recibida'::ps_request_status, 'cotizada'::ps_request_status])))) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "referral_rewards_delete_all" on public."referral_rewards" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "referral_rewards_insert_anon_auth" on public."referral_rewards" as permissive for insert to anon, authenticated
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "referral_rewards_insert_svc" on public."referral_rewards" as permissive for insert to service_role
  with check ((has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)) OR (true));

create policy "referral_rewards_select_all" on public."referral_rewards" as permissive for select to public
  using (((( SELECT auth.uid() AS uid) = user_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "referral_rewards_update_all" on public."referral_rewards" as permissive for update to public
  using (((( SELECT auth.uid() AS uid) = user_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)))
  with check (((( SELECT auth.uid() AS uid) = user_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "referrals_delete_all" on public."referrals" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "referrals_insert_all" on public."referrals" as permissive for insert to public
  with check (((( SELECT auth.uid() AS uid) = referred_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "referrals_select_all" on public."referrals" as permissive for select to public
  using (((( SELECT auth.uid() AS uid) = referred_id)) OR ((( SELECT auth.uid() AS uid) = referrer_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "referrals_update_all" on public."referrals" as permissive for update to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "shopping_requests_delete_all" on public."shopping_requests" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "shopping_requests_insert_all" on public."shopping_requests" as permissive for insert to public
  with check (((( SELECT auth.uid() AS uid) = customer_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "shopping_requests_select_anon_svc" on public."shopping_requests" as permissive for select to anon, service_role
  using (((( SELECT auth.uid() AS uid) = customer_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "shopping_requests_select_auth" on public."shopping_requests" as permissive for select to authenticated
  using (((( SELECT auth.uid() AS uid) = customer_id)) OR (((( SELECT auth.uid() AS uid) = shopper_id) OR ((shopper_id IS NULL) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.shopper_verified = true))))))) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "shopping_requests_update_anon_svc" on public."shopping_requests" as permissive for update to anon, service_role
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "shopping_requests_update_auth" on public."shopping_requests" as permissive for update to authenticated
  using ((((( SELECT auth.uid() AS uid) = shopper_id) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.shopper_verified = true)))))) OR (((shopper_id IS NULL) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.shopper_verified = true)))))) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)))
  with check ((((( SELECT auth.uid() AS uid) = shopper_id) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.shopper_verified = true)))))) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "tariffs_delete_all" on public."tariffs" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "tariffs_insert_all" on public."tariffs" as permissive for insert to public
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "tariffs_select_all" on public."tariffs" as permissive for select to public
  using (((is_active = true)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "tariffs_update_all" on public."tariffs" as permissive for update to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "testimonials_delete_all" on public."testimonials" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "testimonials_insert_anon_svc" on public."testimonials" as permissive for insert to anon, service_role
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "testimonials_insert_auth" on public."testimonials" as permissive for insert to authenticated
  with check (((( SELECT auth.uid() AS uid) IS NOT NULL)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "testimonials_select_all" on public."testimonials" as permissive for select to public
  using (((is_approved = true)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "testimonials_update_all" on public."testimonials" as permissive for update to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "traveler_trips_delete_all" on public."traveler_trips" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "traveler_trips_insert_all" on public."traveler_trips" as permissive for insert to public
  with check (((( SELECT auth.uid() AS uid) = traveler_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "traveler_trips_select_all" on public."traveler_trips" as permissive for select to public
  using (((( SELECT auth.uid() AS uid) = traveler_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "traveler_trips_update_all" on public."traveler_trips" as permissive for update to public
  using (((( SELECT auth.uid() AS uid) = traveler_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)))
  with check (((( SELECT auth.uid() AS uid) = traveler_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "user_roles_delete_all" on public."user_roles" as permissive for delete to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "user_roles_insert_all" on public."user_roles" as permissive for insert to public
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));

create policy "user_roles_select_all" on public."user_roles" as permissive for select to public
  using (((( SELECT auth.uid() AS uid) = user_id)) OR (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role)));

create policy "user_roles_update_all" on public."user_roles" as permissive for update to public
  using (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role))
  with check (has_role(( SELECT auth.uid() AS uid), 'admin'::user_role));
