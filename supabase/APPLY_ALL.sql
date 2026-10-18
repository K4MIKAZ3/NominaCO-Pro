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
-- Multi-empresa: companies, members (roles), employees, work days, payroll periods.
-- Proyecto Supabase NUEVO de Nominapp Empresas.

create type public.company_role as enum ('owner', 'accountant', 'employee');
create type public.contract_type as enum ('INDEFINIDO', 'OBRA_LABOR', 'TERMINO_DEFINIDO');
create type public.pay_period_type as enum ('MONTHLY', 'WEEKLY', 'BIWEEKLY', 'VENTEEN');
create type public.payroll_period_status as enum ('draft', 'open', 'closed');

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  nit text not null,
  city text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (nit)
);

create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.company_role not null default 'employee',
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create index company_members_user_idx on public.company_members (user_id);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid references auth.users (id),
  full_name text not null,
  document_id text not null,
  job_title text not null default '',
  monthly_salary bigint not null check (monthly_salary > 0),
  daily_hours numeric not null default 8 check (daily_hours > 0),
  contract_type public.contract_type not null default 'INDEFINIDO',
  pay_period_type public.pay_period_type not null default 'MONTHLY',
  pending_vacation_days numeric not null default 0,
  active boolean not null default true,
  hired_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, document_id)
);

create index employees_company_idx on public.employees (company_id);

create table public.payroll_periods (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  label text not null,
  period_start date not null,
  period_end date not null,
  status public.payroll_period_status not null default 'draft',
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  check (period_end >= period_start)
);

create index payroll_periods_company_idx on public.payroll_periods (company_id);

create table public.work_day_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  work_date date not null,
  start_time time not null,
  end_time time not null,
  day_type text not null default 'NORMAL'
    check (day_type in ('NORMAL', 'FESTIVO_DOMINICAL', 'FESTIVO_NOCTURNO')),
  notes text,
  created_at timestamptz not null default now(),
  unique (employee_id, work_date)
);

create index work_day_entries_employee_date_idx
  on public.work_day_entries (employee_id, work_date);

create table public.manual_payroll_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  year_month text not null,
  effective_date date not null,
  label text not null,
  amount bigint not null check (amount >= 0),
  entry_type text not null check (entry_type in ('DEDUCTION', 'ADVANCE', 'BONUS')),
  created_at timestamptz not null default now()
);

-- Helpers RLS
create or replace function public.is_company_member(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members m
    where m.company_id = p_company_id
      and m.user_id = auth.uid()
  );
$$;

create or replace function public.has_company_role(
  p_company_id uuid,
  p_roles public.company_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members m
    where m.company_id = p_company_id
      and m.user_id = auth.uid()
      and m.role = any (p_roles)
  );
$$;

alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.employees enable row level security;
alter table public.payroll_periods enable row level security;
alter table public.work_day_entries enable row level security;
alter table public.manual_payroll_entries enable row level security;

create policy companies_select on public.companies
  for select using (public.is_company_member(id));

create policy companies_insert on public.companies
  for insert with check (auth.uid() is not null);

create policy companies_update on public.companies
  for update using (public.has_company_role(id, array['owner'::public.company_role]));

create policy members_select on public.company_members
  for select using (public.is_company_member(company_id));

create policy members_manage on public.company_members
  for all using (
    public.has_company_role(company_id, array['owner'::public.company_role])
  );

create policy employees_select on public.employees
  for select using (public.is_company_member(company_id));

create policy employees_write on public.employees
  for all using (
    public.has_company_role(
      company_id,
      array['owner'::public.company_role, 'accountant'::public.company_role]
    )
  );

create policy periods_select on public.payroll_periods
  for select using (public.is_company_member(company_id));

create policy periods_write on public.payroll_periods
  for all using (
    public.has_company_role(
      company_id,
      array['owner'::public.company_role, 'accountant'::public.company_role]
    )
  );

create policy work_days_select on public.work_day_entries
  for select using (public.is_company_member(company_id));

create policy work_days_write on public.work_day_entries
  for all using (
    public.has_company_role(
      company_id,
      array['owner'::public.company_role, 'accountant'::public.company_role]
    )
  );

create policy manual_entries_select on public.manual_payroll_entries
  for select using (public.is_company_member(company_id));

create policy manual_entries_write on public.manual_payroll_entries
  for all using (
    public.has_company_role(
      company_id,
      array['owner'::public.company_role, 'accountant'::public.company_role]
    )
  );
-- Lectura pública de parámetros legales + el creador queda como owner.

alter table public.legal_parameter_sets enable row level security;
alter table public.official_holidays enable row level security;

create policy legal_parameter_sets_read on public.legal_parameter_sets
  for select to anon, authenticated using (true);

create policy official_holidays_read on public.official_holidays
  for select to anon, authenticated using (true);

create or replace function public.handle_new_company()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Se requiere sesión para crear empresa';
  end if;
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  insert into public.company_members (company_id, user_id, role)
  values (new.id, auth.uid(), 'owner')
  on conflict (company_id, user_id) do nothing;
  return new;
end;
$$;

-- BEFORE para setear created_by; AFTER para member
create or replace function public.set_company_created_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

create or replace function public.add_company_owner_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.company_members (company_id, user_id, role)
  values (new.id, coalesce(new.created_by, auth.uid()), 'owner')
  on conflict (company_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_companies_set_created_by on public.companies;
create trigger trg_companies_set_created_by
  before insert on public.companies
  for each row execute function public.set_company_created_by();

drop trigger if exists trg_companies_add_owner on public.companies;
create trigger trg_companies_add_owner
  after insert on public.companies
  for each row execute function public.add_company_owner_member();

drop function if exists public.handle_new_company();
