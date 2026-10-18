# Arquitectura Nominapp Empresas

## Capas

| Capa | Ubicación | Rol |
| --- | --- | --- |
| Motor | `packages/payroll-engine` | Liquidación pura TS (horas, IBC, aportes, prestaciones) |
| Web | `apps/web` | Panel empleador Next.js → `empresas.nominapp.xyz` |
| Android | `apps/android` | Stub; `applicationId` `com.vcco.nominapp.empresas` |
| Datos | `supabase/` | `legal_parameters`, multi-empresa, RLS |

## Motor

- Entrada: `EmployeeProfile`, `WorkDayEntry[]`, festivos manuales, `LegalSnapshot[]`.
- Salida: `MonthlyPayroll` con `grossTotal`, **`ibcTotal`** (sin código `ST`), deducciones y neto.
- Snapshots 2026 semilla: H1 (44h / 80%), jul-early (44h / 90%), H2 (42h / 90% + Chiquinquirá).

## Módulos web (App Router)

| Ruta | Propósito |
| --- | --- |
| `/` | Landing marketing |
| `/login` | Auth (demo → Supabase) |
| `/dashboard` | Resumen empresa activa |
| `/companies` | Multi-tenant |
| `/employees` | Contratos y salarios |
| `/payroll` | Períodos + preview motor |
| `/legal` | Vigencias y festivos |
| `/settings` | Preferencias panel |

## Diseño

- Marca: forest / sand / cyan.
- Tipografía: Fraunces (marca) + DM Sans (UI).
- Distinto de Nominapp personal; sin tema púrpura ni cream+terracotta genérico.

## Separación

NominaCO-Pro (personal) queda congelada. Cero BD, package o dominio compartido.
