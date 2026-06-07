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

- **Login con Supabase** (correo/contraseña, sesión persistente)
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

### Supabase (login)

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard)
2. En **Authentication → Providers**, activa **Email**
3. Copia **Project URL** y **anon public key**
4. Crea `local.properties` (ver `local.properties.example`):

```properties
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

Para CI, añade secrets `SUPABASE_URL` y `SUPABASE_ANON_KEY` en GitHub. Sin ellos, la app funciona en modo solo local (sin pantalla de login).

## CI

Cada push a `main` genera una APK firmada instalable como artefacto de GitHub Actions.

### Actualizaciones sin desinstalar

Todas las APK de CI usan **el mismo keystore** (GitHub Secrets). Así puedes instalar una versión nueva encima de la anterior si:

- El `applicationId` no cambia (`com.nominacopro`)
- El `versionCode` sube en cada release
- La APK anterior fue firmada con el mismo certificado

**Configuración única (ya hecha en el repo):**

1. Actions → **Setup release signing (once)** → Run workflow
2. Descarga el artefacto `release-keystore-setup`
3. Ejecuta: `.\scripts\setup-github-secrets.ps1 -KeystorePath ".\release.keystore"`

Guarda `release.keystore` en un lugar seguro. Si instalaste una APK de CI **antes** de este keystore fijo, desinstala **una vez** y vuelve a instalar.

## Descargo

Esta app es una herramienta de apoyo personal. No sustituye asesoría contable ni legal oficial.
