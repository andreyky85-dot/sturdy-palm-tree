# Content Multiplier — деплой на Vercel через CLI
# Убедитесь: 1) код в Git, 2) переменные добавлены в Vercel (Settings → Environment Variables)
# Запуск: .\scripts\vercel-deploy.ps1

Set-Location $PSScriptRoot\..

$hasVercel = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $hasVercel) {
    Write-Host "Установите Vercel CLI: npm i -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host "Деплой на Vercel (production)..." -ForegroundColor Cyan
vercel --prod
