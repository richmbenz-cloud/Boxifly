# Boxifly

Plataforma de **casillero internacional, personal shopper y viajeros** para compras en EE.UU. con entrega en Perú.

**Producción:** https://boxifly.pe

## Tecnologías

Este proyecto está construido con:

- **Vite** — bundler y servidor de desarrollo
- **TypeScript**
- **React**
- **shadcn-ui** — componentes de interfaz
- **Tailwind CSS** — estilos
- **Supabase** — base de datos, autenticación y edge functions
- **Vercel** — hosting y despliegue continuo

## Requisitos

- [Node.js](https://nodejs.org/) y npm instalados (recomendado vía [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

## Desarrollo local

```sh
# 1. Clonar el repositorio
git clone https://github.com/richmbenz-cloud/Boxifly.git

# 2. Entrar al directorio del proyecto
cd Boxifly

# 3. Instalar dependencias
npm i

# 4. Iniciar el servidor de desarrollo (con recarga automática)
npm run dev
```

El servidor de desarrollo queda disponible en `http://localhost:8080`.

### Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```sh
cp .env.example .env
```

Las variables de Supabase requeridas son:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## Entornos

| Entorno | Supabase | Hosting |
|---------|----------|---------|
| Producción | Proyecto **Boxifly** | Vercel → `boxifly.pe`, `www.boxifly.pe` |
| Staging | Proyecto **Boxifly Staging** | Vercel (preview deployments) |

## Despliegue

El despliegue es automático mediante **Vercel**:

1. Los cambios fusionados a la rama `main` disparan un despliegue de producción en Vercel.
2. Cada Pull Request genera un *preview deployment* automático para revisión.

La configuración de build vive en `vercel.json` y `vite.config.ts`.

## Dominios

Los dominios de producción se gestionan directamente en el panel de **Vercel** (Settings → Domains):

- `boxifly.pe`
- `www.boxifly.pe`

## Documentación adicional

- [`IZIPAY_INTEGRATION.md`](./IZIPAY_INTEGRATION.md) — documentación técnica de la integración de pagos con Izipay.
- [`IZIPAY_SETUP.md`](./IZIPAY_SETUP.md) — guía de configuración paso a paso de Izipay.

## Estructura del proyecto

```
.
├── public/              # Activos estáticos
├── scripts/             # Scripts auxiliares
├── src/                 # Código fuente de la aplicación (React + TS)
├── supabase/            # Edge functions y configuración de Supabase
├── index.html           # Punto de entrada HTML
├── vite.config.ts       # Configuración de Vite
└── vercel.json          # Configuración de despliegue en Vercel
```
