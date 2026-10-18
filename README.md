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

## Estado

Ver `docs/LEGAL_VALIDATION_2026.md` (corroboración de decretos/leyes antes del motor).
