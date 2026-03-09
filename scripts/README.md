# Скрипты

- **run-both.ps1** — оба в одном: установка, миграции, запуск `npm run dev` (локально). Остановка сервера: Ctrl+C.
- **run-both-with-deploy.ps1** — установка, миграции и сразу деплой на Vercel (`vercel --prod`). Переменные задайте в дашборде Vercel.
- **local-run.ps1** — только локально: установка, миграции, `npm run dev`.
- **vercel-deploy.ps1** — только деплой на Vercel.

Запуск из корня проекта:
```powershell
.\scripts\run-both.ps1
# или
.\scripts\run-both-with-deploy.ps1
```

В обычном терминале (не PowerShell) можно выполнить вручную:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Деплой: `vercel --prod` (после `vercel login` и настройки проекта).
