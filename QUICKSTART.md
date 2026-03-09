# Быстрый старт

## 1. Локально

В терминале в папке проекта:

```bash
cd C:\Users\Admin\Desktop\Projekt2
npm install
npx prisma migrate dev --name init
npm run dev
```

Откройте **http://localhost:3000**

(Перед этим заполните `.env.local` — см. REMIND_ME.md)

---

## 2. Деплой на Vercel

### Вариант А: через сайт

1. Залить код в **GitHub** (git init, add, commit, push).
2. Зайти на **vercel.com** → **Add New** → **Project** → выбрать репозиторий → **Import**.
3. **Storage** → **Create Database** → **Postgres** → подключить к проекту.
4. **Settings** → **Environment Variables** — добавить все переменные из `env.vercel.example` (в т.ч. `NEXTAUTH_URL` = ваш домен после деплоя).
5. **Deploy**.
6. В **Stripe** → Webhooks: URL `https://ваш-домен.vercel.app/api/stripe/webhook`, события checkout.session.completed, customer.subscription.updated/deleted → скопировать секрет в Vercel как `STRIPE_WEBHOOK_SECRET`.
7. В **Google Cloud** → OAuth client → добавить redirect URI: `https://ваш-домен.vercel.app/api/auth/callback/google`.

### Вариант Б: через CLI

```bash
npm i -g vercel
vercel login
cd C:\Users\Admin\Desktop\Projekt2
vercel --prod
```

Переменные задать в дашборде Vercel (Settings → Environment Variables).

---

Подробно: **DEPLOY.md**, **README.md** (раздел 4).
