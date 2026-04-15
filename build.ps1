$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

function Stop-PortProcess {
    param([int]$Port)

    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($connection in $connections) {
        $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
        if (-not $process) { continue }
        if ($process.ProcessName -notin @("java", "javaw", "powershell", "pwsh")) { continue }
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 300
    }
}

Stop-PortProcess -Port 8081
Stop-PortProcess -Port 8082
Stop-PortProcess -Port 18082

mvn -gs .mvn/global-settings.xml -s maven-user-settings.xml clean package -DskipTests
if ($LASTEXITCODE -ne 0) {
    throw "Maven build failed with exit code $LASTEXITCODE."
}

$runtimeDir = Join-Path $PSScriptRoot ".runtime"
if (-not (Test-Path $runtimeDir)) {
    New-Item -ItemType Directory -Path $runtimeDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$adminSource = Join-Path $PSScriptRoot "web\web-admin\target\web-admin-1.0-SNAPSHOT.jar"
$appSource = Join-Path $PSScriptRoot "web\web-app\target\web-app-1.0-SNAPSHOT.jar"
$adminTarget = Join-Path $runtimeDir "web-admin-$timestamp.jar"
$appTarget = Join-Path $runtimeDir "web-app-$timestamp.jar"

Copy-Item -LiteralPath $adminSource -Destination $adminTarget -Force
Copy-Item -LiteralPath $appSource -Destination $appTarget -Force

Write-Host "Runtime jars prepared:"
Write-Host "  $adminTarget"
Write-Host "  $appTarget"
