# Content Multiplier

SaaS: turn one YouTube (or TikTok) video into multiple social posts — Twitter, LinkedIn, TikTok ideas, blog summary.

## Stack

- **Next.js 14** (App Router), TypeScript, Tailwind CSS
- **OpenAI** (GPT) for content generation
- **youtube-transcript** for YouTube captions
- **Stripe** for Pro subscriptions ($19/mo)
- **NextAuth** with Google
- **Prisma** + PostgreSQL (local and Vercel)

## Setup (локально)

1. Скопируйте env и заполните:

```bash
cp .env.example .env.local
```

В `.env.local` нужны:

- `OPENAI_API_KEY` — ключ OpenAI
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`
- `NEXTAUTH_URL` (например `http://localhost:3000`), `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL` — строка подключения PostgreSQL (Neon, Supabase, Docker или локальный сервер)

2. Stripe: в дашборде создайте продукт «Pro» и цену $19/мес, подставьте Price ID в `STRIPE_PRO_PRICE_ID`.

3. Миграции и запуск:

```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

Либо из PowerShell: `.\scripts\local-run.ps1` (см. `scripts/README.md`).

Откройте [http://localhost:3000](http://localhost:3000).

## 4. Деплой на Vercel (пошагово)

### 4.1 Репозиторий и проект

1. Залийте код в GitHub/GitLab/Bitbucket.
2. Зайдите на [vercel.com](https://vercel.com) → Add New → Project → импортируйте репозиторий.
3. Framework Preset: Next.js. Root Directory: оставьте пустым. Build Command и Output оставьте по умолчанию (в проекте задано в `vercel.json`).

### 4.2 База данных (Vercel Postgres)

1. В проекте Vercel: вкладка **Storage** → Create Database → **Postgres** (Vercel Postgres).
2. Подключите хранилище к проекту приложения (Connect to Project).
3. Переменная `DATABASE_URL` (и при необходимости `POSTGRES_URL`) подтянется в Environment Variables автоматически.

Если используете внешний Postgres (Neon, Supabase, Railway): создайте базу, скопируйте connection string и вручную добавьте в Vercel переменную `DATABASE_URL`.

### 4.3 Переменные окружения в Vercel

В проекте Vercel: **Settings → Environment Variables**. Добавьте переменные (список имён — в файле `env.vercel.example`). Для Production, Preview и Development отметьте нужные окружения:

| Переменная | Описание |
|------------|----------|
| `DATABASE_URL` | Подставляется из Vercel Postgres или вставьте свою Postgres URL |
| `OPENAI_API_KEY` | Ключ OpenAI API |
| `STRIPE_SECRET_KEY` | Секретный ключ Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Публичный ключ Stripe |
| `STRIPE_WEBHOOK_SECRET` | Секрет webhook (см. п. 4.5) |
| `STRIPE_PRO_PRICE_ID` | Price ID тарифа Pro ($19/мес) |
| `NEXTAUTH_URL` | **https://ваш-домен.vercel.app** (без слэша в конце) |
| `NEXTAUTH_SECRET` | Случайная строка (например `openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID (Google Cloud Console) |
| `GOOGLE_CLIENT_SECRET` | Client Secret приложения Google |
| `NEXT_PUBLIC_APP_URL` | То же, что `NEXTAUTH_URL` (для OG-ссылок и canonical) |

### 4.4 Сборка и миграции

В `vercel.json` задано:

- `buildCommand`: `prisma generate && prisma migrate deploy && next build`

При каждом деплое выполняются миграции Prisma к вашей production-базе. Первый деплой создаст таблицы.

### 4.5 Stripe Webhook

1. [Stripe Dashboard](https://dashboard.stripe.com/webhooks) → Add endpoint.
2. **Endpoint URL:** `https://ваш-домен.vercel.app/api/stripe/webhook`
3. **Events to send:** выберите:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. После создания скопируйте **Signing secret** (начинается с `whsec_`) и добавьте в Vercel как `STRIPE_WEBHOOK_SECRET`.

### 4.6 Google OAuth для продакшена

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → ваш OAuth 2.0 Client ID.
2. В **Authorized redirect URIs** добавьте:  
   `https://ваш-домен.vercel.app/api/auth/callback/google`
3. В переменных Vercel уже должны быть `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET`.

### 4.7 Деплой

Нажмите **Deploy**. Дождитесь окончания сборки (в логах должны пройти `prisma generate`, `prisma migrate deploy`, `next build`).

### 4.8 Чеклист после деплоя

- [ ] Открыть **https://ваш-домен.vercel.app** — лендинг грузится.
- [ ] **Sign in with Google** — вход работает (если добавлен redirect URI в п. 4.6).
- [ ] Страница **Generator** — вставить YouTube-ссылку, нажать Generate, приходят посты.
- [ ] **Dashboard** — отображаются данные пользователя и использование.
- [ ] Кнопка **Upgrade to Pro** — редирект на Stripe Checkout (нужен `STRIPE_PRO_PRICE_ID`).
- [ ] В Stripe добавлен webhook (п. 4.5), в Vercel задан `STRIPE_WEBHOOK_SECRET`.
- [ ] При необходимости обновить `NEXTAUTH_URL` и `NEXT_PUBLIC_APP_URL` на кастомный домен.

---

## SEO и маркетинг

- Мета-теги, OG и Twitter Card заданы в `app/layout.tsx`. Для продакшена укажите `NEXT_PUBLIC_APP_URL`.
- Добавьте `public/og.png` (1200×630) для превью в соцсетях.

## Лимиты

- **Free:** 5 генераций в месяц.
- **Pro:** без лимита, $19/мес через Stripe.
