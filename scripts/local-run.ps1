# Content Multiplier — запуск локально
# Запуск: правый клик → Выполнить с PowerShell, или в терминале: .\scripts\local-run.ps1

Set-Location $PSScriptRoot\..

Write-Host "npm install..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (-not (Test-Path ".env.local")) {
    Write-Host "Создайте .env.local (скопируйте из .env.example и заполните ключи)." -ForegroundColor Yellow
    exit 1
}

Write-Host "prisma generate..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "prisma migrate dev..." -ForegroundColor Cyan
npx prisma migrate dev --name init
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "npm run dev..." -ForegroundColor Green
Write-Host "Откройте http://localhost:3000" -ForegroundColor Green
npm run dev
