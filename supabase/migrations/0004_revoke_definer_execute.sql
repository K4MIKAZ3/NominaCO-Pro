-- Triggers: no deben ser invocables vía RPC
revoke all on function public.set_company_created_by() from public, anon, authenticated;
revoke all on function public.add_company_owner_member() from public, anon, authenticated;

-- Helpers RLS: solo authenticated (las policies los usan en sesión)
revoke all on function public.is_company_member(uuid) from public, anon;
revoke all on function public.has_company_role(uuid, public.company_role[]) from public, anon;
grant execute on function public.is_company_member(uuid) to authenticated;
grant execute on function public.has_company_role(uuid, public.company_role[]) to authenticated;
