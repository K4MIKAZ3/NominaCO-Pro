# NominaCO Pro

App Android nativa para liquidación de nómina personal en Colombia, con motor legal actualizado a **2026**.

## Stack

- Kotlin + Jetpack Compose + Material 3
- Room (persistencia local)
- Arquitectura en capas: `domain` → `data` → `ui`

## Marco legal integrado

| Parámetro | Valor 2026 |
|-----------|------------|
| SMMLV | $1.750.905 |
| Auxilio transporte | $249.095 |
| Jornada máxima | 44 h/semana (ene–jun), 42 h (jul–dic) — Ley 2101 |
| Recargo nocturno | 19:00–06:00, +35% — Ley 2466/2025 |
| Recargo dominical/festivo | +80% (H1 2026), +90% (H2 2026) |
| Descuentos empleado | Salud 4% + Pensión 4% |
| Festivos | Calendario oficial 2026 + festivos manuales |

## Funciones

- Calendario mensual con marcas de días trabajados, domingos y festivos
- Registro de jornada por día (entrada/salida, notas, festivo manual)
- Liquidación mensual con desglose de devengados y descuentos
- Perfil laboral (salario, jornada diaria)
- Panel de parámetros legales y gestión de festivos manuales

## Compilar localmente

Requisitos: JDK 17, Android SDK 34.

```bash
./gradlew assembleRelease
```

Para firmar releases locales, copia `keystore.properties.example` a `keystore.properties` y configura tu keystore.

## CI

Cada push a `main` genera una APK firmada instalable como artefacto de GitHub Actions.

## Descargo

Esta app es una herramienta de apoyo personal. No sustituye asesoría contable ni legal oficial.
