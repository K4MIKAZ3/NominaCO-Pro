# Deploy Nominapp Empresas

| Recurso | Valor |
| --- | --- |
| Repo | `K4MIKAZ3/NominappEmpresas` |
| Supabase | `https://kmkrxyrorksrwmdomfuy.supabase.co` |
| Dominio | `empresas.nominapp.xyz` |
| Root Vercel | `apps/web` |

## 1. Migraciones Supabase (SQL Editor)

Proyecto: [kmkrxyrorksrwmdomfuy](https://supabase.com/dashboard/project/kmkrxyrorksrwmdomfuy/sql)

Ejecutar en orden:

1. `supabase/migrations/0001_legal_parameters.sql`
2. `supabase/migrations/0002_companies_members_employees.sql`
3. `supabase/migrations/0003_legal_rls_and_company_owner.sql`

## 2. Auth redirects

Dashboard → Authentication → URL Configuration:

- Site URL: `https://empresas.nominapp.xyz`
- Redirect URLs:
  - `https://empresas.nominapp.xyz/**`
  - `https://empresas.nominapp.xyz/login`
  - `http://localhost:3001/**` (dev)

## 3. API keys → Vercel env

Dashboard → Project Settings → API:

| Variable Vercel | Origen |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kmkrxyrorksrwmdomfuy.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role (solo server; nunca `NEXT_PUBLIC_`) |
| `NEXT_PUBLIC_SITE_URL` | `https://empresas.nominapp.xyz` |

## 4. Proyecto Vercel

1. Importar `K4MIKAZ3/NominappEmpresas` (rama `main` con foundation).
2. **Root Directory:** `apps/web`
3. Framework: Next.js (auto)
4. Install / Build: usa `apps/web/vercel.json`
5. Añadir env vars (Production + Preview)
6. Deploy

## 5. Dominio `empresas.nominapp.xyz`

En el proyecto Vercel → Domains → Add `empresas.nominapp.xyz`.

DNS en el registrador de `nominapp.xyz` (o en Vercel si el apex ya está ahí):

| Tipo | Nombre | Valor |
| --- | --- | --- |
| CNAME | `empresas` | `cname.vercel-dns.com` |

Si `nominapp.xyz` ya está en Vercel, añade el subdominio al **nuevo** proyecto Empresas (no al personal).

## 6. Checklist post-deploy

- [ ] `https://empresas.nominapp.xyz` carga landing
- [ ] `/login` funciona
- [ ] Tablas visibles en Table Editor
- [ ] Auth Site URL apunta al dominio prod
