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
