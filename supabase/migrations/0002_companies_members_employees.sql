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
