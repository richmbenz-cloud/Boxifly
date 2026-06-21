# Auditoría de sincronización de esquema — 2026-06-21

Estado de los dos proyectos Supabase comparado contra el código del repo
(`src/integrations/supabase/types.ts` + `supabase/migrations/`).

## Resumen

| | PROD (Boxifly) | STAGING (Boxifly Staging) | Código (repo) |
|---|---|---|---|
| Tablas `public` | **6** | **50** | espera **~50** |
| Coincide con el código | ❌ No | ✅ Sí | — |
| `auth.users` reales | 6 | 1 (prueba) | — |
| Datos de negocio | prácticamente vacío | algo de data de prueba | — |
| Tracking de migraciones CLI (`supabase_migrations.schema_migrations`) | ❌ no existe | ❌ no existe | 48 archivos |

## Detalle de divergencia de tablas

- **Comunes (3):** `payments_webhooks`, `profiles`, `user_roles`
- **Solo en PROD (3):** `addresses`, `shipment_events`, `shipments`
- **Solo en STAGING (47):** `b2b_rates`, `cart_items`, `categories`, `coupons`,
  `dispute_history`, `disputes`, `favorite_stores`, `kyc_documents`, `loyalty_points`,
  `newsletter_subscribers`, `notifications`, `order_items`, `orders`, `package_files`,
  `package_timeline`, `packages`, `payments`, `product_images`, `product_variants`,
  `products`, `ps_client_approvals`, `ps_decision_log`, `ps_incidents`, `ps_live_events`,
  `ps_live_incidents`, `ps_live_orders`, `ps_live_proposals`, `ps_live_sessions`,
  `ps_messages`, `ps_notifications`, `ps_order_status_history`, `ps_orders`, `ps_payments`,
  `ps_quotes`, `ps_requests`, `referral_codes`, `referral_rewards`, `referrals`,
  `shopping_messages`, `shopping_requests`, `tariffs`, `testimonials`, `tracking_events`,
  `traveler_affidavits`, `traveler_trips`, `warehouse_logs`, `whatsapp_messages`

## Conclusiones

1. **STAGING es la fuente de verdad**: su esquema coincide con el código y con lo que
   crean las 48 migraciones del repo.
2. **PRODUCCIÓN está incompleta**: le faltan ~44 tablas que el código necesita; la app
   fallaría en prod en cualquier flujo de orders/products/packages/personal shopper.
3. **Las 48 migraciones nunca se aplicaron vía CLI** a ninguno de los dos proyectos
   (no existe la tabla de tracking). Se adoptará el flujo CLI de aquí en adelante.
4. **`config.toml` apuntaba a un proyecto ajeno** (`ivkfyzdsfpcjymlzerxf`, 403). Corregido.

## Plan de remediación

- [x] **Paso 1–2 (no destructivo):** corregir `config.toml` + documentar flujo
      staging→prod (`DEPLOYMENT.md`) y esta auditoría. _(este PR)_
- [ ] **Paso 3 (requiere aprobación — toca PRODUCCIÓN):** reconstruir el esquema de
      producción para que iguale a staging/código aplicando las migraciones versionadas.
      Seguro porque prod no tiene datos de negocio (solo 6 usuarios auth, que se preservan).
- [ ] **Paso 4:** operar siempre con el flujo de promoción documentado.

> Momento ideal para el Paso 3: **ahora**, mientras producción aún no tiene datos reales
> de clientes. El costo y riesgo crecen mucho una vez que haya datos en producción.
