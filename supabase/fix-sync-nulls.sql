-- Corrige filas y defaults que provocan errores de sincronización
-- Ejecutar en Supabase → SQL Editor si ves:
--   null value in column "category" of relation "expense_entries"

ALTER TABLE public.expense_entries
    ALTER COLUMN category SET DEFAULT 'OTHER';

UPDATE public.expense_entries
    SET category = 'OTHER'
    WHERE category IS NULL OR btrim(category) = '';

ALTER TABLE public.expense_entries
    ALTER COLUMN is_fixed SET DEFAULT false;

UPDATE public.expense_entries
    SET is_fixed = false
    WHERE is_fixed IS NULL;

ALTER TABLE public.work_days
    ALTER COLUMN notes SET DEFAULT '';

UPDATE public.work_days
    SET notes = ''
    WHERE notes IS NULL;

ALTER TABLE public.work_days
    ALTER COLUMN day_type SET DEFAULT 'NORMAL';

UPDATE public.work_days
    SET day_type = 'NORMAL'
    WHERE day_type IS NULL OR btrim(day_type) = '';
