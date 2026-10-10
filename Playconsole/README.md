# Play Console — AAB de publicación

Paquete: `com.vcprojects.nominapp`  
Target / compile SDK: **36**  
Firmado con el keystore de producción (GitHub Secrets).  
**Sin** `REQUEST_INSTALL_PACKAGES` (actualizaciones vía Google Play).

## Archivo actual

`NominaCO-Pro-v1.7.36-play.aab` — **versionCode 47**  
Generado por el workflow **Build Play Store AAB** (`rama play-store`).

## Cómo subir a Play Console

1. Play Console → app con package name `com.vcprojects.nominapp`.
2. Prueba interna → Crear versión → subir este `.aab` (código **47**).
3. Advertencia de desofuscación: ignórala (no usamos R8/Proguard).
4. Política de privacidad: `https://www.nominapp.xyz/privacidad`

Para regenerar: push a `play-store` o Actions → **Build Play Store AAB** → Run workflow, luego reemplaza el `.aab` de esta carpeta.
