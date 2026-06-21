# Boxifly — Flujo de base de datos: STAGING → PRODUCCIÓN

Este documento define cómo trabajamos la base de datos de forma profesional usando
**dos proyectos Supabase separados** con **promoción de entornos** (environment promotion).

## 🎯 Regla de oro

> **Desarrollas y pruebas en STAGING. Cuando funciona, lo PROMUEVES a PRODUCCIÓN.
> NUNCA se edita el esquema de producción a mano desde el dashboard.**

Todo cambio de esquema vive como una **migración versionada** en `supabase/migrations/`.
El código fuente que depende del esquema es `src/integrations/supabase/types.ts` (tipos
autogenerados) y debe regenerarse tras cada cambio de esquema.

## 🗂️ Los dos entornos

| Entorno | Proyecto Supabase | Ref | URL |
|---|---|---|---|
| **Staging** (desarrollo/QA) | Boxifly Staging | `liszyjbqdyjtitamtrnt` | https://liszyjbqdyjtitamtrnt.supabase.co |
| **Producción** (clientes reales) | Boxifly | `pdnflyuuxstobkhtqutp` | https://pdnflyuuxstobkhtqutp.supabase.co |

Cada entorno usa **sus propias claves**. En Vercel se separan por target:
- **Preview** → claves de Staging
- **Production** → claves de Producción

Variables (cliente, públicas por diseño con prefijo `VITE_`):
`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`.

## 🔄 Flujo de trabajo paso a paso

```
  Desarrollas        Aplicas a        Validas          Promueves a
  (rama + PR)   ─►   STAGING     ─►   (QA/pruebas) ─►   PRODUCCIÓN
```

### 1. Crear un cambio de esquema
```bash
# Enlaza con STAGING (default del config.toml)
supabase link --project-ref liszyjbqdyjtitamtrnt

# Crea una migración nueva (timestamp + nombre)
supabase migration new descripcion_del_cambio
# edita el archivo SQL generado en supabase/migrations/
```

### 2. Aplicar y validar en STAGING
```bash
supabase db push                 # aplica migraciones pendientes a Staging
supabase gen types typescript --linked > src/integrations/supabase/types.ts
# QA: probar la app apuntando a Staging (deploy Preview de Vercel)
```

### 3. Promover a PRODUCCIÓN (solo cuando Staging está validado)
```bash
supabase link --project-ref pdnflyuuxstobkhtqutp
supabase db push                 # aplica EXACTAMENTE las mismas migraciones a Prod
# volver a enlazar con Staging para seguir desarrollando:
supabase link --project-ref liszyjbqdyjtitamtrnt
```

Como ambos entornos aplican los **mismos archivos de migración versionados**, el
resultado es idéntico y reproducible.

## 🚫 Qué NO hacer

- ❌ Editar tablas/columnas/políticas de **producción** a mano desde el dashboard.
- ❌ Copiar datos de producción a staging sin **anonimizar** (PII de clientes).
- ❌ Aplicar una migración a producción sin haberla validado antes en staging.
- ❌ Hardcodear URLs o claves de Supabase en el código (usar `VITE_*` por entorno).

## ✅ Checklist de promoción (staging → prod)

- [ ] La migración se aplicó y validó en Staging.
- [ ] `types.ts` regenerado y commiteado.
- [ ] La app en Preview (Staging) funciona sin errores.
- [ ] RLS revisado en las tablas nuevas/modificadas.
- [ ] Edge Functions / secrets replicados en prod si aplica.
- [ ] `supabase db push` ejecutado contra producción.
- [ ] Deploy de producción en Vercel en verde.

---
_Ver `supabase/SCHEMA_AUDIT.md` para el estado actual de sincronización entre entornos._
