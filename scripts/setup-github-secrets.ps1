param(
    [Parameter(Mandatory = $true)]
    [string]$KeystorePath,
    [Parameter(Mandatory = $true)]
    [string]$StorePassword,
    [string]$KeyAlias = "nominacopro",
    [Parameter(Mandatory = $true)]
    [string]$KeyPassword,
    [string]$Repo = "K4MIKAZ3/NominaCO-Pro"
)

if (-not (Test-Path $KeystorePath)) {
    Write-Error "No se encontró: $KeystorePath"
    exit 1
}

$bytes = [System.IO.File]::ReadAllBytes((Resolve-Path $KeystorePath))
$base64 = [Convert]::ToBase64String($bytes)

Write-Host "Configurando secrets en $Repo ..."
gh secret set RELEASE_KEYSTORE_BASE64 --repo $Repo --body $base64
gh secret set RELEASE_STORE_PASSWORD --repo $Repo --body $StorePassword
gh secret set RELEASE_KEY_ALIAS --repo $Repo --body $KeyAlias
gh secret set RELEASE_KEY_PASSWORD --repo $Repo --body $KeyPassword

Write-Host ""
Write-Host "Listo. Los próximos builds de CI usarán la misma firma."
Write-Host "Guarda una copia de release.keystore en un lugar seguro."
