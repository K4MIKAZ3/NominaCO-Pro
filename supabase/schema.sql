-- NominaCO Pro — esquema de sincronización en nube
-- Ejecuta este script en Supabase → SQL Editor (una sola vez por proyecto)

-- Perfil laboral (1 fila por usuario)
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    document_id TEXT NOT NULL DEFAULT '',
    job_title TEXT NOT NULL DEFAULT '',
    monthly_salary BIGINT NOT NULL DEFAULT 0,
    daily_hours INT NOT NULL DEFAULT 8,
    contract_type TEXT NOT NULL DEFAULT 'INDEFINIDO',
    pay_period_type TEXT NOT NULL DEFAULT 'BIWEEKLY',
    pending_vacation_days INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Jornadas registradas por día
CREATE TABLE IF NOT EXISTS public.work_days (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date_iso TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    day_type TEXT NOT NULL DEFAULT 'NORMAL',
    notes TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, date_iso)
);

-- Festivos marcados manualmente
CREATE TABLE IF NOT EXISTS public.manual_holidays (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date_iso TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, date_iso)
);

-- Egresos / préstamos manuales por mes
CREATE TABLE IF NOT EXISTS public.manual_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    year_month TEXT NOT NULL,
    effective_date_iso TEXT,
    label TEXT NOT NULL,
    amount BIGINT NOT NULL,
    entry_type TEXT NOT NULL DEFAULT 'DEDUCTION',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Preferencias de la app (horario default, recordatorio, etc.)
CREATE TABLE IF NOT EXISTS public.app_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    default_start_hour INT NOT NULL DEFAULT 8,
    default_start_minute INT NOT NULL DEFAULT 0,
    default_end_hour INT NOT NULL DEFAULT 16,
    default_end_minute INT NOT NULL DEFAULT 30,
    use_24h_format BOOLEAN NOT NULL DEFAULT true,
    reminder_enabled BOOLEAN NOT NULL DEFAULT false,
    reminder_hour INT NOT NULL DEFAULT 18,
    reminder_minute INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gastos personales (incluye fijos mensuales)
CREATE TABLE IF NOT EXISTS public.expense_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    year_month TEXT NOT NULL,
    date_iso TEXT NOT NULL,
    label TEXT NOT NULL,
    amount BIGINT NOT NULL,
    category TEXT NOT NULL DEFAULT 'OTHER',
    is_fixed BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS expense_entries_user_month
    ON public.expense_entries (user_id, year_month);

CREATE OR REPLACE FUNCTION public.normalize_expense_category()
RETURNS trigger AS $$
BEGIN
    NEW.category := COALESCE(NULLIF(NEW.category, ''), 'OTHER');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS normalize_expense_category_trigger
ON public.expense_entries;

CREATE TRIGGER normalize_expense_category_trigger
BEFORE INSERT OR UPDATE ON public.expense_entries
FOR EACH ROW
EXECUTE FUNCTION public.normalize_expense_category();

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own" ON public.profiles
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "work_days_own" ON public.work_days
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "manual_holidays_own" ON public.manual_holidays
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "manual_deductions_own" ON public.manual_deductions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "app_preferences_own" ON public.app_preferences
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expense_entries_own" ON public.expense_entries
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
