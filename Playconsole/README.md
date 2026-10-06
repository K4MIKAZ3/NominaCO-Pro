# Play Console — AAB de publicación

Paquete: `com.vcprojects.nominapp`  
Target / compile SDK: **36** (requisito Play para apps nuevas)  
Firmado con el keystore de producción (GitHub Secrets).

## Archivo actual

`NominaCO-Pro-v1.7.35-play.aab` — **versionCode 46**  
Generado por el workflow **Build Play Store AAB** (`rama play-store`).

## Cómo subir a Play Console

1. Play Console → app con package name `com.vcprojects.nominapp`.
2. Prueba interna → Crear versión → subir este `.aab` (código **46**).
3. Advertencia de desofuscación: ignórala (no usamos R8/Proguard).
4. Activar Play App Signing con la misma clave de carga del repo.

Para regenerar: push a `play-store` o Actions → **Build Play Store AAB** → Run workflow, luego reemplaza el `.aab` de esta carpeta.
