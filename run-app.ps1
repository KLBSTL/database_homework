param(
    [string]$ServerPort,
    [string]$DbHost,
    [string]$DbPort,
    [string]$DbName,
    [string]$DbUsername,
    [string]$DbPassword,
    [string]$RedisHost,
    [string]$RedisPort,
    [string]$RedisDatabase,
    [string]$AliyunSmsAccessKeyId,
    [string]$AliyunSmsAccessKeySecret,
    [string]$AliyunSmsEndpoint
)

$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

if ($ServerPort) { $env:SERVER_PORT = $ServerPort }
if ($DbHost) { $env:DB_HOST = $DbHost }
if ($DbPort) { $env:DB_PORT = $DbPort }
if ($DbName) { $env:DB_NAME = $DbName }
if ($DbUsername) { $env:DB_USERNAME = $DbUsername }
if ($DbPassword) { $env:DB_PASSWORD = $DbPassword }
if ($RedisHost) { $env:REDIS_HOST = $RedisHost }
if ($RedisPort) { $env:REDIS_PORT = $RedisPort }
if ($RedisDatabase) { $env:REDIS_DATABASE = $RedisDatabase }
if ($AliyunSmsAccessKeyId) { $env:ALIYUN_SMS_ACCESS_KEY_ID = $AliyunSmsAccessKeyId }
if ($AliyunSmsAccessKeySecret) { $env:ALIYUN_SMS_ACCESS_KEY_SECRET = $AliyunSmsAccessKeySecret }
if ($AliyunSmsEndpoint) { $env:ALIYUN_SMS_ENDPOINT = $AliyunSmsEndpoint }

$runtimeJar = Get-ChildItem -Path (Join-Path $PSScriptRoot ".runtime") -Filter "web-app-*.jar" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

$jarPath = if ($runtimeJar) {
    $runtimeJar.FullName
} else {
    Join-Path $PSScriptRoot "web\\web-app\\target\\web-app-1.0-SNAPSHOT.jar"
}

if (-not (Test-Path $jarPath)) {
    throw "Jar not found: $jarPath. Run build.ps1 first."
}

& java -jar $jarPath
