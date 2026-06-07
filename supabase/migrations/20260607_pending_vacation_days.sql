-- Migración: días de vacaciones pendientes en perfil (v1.6.1)
-- Ejecutar en Supabase SQL Editor si el proyecto ya existía antes de esta versión.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pending_vacation_days INT NOT NULL DEFAULT 0;
