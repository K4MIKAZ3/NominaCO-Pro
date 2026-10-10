# Play Store — estrategia de rama `play-store`

Este repositorio prepara la publicación en Google Play **sin alterar** el flujo de sideload APK en `main`.

## Ramas

| Rama | Propósito | CI |
|------|-----------|-----|
| `main` | APK firmado para sideload (SDK 34, términos, QR Bre-B) | `build.yml` → `assembleRelease` → `NominaCO-Pro-v*-signed.apk` |
| `play-store` | Requisitos Play Console (SDK 35, AAB) | `play-store.yml` → `bundleRelease` → `NominaCO-Pro-v*-play.aab` |

Los cambios de Play Store se desarrollan y prueban en `play-store`. `main` sigue igual hasta que decidas fusionar de forma explícita.

## Misma app Android

- **applicationId (package name):** `com.vcprojects.nominapp`.
- **Keystore:** el mismo `release.keystore` / secrets de GitHub que usa `build.yml`.
- Un repo nuevo **no** crea otra app en Play: la identidad la define el `applicationId` y la firma, no el repositorio Git.
- Cambiar el `applicationId` otra vez crea una app distinta en Play y en el dispositivo (no actualiza instalaciones previas).

## Qué SÍ rompe instalaciones existentes

- Cambiar `applicationId` → Play y sideload serían apps distintas; no se actualizan entre sí.
- Cambiar keystore sin subir la nueva clave en Play Console → actualizaciones rechazadas; usuarios no pueden instalar encima.
- Migraciones de base de datos destructivas o forzadas sin compatibilidad hacia atrás.

## Qué NO rompe instalaciones existentes

Estos cambios solo afectan **nuevas builds**; los APK ya instalados siguen funcionando:

- Subir `targetSdk` / `compileSdk` (p. ej. 35).
- Enlace de política de privacidad, flujo de eliminación de cuenta, metadatos de Play Console.
- Generar AAB en lugar de APK para subir a Play.
- Ajustes de permisos declarados (revisar en dispositivos reales antes de publicar).

## Checklist antes de publicar

- [x] `targetSdk` ≥ 36 (requisito Play vigente para apps nuevas).
- [x] AAB firmado con el keystore de producción (`bundleRelease`) — ver carpeta `Playconsole/`.
- [x] URL de política de privacidad pública (`https://nominapp.xyz/terminos`).
- [x] Eliminación de cuenta accesible desde la app (si aplica).
- [x] Enlace a términos/privacidad en la app (registro + ajustes).
- [ ] Ficha Play: icono 512×512, capturas, descripción, categoría.
- [ ] Subir AAB a **Internal testing** antes de producción.

Nota: la advertencia de «archivo de desofuscación» es normal si `isMinifyEnabled = false` (no usamos R8/Proguard). No bloquea la publicación.

La build de `play-store` **no** incluye `REQUEST_INSTALL_PACKAGES` ni actualización OTA por APK: las actualizaciones las gestiona Google Play.

## Trabajo local en paralelo (opcional)

Sin segundo remoto ni segundo repo:

```bash
git worktree add ../NominaCO-Pro-play-store play-store
```

Editas Play Store en la carpeta del worktree; `main` en la raíz del repo queda intacto.

## Fusionar a `main`

Cuando Play esté listo y quieras un solo código base:

1. Revisar diff `main..play-store`.
2. Fusionar o cherry-pick solo lo necesario (SDK, políticas, etc.).
3. Decidir si `main` también pasa a generar AAB además de APK, o mantener workflows separados por rama.
