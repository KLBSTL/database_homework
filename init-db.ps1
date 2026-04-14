param(
    [string]$DbHost = "127.0.0.1",
    [int]$Port = 3306,
    [string]$User = "root",
    [string]$Password = "123456",
    [string]$Database = "lease",
    [switch]$IncludeData
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$mysql = Get-Command mysql -ErrorAction Stop
$sqlFile = Join-Path $PSScriptRoot "lease.sql"
$sqlText = Get-Content -Raw $sqlFile
$lines = $sqlText -split "`r?`n"
$cleanLines = foreach ($line in $lines) {
    if ($line -match "COMMENT =" -and $line -match "ROW_FORMAT = DYNAMIC;") {
        $line = [System.Text.RegularExpressions.Regex]::Replace(
            $line,
            "\s+COMMENT\s*=\s*.*ROW_FORMAT = DYNAMIC;",
            " ROW_FORMAT = DYNAMIC;"
        )
    }

    if ($line -match "\sCOMMENT\s+'") {
        $line = [System.Text.RegularExpressions.Regex]::Replace(
            $line,
            "\s+COMMENT\s+'.*?([,]?)$",
            '$1'
        )
    }

    if (-not $IncludeData -and $line -match "^\s*INSERT INTO") {
        continue
    }

    $singleQuoteCount = ($line.ToCharArray() | Where-Object { $_ -eq "'" }).Count
    if ($line -match "^\s*INSERT INTO" -and ($singleQuoteCount % 2 -ne 0)) {
        continue
    }
    $line
}
$sqlText = ($cleanLines -join [Environment]::NewLine)
$createDatabaseSql = "CREATE DATABASE IF NOT EXISTS $Database DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

& $mysql.Source -h $DbHost -P $Port -u $User "-p$Password" -e $createDatabaseSql
$sqlText | & $mysql.Source -h $DbHost -P $Port -u $User "-p$Password" $Database --default-character-set=utf8mb4
