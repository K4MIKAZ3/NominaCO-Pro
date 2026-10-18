# Validación legal Colombia — octubre 2026

Corroboración del motor de nómina frente a fuentes oficiales, antes de construir Nominapp Empresas.
`NominaCO-Pro` **no se modifica**; este documento alimenta `packages/payroll-engine` y `legal_parameters`.

## Resumen ejecutivo

| Parámetro | Valor en motor actual (personal) | Fuente oficial | Estado |
| --- | --- | --- | --- |
| SMMLV 2026 | $1.750.905 | Decreto 1469/2025; Decreto 159/2026 (transitorio) | OK |
| Auxilio transporte | $249.095 | Decreto 1470/2025 | OK |
| Tope auxilio | 2 × SMMLV | Decreto 1470/2025 | OK |
| UVT 2026 | $52.374 | DIAN Res. 000238/2025 | OK |
| Salud / pensión trabajador | 4 % / 4 % | CST / sistema de seguridad social | OK |
| IBC sin auxilio de transporte | Android `main` sí; web `payrollEngine.ts` aún usa `gross` | Auxilio no es base de cotización | **Corregir en Empresas** (web personal divergente) |
| Jornada nocturna | 19:00–06:00, +35 % | Ley 2466/2025 art. 10 (vigente desde 25-dic-2025) | OK |
| Extra diurna / nocturna | +25 % / +75 % | CST art. 168 | OK |
| Dominical/festivo | 80 % → 90 % → 100 % (jul-2025 / jul-2026 / jul-2027) | Ley 2466/2025 art. 14 | OK |
| Jornada semanal | 44 h hasta 14-jul-2026; 42 h desde 15-jul-2026 | Ley 2101/2021 | OK |
| Festivos 2026 | 18 fechas | — | **FALTA 2026-07-13** (Ley 2578/2026) |
| Intereses cesantías | 12 % anual | Ley 52/1975 | OK |
| Año comercial prestaciones | 360 días | CST | OK |

### Hallazgo crítico

Falta el festivo nacional **Nuestra Señora del Rosario de Chiquinquirá**:
- Norma: **Ley 2578 de 2026**, art. 6 (conmemoración 9 de julio; descanso por Ley Emiliani).
- Descanso en 2026: **lunes 13 de julio de 2026**.
- Confirmado por Banco de la República (GE-0203-2026) y Rama Judicial (Circular PCSJC26-26).
- Impacto: dominical/festivo remunerado y recargos de ese día quedan mal en el calendario actual.

En Empresas el festivo entra como fila versionada en `legal_parameters` / `official_holidays`, no como constante olvidable.

### Nota MinJusticia

La ficha del MinJusticia sobre recargo dominical tiene un typo (dos líneas con “1º de julio de 2026”). Se sigue el texto de la **Ley 2466**: 90 % desde 1-jul-2026 y 100 % desde 1-jul-2027.

## Fuentes

1. Decreto 1470 de 2025 — auxilio de transporte $249.095  
2. Decreto 159 de 2026 — SMMLV transitorio $1.750.905  
3. DIAN Resolución 000238 de 2025 — UVT $52.374  
4. Ley 2466 de 2025 — nocturna 19:00, recargo dominical gradual  
5. Ley 2101 de 2021 — reducción jornada a 42 h  
6. Ley 2578 de 2026 — festivo Chiquinquirá  
7. Ley 52 de 1975 — intereses cesantías 12 %

## Decisiones de diseño para Empresas

1. Un solo motor: `packages/payroll-engine` (TypeScript puro).  
2. Parámetros legales como **snapshots por vigencia** (`legal_parameters`), no constantes hardcodeadas.  
3. IBC = suma de conceptos salariales **excluyendo** código `ST` (auxilio).  
4. Festivos como tabla por año + reglas Emiliani donde aplique.  
5. Dominical gradual modelado por filas de vigencia, no por `if` en código.

## Producto

| Campo | Valor |
| --- | --- |
| Repo | `NominappEmpresas` (nuevo; pendiente crear en GitHub) |
| Dominio web | `empresas.nominapp.xyz` |
| Android `applicationId` | `com.vcco.nominapp.empresas` |
| BD | Proyecto Supabase **nuevo** |
| Relación con Nominapp personal | Solo referencia conceptual; cero código/BD compartidos |
