$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot
mvn -gs .mvn/global-settings.xml -s maven-user-settings.xml clean package -DskipTests
