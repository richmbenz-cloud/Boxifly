-- ============================================================
-- Fase 1 — UI en vivo: habilitar Supabase Realtime para tracking
--
-- El dashboard y el detalle del paquete se suscriben a cambios en
-- `tracking_events` (checkpoints del carrier) y `packages` (estado interno)
-- vía `postgres_changes`. Para que esos eventos viajen al cliente, ambas
-- tablas deben estar en la publicación `supabase_realtime` y tener
-- REPLICA IDENTITY FULL (para recibir el payload completo en UPDATE/DELETE).
--
-- Idempotente: re-ejecutar la migración no falla si ya están agregadas.
-- La RLS existente de `tracking_events` ("Users can view own package
-- tracking") sigue aplicando: Realtime solo entrega filas que el usuario
-- puede ver.
-- ============================================================

ALTER TABLE public.tracking_events REPLICA IDENTITY FULL;
ALTER TABLE public.packages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'tracking_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_events;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'packages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.packages;
  END IF;
END $$;
