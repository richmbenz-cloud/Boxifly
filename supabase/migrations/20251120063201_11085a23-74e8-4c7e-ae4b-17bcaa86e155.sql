-- Habilitar Realtime para whatsapp_messages
ALTER TABLE public.whatsapp_messages REPLICA IDENTITY FULL;

-- Agregar tabla a publicación realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;