-- Fase 3 — Campos de identidad en profiles
-- Agrega soporte para personas naturales (DNI + nombres/apellidos) y empresas
-- (RUC + razón social), además de un flag de verificación contra RENIEC/SUNAT.
-- Idempotente: usa IF NOT EXISTS para poder promoverse sin romper si se reaplica.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS person_type TEXT NOT NULL DEFAULT 'natural'
    CHECK (person_type IN ('natural', 'empresa')),
  ADD COLUMN IF NOT EXISTS document_type TEXT
    CHECK (document_type IN ('dni', 'ruc')),
  ADD COLUMN IF NOT EXISTS document_number TEXT,
  ADD COLUMN IF NOT EXISTS nombres TEXT,
  ADD COLUMN IF NOT EXISTS apellido_paterno TEXT,
  ADD COLUMN IF NOT EXISTS apellido_materno TEXT,
  ADD COLUMN IF NOT EXISTS razon_social TEXT,
  ADD COLUMN IF NOT EXISTS document_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS document_verified_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.person_type IS 'natural (DNI) | empresa (RUC)';
COMMENT ON COLUMN public.profiles.document_number IS 'DNI (8 díg.) o RUC (11 díg.) validado contra RENIEC/SUNAT';
COMMENT ON COLUMN public.profiles.document_verified IS 'true cuando el documento fue validado contra RENIEC/SUNAT (consultar-documento)';

-- Evita dos perfiles con el mismo documento (cuando está presente).
CREATE UNIQUE INDEX IF NOT EXISTS profiles_document_number_unique
  ON public.profiles (document_number)
  WHERE document_number IS NOT NULL;
