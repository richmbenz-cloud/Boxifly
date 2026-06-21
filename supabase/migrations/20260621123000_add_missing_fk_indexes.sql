-- ============================================================
-- Indices de cobertura para Foreign Keys (P2)
--
-- Resuelve el hallazgo `unindexed_foreign_keys` (25) del Performance
-- Advisor: cada FK sin un indice de cobertura obliga a Postgres a hacer
-- seq scans al verificar/cascadear cambios en la tabla referenciada y
-- penaliza los JOINs por esas columnas.
--
-- Fix: crear un indice B-tree sobre la(s) columna(s) de cada FK.
-- Idempotente (IF NOT EXISTS) y transaction-safe (sin CONCURRENTLY) para
-- que aplique limpio en CI (db reset desde cero) y via Management API.
-- Cambio puramente aditivo: NO altera datos ni semantica.
-- ============================================================

-- FK b2b_rates_user_id_fkey
create index if not exists idx_b2b_rates_user_id on public.b2b_rates (user_id);

-- FK cart_items_product_id_fkey
create index if not exists idx_cart_items_product_id on public.cart_items (product_id);

-- FK kyc_documents_reviewed_by_fkey
create index if not exists idx_kyc_documents_reviewed_by on public.kyc_documents (reviewed_by);

-- FK notifications_package_id_fkey
create index if not exists idx_notifications_package_id on public.notifications (package_id);

-- FK notifications_user_id_fkey
create index if not exists idx_notifications_user_id on public.notifications (user_id);

-- FK order_items_product_id_fkey
create index if not exists idx_order_items_product_id on public.order_items (product_id);

-- FK package_files_package_id_fkey
create index if not exists idx_package_files_package_id on public.package_files (package_id);

-- FK package_files_uploaded_by_fkey
create index if not exists idx_package_files_uploaded_by on public.package_files (uploaded_by);

-- FK package_timeline_package_id_fkey
create index if not exists idx_package_timeline_package_id on public.package_timeline (package_id);

-- FK package_timeline_updated_by_fkey
create index if not exists idx_package_timeline_updated_by on public.package_timeline (updated_by);

-- FK packages_user_id_fkey
create index if not exists idx_packages_user_id on public.packages (user_id);

-- FK payments_package_id_fkey
create index if not exists idx_payments_package_id on public.payments (package_id);

-- FK payments_user_id_fkey
create index if not exists idx_payments_user_id on public.payments (user_id);

-- FK profiles_shopper_verified_by_fkey
create index if not exists idx_profiles_shopper_verified_by on public.profiles (shopper_verified_by);

-- FK profiles_traveler_verified_by_fkey
create index if not exists idx_profiles_traveler_verified_by on public.profiles (traveler_verified_by);

-- FK ps_incidents_reportado_por_fkey
create index if not exists idx_ps_incidents_reportado_por on public.ps_incidents (reportado_por);

-- FK ps_incidents_resuelto_por_fkey
create index if not exists idx_ps_incidents_resuelto_por on public.ps_incidents (resuelto_por);

-- FK ps_live_sessions_live_order_id_fkey
create index if not exists idx_ps_live_sessions_live_order_id on public.ps_live_sessions (live_order_id);

-- FK ps_notifications_order_id_fkey
create index if not exists idx_ps_notifications_order_id on public.ps_notifications (order_id);

-- FK ps_notifications_quote_id_fkey
create index if not exists idx_ps_notifications_quote_id on public.ps_notifications (quote_id);

-- FK ps_notifications_request_id_fkey
create index if not exists idx_ps_notifications_request_id on public.ps_notifications (request_id);

-- FK ps_order_status_history_actualizado_por_fkey
create index if not exists idx_ps_order_status_history_actualizado_por on public.ps_order_status_history (actualizado_por);

-- FK testimonials_product_id_fkey
create index if not exists idx_testimonials_product_id on public.testimonials (product_id);

-- FK warehouse_logs_logged_by_fkey
create index if not exists idx_warehouse_logs_logged_by on public.warehouse_logs (logged_by);

-- FK warehouse_logs_package_id_fkey
create index if not exists idx_warehouse_logs_package_id on public.warehouse_logs (package_id);
