param(
    [string]$ServerPort = "8081",
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

$params = @{
    ServerPort = $ServerPort
}

if ($DbHost) { $params.DbHost = $DbHost }
if ($DbPort) { $params.DbPort = $DbPort }
if ($DbName) { $params.DbName = $DbName }
if ($DbUsername) { $params.DbUsername = $DbUsername }
if ($DbPassword) { $params.DbPassword = $DbPassword }
if ($RedisHost) { $params.RedisHost = $RedisHost }
if ($RedisPort) { $params.RedisPort = $RedisPort }
if ($RedisDatabase) { $params.RedisDatabase = $RedisDatabase }
if ($MinioEndpoint) { $params.MinioEndpoint = $MinioEndpoint }
if ($MinioAccessKey) { $params.MinioAccessKey = $MinioAccessKey }
if ($MinioSecretKey) { $params.MinioSecretKey = $MinioSecretKey }
if ($MinioBucketName) { $params.MinioBucketName = $MinioBucketName }

& "$PSScriptRoot\run-admin.ps1" @params
