# Producto Nominapp Empresas

## Identidad

| Campo | Valor |
| --- | --- |
| Nombre | Nominapp Empresas |
| Dominio web | `empresas.nominapp.xyz` |
| Android `applicationId` | `com.vcco.nominapp.empresas` |
| Repo | `NominappEmpresas` |
| BD | Proyecto Supabase nuevo |

## Separación de Nominapp personal

| | Personal (`NominaCO-Pro`) | Empresas |
| --- | --- | --- |
| Repo | Intacta / congelada | Nuevo |
| Package Android | `com.vcprojects.nominapp` | `com.vcco.nominapp.empresas` |
| Dominio | nominapp.xyz | empresas.nominapp.xyz |
| BD | Supabase actual | Proyecto nuevo |
| Tenant | `user_id` | `company_id` + roles |

## Fases (resumen)

1. Validación legal + motor TS (`packages/payroll-engine`) — **listo (foundation)**
2. Esquema multi-empresa + RLS — **migración 0002 lista**
3. Panel web empleador — **shell + módulos demo**
4. App Android trabajador/empleador — stub
5. PDF / liquidaciones / períodos
6. Decisión sobre modo personal (recomendación: no incluir por ahora)

## Diseño UI

- Forest profundo + arena cálida + acento cyan
- Fraunces (marca) / DM Sans (UI)
- Dominio de marca: `empresas.nominapp.xyz`
