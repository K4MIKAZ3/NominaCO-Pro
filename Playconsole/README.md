# Play Console — AAB de publicación

Paquete: `com.vcprojects.nominapp`  
Target SDK: 35  
Firmado con el keystore de producción (GitHub Secrets).

## Archivo actual

`NominaCO-Pro-v1.7.33-play.aab` — generado por el workflow **Build Play Store AAB** (`rama play-store`).

## Cómo subir a Play Console

1. Play Console → crear app con package name `com.vcprojects.nominapp`.
2. Prueba interna → Crear versión → subir este `.aab`.
3. Activar Play App Signing con la misma clave de carga del repo.

Para regenerar: push a `play-store` o Actions → **Build Play Store AAB** → Run workflow, luego reemplaza el `.aab` de esta carpeta.
