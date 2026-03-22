# Автоматизация релиза после правки CHANGELOG.md (Windows PowerShell).
#
# Пример:
#   .\scripts\release.ps1 -Version 1.0.1
#   .\scripts\release.ps1 -Version 1.0.1 -Branch develop
#   .\scripts\release.ps1 -Version 1.0.1 -DryRun
#
# Если скрипт не запускается: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$')]
    [string] $Version,

    [string] $Branch = "main",

    [switch] $DryRun
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Assert-LastExit {
    param([int] $Code = $LASTEXITCODE)
    if ($null -ne $Code -and $Code -ne 0) {
        throw "Команда завершилась с кодом $Code"
    }
}

function Invoke-Npm {
    param([string[]] $NpmArgs)
    if ($DryRun) {
        Write-Host "[dry-run] npm $($NpmArgs -join ' ')" -ForegroundColor Cyan
        return
    }
    Write-Host "+ npm $($NpmArgs -join ' ')" -ForegroundColor DarkGray
    & npm @NpmArgs
    Assert-LastExit
}

function Invoke-Git {
    param([string[]] $GitArgs)
    if ($DryRun) {
        Write-Host "[dry-run] git $($GitArgs -join ' ')" -ForegroundColor Cyan
        return
    }
    Write-Host "+ git $($GitArgs -join ' ')" -ForegroundColor DarkGray
    & git @GitArgs
    Assert-LastExit
}

Write-Host "Версия: $Version | ветка: $Branch"
if (-not $DryRun) {
    Write-Host "Убедитесь, что в CHANGELOG.md есть секция ## [$Version]"
    $ok = Read-Host "Продолжить? [y/N]"
    if ($ok -notmatch '^[yY]$') {
        Write-Host "Отменено."
        exit 0
    }
}

Invoke-Npm @("run", "release:bump", "--", $Version)
Invoke-Npm @("run", "release:verify", "--", $Version)
Invoke-Git @("add", "CHANGELOG.md", "package.json", "package-lock.json")
Invoke-Git @("commit", "-m", "chore: release $Version")
Invoke-Git @("push", "origin", $Branch)
Invoke-Git @("tag", "-a", "v$Version", "-m", "Release $Version")
Invoke-Git @("push", "origin", "v$Version")

if ($DryRun) {
    Write-Host "Dry-run завершён. Запустите без -DryRun после правки CHANGELOG." -ForegroundColor Yellow
}
else {
    Write-Host "Готово. Проверьте Actions и Releases на GitHub." -ForegroundColor Green
}
