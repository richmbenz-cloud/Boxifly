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

### 3. Config del cron (Supabase Vault)
El cron lee `project_url` + `service_role_key` desde **Supabase Vault** (los mismos
secretos del Pilar #1; no usa GUCs `app.*`, que requieren superusuario y fallaban).
Si ya los creaste para WhatsApp, no hace falta repetirlos. Si no:
```sql
SELECT vault.create_secret('https://<proj>.supabase.co', 'project_url',      'URL base del proyecto para pg_net');
SELECT vault.create_secret('<SERVICE_ROLE_KEY>',          'service_role_key', 'Service role key para llamar Edge Functions');
```
La URL del cron se construye sola: `project_url || '/functions/v1/sync-tracking'`.

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
- **Degradación segura:** si no existe el secreto `project_url` en Vault, el cron no
  hace nada; si falta `AFTERSHIP_API_KEY`, la función responde 500 sin tocar datos.
- Reutiliza la tabla `tracking_events` (historial de checkpoints) tal como la
  función `aftership-tracking` original.

## 🔄 Nota de migración de API (AfterShip)

> Aplicada en las Edge Functions `aftership-tracking` y `sync-tracking` (v6 en PROD).

**Qué cambió:** se migró del endpoint **AfterShip v4** (header `aftership-api-key`)
a la **API de Tracking versionada**.

- **Motivo:** la v4 + header `aftership-api-key` fue **deprecada (2023-10)** y ahora devuelve **404**.
- **Base nueva:** `https://api.aftership.com/tracking/2025-07/trackings`
- **Auth nueva:** header **`as-api-key`** (reemplaza `aftership-api-key`).
- **Crear tracking:** body **plano** `{ "tracking_number": "..." }` (ya no anidado en `{ tracking: {...} }`); opcional `slug` = carrier.
- **Idempotencia:** si ya existe, la API responde `meta.code = 4003` con el `id` en `data` → se reutiliza ese `id`.
- **Lectura:** `GET {BASE}/{trackingId}` (con fallback por número de tracking).

### Snippet de referencia
```ts
const BASE = 'https://api.aftership.com/tracking/2025-07/trackings';
const asHeaders = { 'Content-Type': 'application/json', 'as-api-key': AFTERSHIP_API_KEY };
// Crear (idempotente): HTTP 201 -> data.id ; meta.code 4003 -> ya existe, data.id
// Leer:  GET `${BASE}/${trackingId}`
```

### Estado verificado (PROD · 2026-06-22)
- `aftership-tracking` y `sync-tracking`: **ACTIVE**, v6.
- Cron `sync-tracking-every-2h` (`0 */2 * * *`): activo; últimas corridas `succeeded`.
- `tracking_events` recibiendo eventos reales de FedEx vía AfterShip.

_Migración verificada contra el código desplegado y el estado real del proyecto PROD (`ref pdnflyuuxstobkhtqutp`)._


## 🔔 Webhook en tiempo real (Fase 2)

> Edge Function `aftership-webhook`. AfterShip llama a la función en el instante
> en que hay un checkpoint nuevo (push), sin esperar al cron. El cron
> `sync-tracking` (cada 10 min) queda como **red de seguridad / reconciliación**.

```
AfterShip  --POST (firmado HMAC)-->  aftership-webhook
   ↓ verifica firma `aftership-hmac-sha256`
   ↓ reemplaza checkpoints en `tracking_events`  (idempotente: trae la lista completa)
   ↓ AVANZA packages.current_status  (mismo mapeo/orden que sync-tracking; nunca retrocede)
   ↓ triggers existentes -> notificación in-app + WhatsApp 📲
   ↓ Realtime (Fase 1) refresca el feed del cliente al instante
```

### 1. Desplegar
```bash
supabase functions deploy aftership-webhook
# Declarada con verify_jwt = false en config.toml (AfterShip no envía JWT).
```

### 2. Configurar el secret de firma
Obtén el secret en **AfterShip > Settings > Notifications** y guárdalo:
```bash
supabase secrets set AFTERSHIP_WEBHOOK_SECRET="<tu-webhook-secret>"
```
(`AFTERSHIP_API_KEY`, `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya están seteados.)

### 3. Registrar la URL del webhook en AfterShip
En **AfterShip > Settings > Notifications > Webhooks**, agrega:
```
https://<proj>.supabase.co/functions/v1/aftership-webhook
```
Selecciona el evento de actualización de tracking. AfterShip envía un POST de
prueba; el webhook queda activo al responder 200.

### Seguridad e idempotencia
- **Firma HMAC-SHA256 (base64)** sobre el cuerpo crudo, comparada en tiempo
  constante. Si no valida -> `401` (no toca datos). Sin secret -> `500`.
- **Idempotente:** el payload trae el array completo de checkpoints, así que se
  reemplaza el historial (DELETE + INSERT). Reprocesar el mismo evento converge
  al mismo estado, sin duplicados ni constraints extra.
- **No retrocede:** usa `STATUS_ORDER` y update race-safe (`.eq('current_status', previo)`).
- Tracking sin paquete asociado o evento de prueba -> `200` (ack, sin reintentos).

### Probar manualmente
```bash
BODY='{"msg":{"tracking_number":"<TN>","slug":"fedex","tag":"InTransit","checkpoints":[{"tag":"InTransit","message":"Departed FedEx hub","location":"Memphis, TN","checkpoint_time":"2026-06-22T10:00:00Z"}]}}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "<AFTERSHIP_WEBHOOK_SECRET>" -binary | base64)
curl -X POST 'https://<proj>.supabase.co/functions/v1/aftership-webhook' \
  -H "aftership-hmac-sha256: $SIG" \
  -H 'Content-Type: application/json' \
  -d "$BODY"
```
