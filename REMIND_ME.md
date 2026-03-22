# Напоминание: что доделать для TextFlow

Откройте этот файл, когда вернётесь к проекту.

---

## Переменные в `.env.local`

Обязательно для полноценного локального режима:

- [ ] **NEXTAUTH_URL**, **NEXTAUTH_SECRET**, **GOOGLE_CLIENT_ID**, **GOOGLE_CLIENT_SECRET**
- [ ] **DATABASE_URL** — PostgreSQL (Neon, Supabase, Docker и т.д.)

Опционально:

- [ ] **OPENAI_API_KEY** — https://platform.openai.com/api-keys (без ключа — шаблонный ответ генератора)
- [ ] **Stripe** — только если `BILLING_ENABLED=true`: **STRIPE_SECRET_KEY**, **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**, **STRIPE_PRO_PRICE_ID**, **STRIPE_WEBHOOK_SECRET**

---

## Перед первым запуском

- [ ] Файл `.env.local` заполнен (см. выше)
- [ ] Выполнить: `npm install` → `npx prisma migrate dev` (первый раз можно `--name init`) → по желанию `npm run build-assets` → `npm run dev`
- [ ] Или запустить: `.\scripts\run-both.ps1`

---

## Перед деплоем на Vercel

- [ ] Код в GitHub
- [ ] Подключена БД и есть **`DATABASE_URL`** (иначе `npm run build:vercel` на Vercel упадёт на миграциях)
- [ ] В Vercel заданы **NEXTAUTH_***, **GOOGLE_***, **NEXT_PUBLIC_APP_URL** (минимум; полный список — `env.vercel.example`)
- [ ] Миграции применяются **на сборке** (`build:vercel` в `vercel.json`), отдельно `migrate deploy` вручную обычно не нужен
- [ ] В Google OAuth добавлен redirect: `https://ваш-домен/api/auth/callback/google`
- [ ] **Stripe + webhook** — только если включили оплату (`BILLING_ENABLED=true`)

Подробно: **DEPLOY.md** и **README.md** (раздел 4).
