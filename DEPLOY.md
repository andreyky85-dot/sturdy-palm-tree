# Запуск и деплой Content Multiplier

## 1. Локально

Откройте терминал в папке проекта (где лежит `package.json`) и выполните:

```bash
npm install
```

Заполните `.env.local` (ключи OpenAI, Stripe, Google, `DATABASE_URL` для Postgres). Затем:

```bash
npx prisma migrate dev --name init
npm run dev
```

Откройте в браузере: **http://localhost:3000**

---

## 2. Деплой на Vercel

### Вариант A: через сайт Vercel (без CLI)

1. **Репозиторий:** залейте проект в GitHub (или GitLab/Bitbucket).

2. **Vercel:** зайдите на [vercel.com](https://vercel.com) → **Add New** → **Project** → выберите репозиторий → **Import**.

3. **База:** в проекте вкладка **Storage** → **Create Database** → **Postgres** → подключите к проекту (подставится `DATABASE_URL`).

4. **Переменные:** **Settings** → **Environment Variables** — добавьте переменные (полный список в `env.vercel.example`):
   - `OPENAI_API_KEY`
   - `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`
   - `NEXTAUTH_URL` = **https://ваш-домен.vercel.app**
   - `NEXTAUTH_SECRET` (сгенерируйте: `openssl rand -base64 32`)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `NEXT_PUBLIC_APP_URL` = тот же, что `NEXTAUTH_URL`

5. **Deploy:** нажмите **Deploy**. Сборка выполнит `prisma generate`, `prisma migrate deploy` и `next build`.

6. **Stripe Webhook:** после первого деплоя в [Stripe → Webhooks](https://dashboard.stripe.com/webhooks) добавьте:
   - URL: `https://ваш-домен.vercel.app/api/stripe/webhook`
   - События: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Секрет webhook добавьте в Vercel как `STRIPE_WEBHOOK_SECRET`.

7. **Google OAuth:** в Google Cloud Console в настройках OAuth-клиента добавьте redirect URI:
   `https://ваш-домен.vercel.app/api/auth/callback/google`

---

### Вариант B: через Vercel CLI

Установите CLI и залогиньтесь (один раз):

```bash
npm i -g vercel
vercel login
```

В папке проекта:

```bash
vercel
```

Следуйте подсказкам (линкуйте существующий проект или создайте новый). Переменные окружения задайте в веб-интерфейсе Vercel (Settings → Environment Variables) или при первом `vercel` укажите, что будете добавлять их в дашборде.

Продакшен-деплой:

```bash
vercel --prod
```

---

**Чеклист после деплоя:** лендинг открывается → вход через Google работает → генератор возвращает посты → Dashboard показывает usage → Upgrade to Pro ведёт на Stripe → webhook и redirect URI настроены. Подробный чеклист — в README, п. 4.8.
