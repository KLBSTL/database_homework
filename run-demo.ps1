param(
    [string]$ServerPort = "8081",
    [string]$AppServerPort = "18082",
    [string]$DbHost,
    [string]$DbPort,
    [string]$DbName,
    [string]$DbUsername,
    [string]$DbPassword,
    [string]$RedisHost,
    [string]$RedisPort,
    [string]$RedisDatabase,
    [string]$MinioEndpoint,
    [string]$MinioAccessKey,
    [string]$MinioSecretKey,
    [string]$MinioBucketName
)

$ErrorActionPreference = "Stop"

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

$adminParams = @{
    ServerPort = $ServerPort
}

$appArgs = @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", (Join-Path $PSScriptRoot "run-app.ps1"),
    "-ServerPort", $AppServerPort
)

function Add-Arg {
    param(
        [ref]$List,
        [string]$Name,
        [string]$Value
    )

    if ($Value) {
        $List.Value += @($Name, $Value)
    }
}

Add-Arg ([ref]$appArgs) "-DbHost" $DbHost
Add-Arg ([ref]$appArgs) "-DbPort" $DbPort
Add-Arg ([ref]$appArgs) "-DbName" $DbName
Add-Arg ([ref]$appArgs) "-DbUsername" $DbUsername
Add-Arg ([ref]$appArgs) "-DbPassword" $DbPassword
Add-Arg ([ref]$appArgs) "-RedisHost" $RedisHost
Add-Arg ([ref]$appArgs) "-RedisPort" $RedisPort
Add-Arg ([ref]$appArgs) "-RedisDatabase" $RedisDatabase

if ($DbHost) { $adminParams.DbHost = $DbHost }
if ($DbPort) { $adminParams.DbPort = $DbPort }
if ($DbName) { $adminParams.DbName = $DbName }
if ($DbUsername) { $adminParams.DbUsername = $DbUsername }
if ($DbPassword) { $adminParams.DbPassword = $DbPassword }
if ($RedisHost) { $adminParams.RedisHost = $RedisHost }
if ($RedisPort) { $adminParams.RedisPort = $RedisPort }
if ($RedisDatabase) { $adminParams.RedisDatabase = $RedisDatabase }
if ($MinioEndpoint) { $adminParams.MinioEndpoint = $MinioEndpoint }
if ($MinioAccessKey) { $adminParams.MinioAccessKey = $MinioAccessKey }
if ($MinioSecretKey) { $adminParams.MinioSecretKey = $MinioSecretKey }
if ($MinioBucketName) { $adminParams.MinioBucketName = $MinioBucketName }

Stop-PortProcess -Port ([int]$ServerPort)
Stop-PortProcess -Port ([int]$AppServerPort)

Write-Host "Starting user service on port $AppServerPort ..."
Start-Process -FilePath "powershell.exe" -ArgumentList $appArgs -WorkingDirectory $PSScriptRoot | Out-Null
Start-Sleep -Seconds 3

Write-Host "Starting admin service on port $ServerPort ..."
& "$PSScriptRoot\run-admin.ps1" @adminParams
