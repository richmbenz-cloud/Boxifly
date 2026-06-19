# 📦 Auto-sincronización de tracking (Aftership → estado → WhatsApp)

Hace que el **estado del paquete avance solo** según lo que reporta el
transportista, sin intervención manual. Al cambiar el estado se disparan
automáticamente la notificación in-app y el **WhatsApp** (Pilar #1).

```
pg_cron (cada 2h)
    ↓ pg_net.http_post
Edge Function  sync-tracking
    ↓ consulta Aftership
UPDATE packages.current_status   (solo avanza, nunca retrocede)
    ↓ triggers existentes
notificación in-app  +  WhatsApp 📲
```

## Qué tramos automatiza

| Tramo | Tracking usado | Aftership → estado Boxifly |
|-------|----------------|----------------------------|
| Entrante (USA → warehouse Miami) | `external_tracking` / `tracking_number` | `Delivered` → **`received_warehouse`** |
| Internacional (Miami → Perú) | `international_tracking` | `InTransit`/`OutForDelivery` → **`in_transit`** · `Delivered`/`AvailableForPickup` → **`arrived_peru`** |

> Los estados internos del warehouse (`ready_consolidation`, `consolidated`,
> `ready_delivery`, `delivered`) **siguen siendo manuales** — son decisiones
> operativas que el carrier no conoce. El sync **nunca retrocede** un estado.

## ✅ Pasos para activarlo

### 1. Desplegar
```bash
supabase functions deploy sync-tracking
supabase db push          # habilita pg_cron/pg_net y programa el job
```

### 2. Configurar el secreto de Aftership
```bash
supabase secrets set AFTERSHIP_API_KEY="<tu-api-key-de-aftership>"
```

### 3. Decirle al cron a qué URL llamar
```sql
ALTER DATABASE postgres
  SET app.sync_tracking_url = 'https://<proj>.supabase.co/functions/v1/sync-tracking';
-- app.service_role_key ya debería estar seteado (Pilar #1). Si no:
ALTER DATABASE postgres
  SET app.service_role_key = '<SERVICE_ROLE_KEY>';
```

### 4. (Opcional) Ajustar la frecuencia
Por defecto corre **cada 2 horas** (`0 */2 * * *`). Para cambiarla:
```sql
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'sync-tracking-every-2h';
SELECT cron.schedule('sync-tracking-every-2h', '*/30 * * * *', $$ ... $$); -- ej. cada 30 min
```

## 🧪 Probar manualmente
Forzar la sincronización de un paquete (sin esperar al cron):
```bash
curl -X POST 'https://<proj>.supabase.co/functions/v1/sync-tracking' \
  -H 'Authorization: Bearer <SERVICE_ROLE_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"packageId":"<uuid-del-paquete>"}'
```
O en lote (todos los paquetes en movimiento): mismo `curl` con `-d '{}'`.

## 🔍 Depurar
```bash
supabase functions logs sync-tracking
```
```sql
-- Ejecuciones del cron:
SELECT * FROM cron.job_run_details WHERE jobid =
  (SELECT jobid FROM cron.job WHERE jobname = 'sync-tracking-every-2h')
ORDER BY start_time DESC LIMIT 10;

-- Respuestas HTTP de pg_net:
SELECT * FROM net._http_response ORDER BY created DESC LIMIT 20;
```

## Notas
- **Idempotente y reversible:** la migración re-programa el job de forma segura.
- **Degradación segura:** si no configuras `app.sync_tracking_url`, el cron no
  hace nada; si falta `AFTERSHIP_API_KEY`, la función responde 500 sin tocar datos.
- Reutiliza la tabla `tracking_events` (historial de checkpoints) tal como la
  función `aftership-tracking` original.
