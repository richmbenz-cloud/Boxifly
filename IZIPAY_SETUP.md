# Configuración de Izipay - Guía Paso a Paso

## ⚠️ Error Común: "invalid login or private key"

Si ves este error al probar la integración, significa que estás usando la **clave pública** en lugar de la **clave privada**.

### Diferencia entre Claves

| Tipo | Uso | Dónde se configura | Ejemplo |
|------|-----|-------------------|---------|
| **Clave Pública** | Frontend (cargar formulario) | Hardcoded en código | `IgaSTeENV7FZjD16` |
| **Clave Privada** | Backend (crear pagos) | Secreto `IZIPAY_TEST_API_KEY` | Diferente, más larga |

## 🔧 Cómo Obtener tu Clave Privada de Test

### Paso 1: Acceder al Dashboard de Izipay
1. Ve a [https://secure.micuentaweb.pe/](https://secure.micuentaweb.pe/)
2. Inicia sesión con tus credenciales de test

### Paso 2: Encontrar las Claves API
1. Navega a **Settings** → **API Keys** (o **Configuración** → **Claves API**)
2. Verás dos tipos de claves:
   - **Clave Pública / Public Key**: Para el frontend (ya configurada)
   - **Clave Privada / Private Key / Contraseña**: Para el backend ⚠️ **Esta es la que necesitas**

### Paso 3: Copiar la Clave Privada de Test
- Busca la sección de **"Test" o "Pruebas"**
- Copia la **Clave Privada** o **Password** (NO la pública)
- Esta clave suele ser diferente y más larga que la pública

### Paso 4: Actualizar el Secreto en Lovable
1. En tu proyecto Lovable, ve a **Settings** → **Integrations** → **Cloud**
2. Busca **Secrets** o **Secretos**
3. Encuentra el secreto `IZIPAY_TEST_API_KEY`
4. Haz clic en **Edit** o **Actualizar**
5. Reemplaza el valor con tu **clave privada de test**
6. Guarda los cambios

## ✅ Verificar la Configuración

Después de actualizar el secreto:

1. Ve a [/izipay-test](/izipay-test)
2. Haz clic en **"Iniciar Pago con Izipay"**
3. Si ves el formulario de pago de Izipay, ¡la configuración es correcta!
4. Si aún ves errores, verifica los logs de la edge function

## 🔍 Debugging

### Ver Logs de la Edge Function
```bash
# En el panel de Lovable
Settings → Cloud → Edge Functions → izipay-initiate → View Logs
```

### Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `INT_905: invalid login or private key` | Clave pública en lugar de privada | Usar clave privada |
| `No form token received` | Respuesta incorrecta del API | Verificar formato de request |
| `Izipay API key not configured` | Secreto no establecido | Agregar secreto |

## 📚 Recursos Adicionales

- [Documentación oficial de Izipay](https://secure.micuentaweb.pe/doc/)
- [Soporte Izipay](https://www.izipay.pe/contacto/)
- [IZIPAY_INTEGRATION.md](./IZIPAY_INTEGRATION.md) - Documentación técnica completa

## 🎯 Próximos Pasos

Una vez que la integración funcione en test:

1. ✅ Probar con diferentes montos
2. ✅ Verificar webhooks en la base de datos
3. ✅ Probar tarjetas de test válidas e inválidas
4. ⏳ Configurar webhook URL en dashboard de Izipay
5. ⏳ Migrar a claves de producción cuando estés listo

---

**Nota**: Nunca compartas tu clave privada públicamente. Esta clave debe mantenerse segura y solo configurarse como secreto en tu backend.
