# Memory: features/personal-shopper/notification-system
Updated: now

The Personal Shopper real-time notification system provides in-app alerts for clients, shoppers, and admins without external channels (WhatsApp, email).

## Database Structure
- `ps_notifications` table with columns: id, user_id, tipo, titulo, mensaje, request_id, order_id, quote_id, metadata, is_read, created_at
- Types: nueva_solicitud, cotizacion_creada, cotizacion_modificada, cotizacion_aceptada, cotizacion_rechazada, cambio_estado, aprobacion_requerida, mensaje_nuevo, recordatorio
- RLS policies for user-specific access and admin oversight
- Supabase Realtime enabled for instant updates

## Automatic Triggers
1. `trg_notify_quote_created`: Notifies client when a new quote is created (pendiente state)
2. `trg_notify_quote_response`: Notifies shopper when quote is accepted/rejected
3. `trg_notify_order_status_change`: Notifies client on every order status change, shopper on key states (aprobado_cliente, entregado)
4. `trg_notify_admin_new_request`: Notifies first admin when new PS request is created

## Frontend Components
- `usePSNotifications` hook: Fetches notifications, manages realtime subscription, provides markAsRead/markAllAsRead functions
- `PSNotificationBell` component: Bell icon with unread badge, popover with notification list, click-to-navigate
- Integrated into: CustomerPSDashboard, ShopperDashboard, PersonalShopperAdmin

## Key Features
- Real-time toast notifications on new entries
- Color-coded notification types with icons
- Relative timestamps (date-fns)
- Click to navigate to relevant request/order
- Mark as read individually or all at once
