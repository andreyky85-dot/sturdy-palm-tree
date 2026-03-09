# Content Multiplier — оба: локальный запуск и деплой на Vercel
# Запуск: .\scripts\run-both.ps1

$ErrorActionPreference = "Stop"
$root = (Get-Item $PSScriptRoot).Parent.FullName
Set-Location $root

Write-Host "=== 1. Установка и миграции ===" -ForegroundColor Cyan
npm install
npx prisma generate
if (-not (Test-Path ".env.local")) {
    Write-Host "Создайте .env.local из .env.example и заполните ключи." -ForegroundColor Yellow
    exit 1
}
npx prisma migrate dev --name init

Write-Host "`n=== 2. Локальный запуск (dev-сервер) ===" -ForegroundColor Green
Write-Host "Откройте http://localhost:3000  Для остановки: Ctrl+C" -ForegroundColor Green
npm run dev
