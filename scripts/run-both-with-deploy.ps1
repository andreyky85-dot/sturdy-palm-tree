# Content Multiplier — оба: локальная подготовка + деплой на Vercel
# Сначала установка и миграции, затем деплой (без запуска dev-сервера).
# Запуск: .\scripts\run-both-with-deploy.ps1

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

Write-Host "`n=== 2. Деплой на Vercel ===" -ForegroundColor Green
$hasVercel = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $hasVercel) {
    Write-Host "Установите Vercel CLI: npm i -g vercel" -ForegroundColor Yellow
    Write-Host "Добавьте переменные в дашборде Vercel (Settings -> Environment Variables)." -ForegroundColor Yellow
    exit 1
}
vercel --prod
