# Nominapp Empresas

Nómina multi-empresa para Colombia. Producto **separado** de Nominapp personal (`NominaCO-Pro`).

| | |
| --- | --- |
| Web empleador | https://empresas.nominapp.xyz |
| Android package | `com.vcco.nominapp.empresas` |
| Motor | `packages/payroll-engine` (TypeScript único) |
| Backend | Proyecto Supabase nuevo |

## Principios

1. **No tocar** la app/BD personal (`NominaCO-Pro`, nominapp.xyz).
2. Un solo motor de liquidación, testeable, sin duplicar Kotlin/TS.
3. Ley versionada por vigencia (`legal_parameters`), no hardcode anual.
4. Aislamiento multi-tenant por `company_id` + roles (`owner` / `accountant` / `employee`).

## Monorepo

```
apps/web          → panel empleador (Next.js) → empresas.nominapp.xyz
apps/android      → app trabajador/empleador (applicationId com.vcco.nominapp.empresas)
packages/payroll-engine → motor puro TS + tests
supabase/         → migraciones, RLS por empresa
docs/             → validación legal y arquitectura
```

## Arranque local

```bash
pnpm install
pnpm --filter @nominapp/payroll-engine test
pnpm --filter @nominapp/web dev
```

## Estado (foundation)

- [x] Validación legal 2026 + motor TS (IBC sin ST)
- [x] Migraciones aplicadas en Supabase `kmkrxyrorksrwmdomfuy`
- [x] Panel web con auth + CRUD real (empresas / empleados / períodos / legal)
- [x] Dominio Vercel `empresas.nominapp.xyz` (hay que redesplegar tras transfer)
- [ ] **Transfer** esta rama → `NominappEmpresas` `main` (ver abajo)
- [ ] Asistencia diaria persistida + PDF liquidación
- [ ] App Android más allá del stub

### Transfer a NominappEmpresas

```bash
./scripts/transfer-foundation.sh
# o:
git clone --branch km21/empresas-foundation-ae8e https://github.com/K4MIKAZ3/NominaCO-Pro.git /tmp/ne
cd /tmp/ne && git push --force https://github.com/K4MIKAZ3/NominappEmpresas.git HEAD:main
```

Luego Redeploy en Vercel (Root Directory = `apps/web`).

Deploy: `docs/DEPLOY.md` · Arquitectura: `docs/ARCHITECTURE.md` · Producto: `docs/PRODUCT.md`.
