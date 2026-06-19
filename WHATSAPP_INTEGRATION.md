# 📲 Notificaciones WhatsApp automáticas (Pilar #1)

Cuando un paquete cambia de `current_status`, el sistema envía automáticamente
un WhatsApp al cliente. El flujo es:

```
warehouse cambia current_status
        ↓
trigger_whatsapp_on_status_change  (función SQL + pg_net)
        ↓
Edge Function  whatsapp-notify     (plantillas de mensaje)
        ↓
n8n  (N8N_WHATSAPP_WEBHOOK_URL)    ← tu instancia
        ↓
API de WhatsApp  →  cliente 📲
```

El historial queda registrado en la tabla `whatsapp_messages` (visible en el
panel de admin → WhatsApp History) y la notificación in-app en `notifications`.

## Estados que disparan mensaje

| `current_status`     | Template (`whatsapp-notify`) |
|----------------------|------------------------------|
| `prealerted`         | `package_prealerted`         |
| `received_warehouse` | `package_received`           |
| `ready_consolidation`| `package_ready_consolidation`|
| `consolidated`       | `package_consolidated`       |
| `in_transit`         | `package_in_transit`         |
| `arrived_peru`       | `package_arrived_peru`       |
| `ready_delivery`     | `package_ready_delivery`     |
| `delivered`          | `package_delivered`          |

> El mensaje se envía solo si el cliente tiene `phone` en su perfil **y** la URL
> de la Edge Function está configurada (ver abajo). Si falta algo, la fila se
> guarda en `whatsapp_messages` con estado `pending` y no se intenta el envío.

---

## ✅ Pasos para activarlo

### 1. Desplegar la migración y la Edge Function
```bash
supabase db push                        # aplica la migración (pg_net + trigger)
supabase functions deploy whatsapp-notify
```

### 2. Configurar el secreto de n8n en la Edge Function
La función `whatsapp-notify` reenvía a n8n. Setea la URL del webhook de n8n:
```bash
supabase secrets set N8N_WHATSAPP_WEBHOOK_URL="https://<tu-n8n-publico>/webhook/whatsapp"
```
> ⚠️ Como tu n8n corre **local**, necesitas exponerlo públicamente para que
> Supabase (en la nube) pueda alcanzarlo. Opciones:
> - **Cloudflare Tunnel** o **ngrok** (rápido para probar).
> - Hostear n8n en un VPS para producción 24/7 (recomendado).
> Si NO seteas esta variable, la función corre en **modo mock** (registra pero no envía).

### 3. Permitir que el trigger invoque la Edge Function
El trigger necesita la URL de la función y una credencial para llamarla. Setéalas
una sola vez (reemplaza `<proj>` y `<SERVICE_ROLE_KEY>`):
```sql
ALTER DATABASE postgres
  SET app.whatsapp_notify_url = 'https://<proj>.supabase.co/functions/v1/whatsapp-notify';
ALTER DATABASE postgres
  SET app.service_role_key = '<SERVICE_ROLE_KEY>';
```
> El `SERVICE_ROLE_KEY` está en *Supabase → Project Settings → API*.
> 🔒 Endurecimiento opcional: en vez de `ALTER DATABASE`, guarda estos valores en
> **Supabase Vault** (`vault.create_secret`) y léelos en la función con
> `vault.decrypted_secrets`.

### 4. Configurar el flujo en n8n
Tu n8n recibe un POST con este cuerpo:
```json
{ "phone": "+51999888777", "messageText": "Hola Juan! ✈️ Tu paquete *1Z...* está en tránsito a Perú..." }
```
En n8n: nodo **Webhook** (POST) → nodo de tu **proveedor de WhatsApp**
(Meta Cloud API / Twilio / proveedor local) usando `{{$json.phone}}` y
`{{$json.messageText}}`.

---

## 🧪 Probar
1. En el panel de **warehouse**, cambia un paquete a `received_warehouse`.
2. Revisa **Admin → WhatsApp History**: debe aparecer la fila con estado `sent`.
3. Verifica la ejecución entrante en tu **n8n** y la llegada del WhatsApp.

Para depurar el lado servidor:
```bash
supabase functions logs whatsapp-notify
-- Llamadas pg_net:
select * from net._http_response order by created desc limit 20;
```
