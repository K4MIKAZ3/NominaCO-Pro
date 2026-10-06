# Builds a debug APK for local testing (no web deploy).
# Requires Android SDK via local.properties / ANDROID_HOME.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$gradle = Join-Path $root "app\build.gradle.kts"
$content = Get-Content -Raw $gradle
if ($content -match 'versionName\s*=\s*"([^"]+)"') {
    $versionName = $Matches[1]
} else {
    $versionName = "test"
}

Write-Host "Building debug APK (v$versionName)..."
& .\gradlew.bat assembleDebug --no-daemon

$apk = Join-Path $root "app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $apk)) {
    throw "APK not found at $apk"
}

$dist = Join-Path $root "dist"
New-Item -ItemType Directory -Force -Path $dist | Out-Null
$dest = Join-Path $dist "Nominapp-v${versionName}-test-debug.apk"
Copy-Item -Force $apk $dest

Write-Host ""
Write-Host "APK listo: $dest"
Write-Host "Firma debug: desinstala la version de la tienda/web antes de instalar, o usa adb install -r."
