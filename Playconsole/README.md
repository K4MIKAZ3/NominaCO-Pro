# Play Console — AAB de publicación

Paquete: `com.vcprojects.nominapp`  
Target / compile SDK: **36**  
Firmado con el keystore de producción (GitHub Secrets).  
**Sin** `REQUEST_INSTALL_PACKAGES` (actualizaciones vía Google Play).

## Archivo actual

`NominaCO-Pro-v1.7.40-play.aab` — **versionCode 51**  
Generado por el workflow **Build Play Store AAB** (`rama play-store`).

## Novedades de esta versión

- Aviso: no es app del Gobierno + fuentes oficiales (corrección rechazo Play)
- Modo online desde Ajustes (salir del modo offline)
- Centro de notificaciones in-app (jornada + mensajes)

## Cómo subir a Play Console

1. Play Console → app con package name `com.vcprojects.nominapp`.
2. Prueba interna → Crear versión → subir este `.aab` (código **51**).
3. Actualiza la ficha es-419 con el aviso de Gobierno (ver PR #24 / descripción breve).
4. Política de privacidad: `https://www.nominapp.xyz/privacidad`
5. Advertencia de desofuscación: ignórala (no usamos R8/Proguard).

Para regenerar: push a `play-store` o Actions → **Build Play Store AAB** → Run workflow, luego reemplaza el `.aab` de esta carpeta.
