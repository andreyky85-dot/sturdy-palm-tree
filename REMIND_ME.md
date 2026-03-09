# Напоминание: что доделать для Content Multiplier

Откройте этот файл, когда вернётесь к проекту.

---

## Переменные в `.env.local`

Замените плейсхолдеры на свои ключи:

- [ ] **OPENAI_API_KEY** — взять на https://platform.openai.com/api-keys
- [ ] **STRIPE_SECRET_KEY** — Stripe Dashboard → API keys (секретный)
- [ ] **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** — там же (публичный)
- [ ] **STRIPE_PRO_PRICE_ID** — создать продукт Pro, цену $19/мес, подставить Price ID
- [ ] **STRIPE_WEBHOOK_SECRET** — после создания webhook в Stripe
- [ ] **GOOGLE_CLIENT_ID** и **GOOGLE_CLIENT_SECRET** — Google Cloud Console → Credentials
- [ ] **DATABASE_URL** — строка PostgreSQL (Neon, Supabase или свой сервер)

---

## Перед первым запуском

- [ ] Файл `.env.local` заполнен (см. выше)
- [ ] Выполнить: `npm install` → `npx prisma migrate dev --name init` → `npm run dev`
- [ ] Или запустить: `.\scripts\run-both.ps1`

---

## Перед деплоем на Vercel

- [ ] Код в GitHub
- [ ] В Vercel добавлены все переменные (список в `env.vercel.example`)
- [ ] Подключена БД (Vercel Postgres или своя)
- [ ] В Stripe создан webhook на `https://ваш-домен/api/stripe/webhook`
- [ ] В Google OAuth добавлен redirect: `https://ваш-домен/api/auth/callback/google`

Подробно: **DEPLOY.md** и **README.md** (раздел 4).
