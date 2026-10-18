-- Policies solo para authenticated (anon no evalúa helpers SECURITY DEFINER)
drop policy if exists companies_select on public.companies;
drop policy if exists companies_insert on public.companies;
drop policy if exists companies_update on public.companies;
drop policy if exists members_select on public.company_members;
drop policy if exists members_manage on public.company_members;
drop policy if exists employees_select on public.employees;
drop policy if exists employees_write on public.employees;
drop policy if exists periods_select on public.payroll_periods;
drop policy if exists periods_write on public.payroll_periods;
drop policy if exists work_days_select on public.work_day_entries;
drop policy if exists work_days_write on public.work_day_entries;
drop policy if exists manual_entries_select on public.manual_payroll_entries;
drop policy if exists manual_entries_write on public.manual_payroll_entries;

create policy companies_select on public.companies
  for select to authenticated using (public.is_company_member(id));
create policy companies_insert on public.companies
  for insert to authenticated with check (auth.uid() is not null);
create policy companies_update on public.companies
  for update to authenticated using (public.has_company_role(id, array['owner'::public.company_role]));

create policy members_select on public.company_members
  for select to authenticated using (public.is_company_member(company_id));
create policy members_manage on public.company_members
  for all to authenticated using (public.has_company_role(company_id, array['owner'::public.company_role]));

create policy employees_select on public.employees
  for select to authenticated using (public.is_company_member(company_id));
create policy employees_write on public.employees
  for all to authenticated using (
    public.has_company_role(company_id, array['owner'::public.company_role, 'accountant'::public.company_role])
  );

create policy periods_select on public.payroll_periods
  for select to authenticated using (public.is_company_member(company_id));
create policy periods_write on public.payroll_periods
  for all to authenticated using (
    public.has_company_role(company_id, array['owner'::public.company_role, 'accountant'::public.company_role])
  );

create policy work_days_select on public.work_day_entries
  for select to authenticated using (public.is_company_member(company_id));
create policy work_days_write on public.work_day_entries
  for all to authenticated using (
    public.has_company_role(company_id, array['owner'::public.company_role, 'accountant'::public.company_role])
  );

create policy manual_entries_select on public.manual_payroll_entries
  for select to authenticated using (public.is_company_member(company_id));
create policy manual_entries_write on public.manual_payroll_entries
  for all to authenticated using (
    public.has_company_role(company_id, array['owner'::public.company_role, 'accountant'::public.company_role])
  );
