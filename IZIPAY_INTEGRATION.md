# Integración de Izipay - Documentación

## Descripción General

Este proyecto incluye una integración completa con **Izipay**, la pasarela de pagos peruana que permite procesar pagos con tarjetas de crédito y débito de forma segura.

## Página de Prueba

Para validar el flujo completo de pago, accede a la página de prueba:
👉 **[/izipay-test](/izipay-test)** - Página interactiva con formulario de pago embebido

Características de la página de prueba:
- ✅ Interfaz completa de checkout con resumen de pedido
- ✅ Configuración de datos del cliente
- ✅ Inicialización de pago con Izipay
- ✅ Renderizado del formulario de pago embebido
- ✅ Visualización de estados del pago (procesando, exitoso, fallido)
- ✅ Instrucciones para tarjetas de test

**Acceso rápido**: Desde el Panel de Admin → Botón "Prueba Izipay"

## Configuración

### 1. Clave de API (Secreto) - ⚠️ IMPORTANTE

**CRÍTICO**: Necesitas **DOS claves diferentes** de Izipay:

#### A. Clave Privada (Backend) - `IZIPAY_TEST_API_KEY`
Esta es la clave que se usa en el servidor para crear pagos. **Es diferente de la clave pública**.

**Cómo obtenerla:**
1. Inicia sesión en [Izipay Dashboard Test](https://secure.micuentaweb.pe/)
2. Ve a Settings → API Keys o Configuración → Claves API
3. Busca la **Clave Privada de Test** o **Test Private Key** o **Contraseña de Test**
4. Esta clave es diferente de la clave pública y suele ser más larga

**Actualizar el secreto:**
1. Ve a Settings → Integrations → Cloud → Secrets
2. Actualiza `IZIPAY_TEST_API_KEY` con tu **clave privada de test**

#### B. Clave Pública (Frontend) - Hardcoded en código
- **Valor actual**: `IgaSTeENV7FZjD16` (esta es la clave pública para test)
- Esta clave se usa en el frontend para cargar el formulario de pago
- Ya está configurada en `useIzipay.ts`

**Nota**: La clave pública (`IgaSTeENV7FZjD16`) NO funciona para crear pagos desde el servidor. Por eso recibes el error "invalid login or private key".

### 2. Edge Functions Disponibles

#### `izipay-initiate`
**Endpoint**: `https://ivkfyzdsfpcjymlzerxf.supabase.co/functions/v1/izipay-initiate`

Inicia un pago con Izipay y retorna un `formToken` para renderizar el formulario de pago.

**Parámetros de entrada**:
```typescript
{
  amount: number;        // Monto en soles (ej: 150.50)
  orderId: string;       // ID de la orden
  currency?: string;     // Moneda (default: 'PEN')
  email: string;         // Email del cliente
  firstName?: string;    // Nombre del cliente
  lastName?: string;     // Apellido del cliente
  description?: string;  // Descripción del pago
}
```

**Respuesta**:
```typescript
{
  success: boolean;
  formToken?: string;      // Token para renderizar el formulario
  transactionId?: string;  // ID de la transacción
  error?: string;          // Mensaje de error si falla
}
```

#### `izipay-webhook`
**Endpoint**: `https://ivkfyzdsfpcjymlzerxf.supabase.co/functions/v1/izipay-webhook`

Recibe notificaciones de Izipay sobre el estado de los pagos y actualiza automáticamente las órdenes.

**Configuración en Izipay Dashboard**:
1. Inicia sesión en [Izipay Dashboard](https://secure.micuentaweb.pe/)
2. Ve a Settings → Notifications
3. Configura la URL del webhook: `https://ivkfyzdsfpcjymlzerxf.supabase.co/functions/v1/izipay-webhook`
4. Activa las notificaciones para: PAID, UNPAID, REFUSED, CANCELLED

## Uso en el Frontend

### Hook personalizado: `useIzipay`

El proyecto incluye un hook React que facilita la integración:

```typescript
import { useIzipay } from '@/hooks/useIzipay';

function CheckoutPage() {
  const { initiatePayment, renderPaymentForm, loading, error } = useIzipay();
  
  const handlePayment = async () => {
    // 1. Iniciar el pago
    const result = await initiatePayment({
      amount: 150.50,
      orderId: 'ORDER-123',
      email: 'cliente@example.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      description: 'Compra de productos Boxifly'
    });
    
    if (result?.success && result.formToken) {
      // 2. Renderizar el formulario de pago
      await renderPaymentForm(result.formToken, 'payment-form-container');
    }
  };
  
  return (
    <div>
      <button onClick={handlePayment} disabled={loading}>
        Pagar con tarjeta
      </button>
      
      {/* Contenedor donde se renderizará el formulario de Izipay */}
      <div id="payment-form-container"></div>
      
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

### Métodos disponibles en `useIzipay`

#### `initiatePayment(paymentData)`
Inicia un pago y retorna un token para renderizar el formulario.

#### `renderPaymentForm(formToken, containerId)`
Renderiza el formulario de pago de Izipay en el contenedor especificado.

#### `loadIzipayScript()`
Carga el script de Izipay (se llama automáticamente al renderizar el formulario).

#### `loading`
Estado booleano que indica si hay una operación en proceso.

#### `error`
Mensaje de error si algo falla.

## Flujo Completo de Pago

1. **Cliente inicia el pago** → Llama a `initiatePayment()`
2. **Backend contacta a Izipay** → Edge function `izipay-initiate` crea el pago
3. **Renderizar formulario** → Llama a `renderPaymentForm()` con el token recibido
4. **Cliente completa el pago** → Ingresa datos de tarjeta en el formulario de Izipay
5. **Izipay procesa el pago** → Valida la tarjeta y procesa la transacción
6. **Webhook recibe notificación** → `izipay-webhook` actualiza el estado de la orden
7. **Base de datos actualizada** → La orden cambia a estado "paid" y "processing"

## Tabla de Base de Datos

Los eventos de pago se registran en la tabla `payments_webhooks`:

```sql
-- Consultar pagos de Izipay
SELECT * FROM payments_webhooks 
WHERE event_type LIKE 'izipay.%' 
ORDER BY created_at DESC;
```

## Ambiente de Test vs Producción

### Test (Actual)
- **Clave API**: `IgaSTeENV7FZjD16`
- **URL Base**: `https://api.micuentaweb.pe`
- **Script**: `https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js`

### Producción (Futuro)
Para cambiar a producción:
1. Actualiza el secreto `IZIPAY_TEST_API_KEY` con tu clave de producción
2. En `useIzipay.ts`, cambia las URLs a los endpoints de producción
3. Actualiza la clave pública en `loadIzipayScript()` y `renderPaymentForm()`

## Tarjetas de Test

Para probar pagos en el ambiente de test, usa estas tarjetas:

| Tarjeta | Número | CVV | Fecha | Resultado |
|---------|--------|-----|-------|-----------|
| Visa | 4970 1000 0000 0003 | 123 | 12/25 | Pago exitoso |
| Mastercard | 5555 5555 5555 4444 | 123 | 12/25 | Pago exitoso |
| Amex | 3782 822463 10005 | 1234 | 12/25 | Pago exitoso |
| Visa | 4970 1000 0000 0004 | 123 | 12/25 | Pago rechazado |

## Seguridad

✅ **Buenas prácticas implementadas**:
- Clave API almacenada en secretos (no en código)
- Webhooks validan la autenticidad de las notificaciones
- Comunicación segura vía HTTPS
- No se almacenan datos sensibles de tarjetas

## Soporte

Para más información sobre Izipay:
- 📖 [Documentación oficial](https://secure.micuentaweb.pe/doc/)
- 💬 [Soporte Izipay](https://www.izipay.pe/contacto/)
- 🔧 [Dashboard de Test](https://secure.micuentaweb.pe/)

## Próximos Pasos

1. ✅ Integración básica completada
2. ⏳ Probar flujo completo en ambiente de test
3. ⏳ Configurar webhook en dashboard de Izipay
4. ⏳ Integrar con página de checkout real
5. ⏳ Migrar a ambiente de producción
