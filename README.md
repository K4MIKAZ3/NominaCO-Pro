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

- [x] Validación legal 2026 (`docs/LEGAL_VALIDATION_2026.md`)
- [x] Motor TS: snapshots, horas, descanso, liquidación, IBC sin ST, prestaciones
- [x] Migraciones: `legal_parameters` + companies/members/employees/RLS
- [x] Panel web: landing, login, dashboard, empresas, empleados, nómina, legal, ajustes
- [x] Cliente Supabase + middleware (`kmkrxyrorksrwmdomfuy`)
- [ ] Aplicar migraciones en SQL Editor + keys en Vercel
- [ ] Deploy Vercel + DNS `empresas.nominapp.xyz`
- [ ] App Android más allá del stub

Deploy: `docs/DEPLOY.md` · Arquitectura: `docs/ARCHITECTURE.md` · Producto: `docs/PRODUCT.md`.
