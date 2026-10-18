-- Parámetros legales versionados por vigencia (Colombia).
-- Proyecto Supabase NUEVO de Nominapp Empresas (no compartir con NominaCO-Pro).

create extension if not exists "pgcrypto";

create table public.legal_parameter_sets (
  id text primary key,
  country_code text not null default 'CO',
  valid_from date not null,
  valid_to date,
  smmlv bigint not null,
  transport_subsidy bigint not null,
  transport_salary_cap_multiplier numeric not null default 2,
  uvt bigint not null,
  health_employee_rate numeric not null default 0.04,
  pension_employee_rate numeric not null default 0.04,
  reference_month_days int not null default 30,
  settlement_year_days int not null default 360,
  cesantias_interest_annual numeric not null default 0.12,
  ordinary_work_days_per_week int not null default 5,
  weekly_hours_limit int not null,
  dominical_factor numeric not null,
  night_start_hour int not null default 19,
  night_end_hour int not null default 6,
  night_ordinary_factor numeric not null default 1.35,
  extra_day_factor numeric not null default 1.25,
  extra_night_factor numeric not null default 1.75,
  created_at timestamptz not null default now()
);

create table public.official_holidays (
  id uuid primary key default gen_random_uuid(),
  holiday_date date not null unique,
  label text not null,
  legal_basis text,
  created_at timestamptz not null default now()
);

-- Semilla 2026 (validada en docs/LEGAL_VALIDATION_2026.md)
insert into public.legal_parameter_sets (
  id, valid_from, valid_to, smmlv, transport_subsidy, uvt,
  weekly_hours_limit, dominical_factor
) values
  ('co-2026-h1', '2026-01-01', '2026-06-30', 1750905, 249095, 52374, 44, 1.80),
  ('co-2026-jul-early', '2026-07-01', '2026-07-14', 1750905, 249095, 52374, 44, 1.90),
  ('co-2026-h2', '2026-07-15', '2026-12-31', 1750905, 249095, 52374, 42, 1.90);

insert into public.official_holidays (holiday_date, label, legal_basis) values
  ('2026-01-01', 'Año Nuevo', 'Fecha fija'),
  ('2026-01-12', 'Reyes Magos', 'Ley Emiliani'),
  ('2026-03-23', 'San José', 'Ley Emiliani'),
  ('2026-04-02', 'Jueves Santo', 'Fecha fija religiosa'),
  ('2026-04-03', 'Viernes Santo', 'Fecha fija religiosa'),
  ('2026-05-01', 'Día del Trabajo', 'Fecha fija'),
  ('2026-05-18', 'Ascensión del Señor', 'Ley Emiliani'),
  ('2026-06-08', 'Corpus Christi', 'Ley Emiliani'),
  ('2026-06-15', 'Sagrado Corazón', 'Ley Emiliani'),
  ('2026-06-29', 'San Pedro y San Pablo', 'Ley Emiliani'),
  ('2026-07-13', 'Nuestra Señora del Rosario de Chiquinquirá', 'Ley 2578/2026 + Emiliani'),
  ('2026-07-20', 'Independencia', 'Fecha fija'),
  ('2026-08-07', 'Batalla de Boyacá', 'Fecha fija'),
  ('2026-08-17', 'Asunción de la Virgen', 'Ley Emiliani'),
  ('2026-10-12', 'Diversidad Étnica y Cultural', 'Ley Emiliani'),
  ('2026-11-02', 'Todos los Santos', 'Ley Emiliani'),
  ('2026-11-16', 'Independencia de Cartagena', 'Ley Emiliani'),
  ('2026-12-08', 'Inmaculada Concepción', 'Fecha fija'),
  ('2026-12-25', 'Navidad', 'Fecha fija');
