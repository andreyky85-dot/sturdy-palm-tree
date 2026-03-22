# Запуск и деплой TextFlow

## 1. Локально

Откройте терминал в папке проекта (где лежит `package.json`) и выполните:

```bash
npm install
```

Заполните `.env.local` (минимум: Google OAuth, `NEXTAUTH_*`, `DATABASE_URL`; OpenAI и Stripe — по необходимости). Затем:

```bash
npx prisma migrate dev
npm run dev
```

Если миграций ещё нет (первый клон), создайте их: `npx prisma migrate dev --name init`.

Откройте в браузере: **http://localhost:3000**

---

## 2. Деплой на Vercel

### Вариант A: через сайт Vercel (без CLI)

1. **Репозиторий:** залейте проект в GitHub (или GitLab/Bitbucket).

2. **Vercel:** зайдите на [vercel.com](https://vercel.com) → **Add New** → **Project** → выберите репозиторий → **Import**.

3. **База (до первого успешного деплоя с миграциями):** вкладка **Storage** → **Create Database** → **Postgres** → **Connect to Project**. В Environment Variables появится **`DATABASE_URL`** (или задайте свою строку внешнего Postgres вручную). Без рабочего `DATABASE_URL` шаг `prisma migrate deploy` на сборке завершится ошибкой.

4. **Переменные (обязательный минимум):** **Settings** → **Environment Variables**:
   - `NEXTAUTH_URL` = **https://ваш-домен.vercel.app** (без слэша в конце; после кастомного домена обновите)
   - `NEXT_PUBLIC_APP_URL` = то же значение
   - `NEXTAUTH_SECRET` (например `openssl rand -base64 32`, длина ≥ 32 символов)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

   **Опционально:**
   - `OPENAI_API_KEY` — без ключа генератор работает в шаблонном режиме
   - `BILLING_ENABLED=false` или не задавать; Stripe-ключи и webhook — только если включаете оплату (`BILLING_ENABLED=true`), см. `env.vercel.example`

5. **Deploy:** нажмите **Deploy**. Команда сборки из `vercel.json`: **`npm run build:vercel`** → `prisma generate` → **`prisma migrate deploy`** → `next build`. В логах сборки должны быть эти этапы.

6. **Stripe Webhook** (только при включённом биллинге): после деплоя в [Stripe → Webhooks](https://dashboard.stripe.com/webhooks) добавьте:
   - URL: `https://ваш-домен.vercel.app/api/stripe/webhook`
   - События: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Секрет webhook добавьте в Vercel как `STRIPE_WEBHOOK_SECRET`.

7. **Google OAuth:** в Google Cloud Console в настройках OAuth-клиента добавьте **Authorized redirect URI**:
   `https://ваш-домен.vercel.app/api/auth/callback/google`  
   (замените на прод-домен; для Preview-деплоев при необходимости добавьте отдельный URI с `*.vercel.app`.)

---

**Чеклист после деплоя:** сайт открывается → **Войти через Google** → **Генератор** → **Кабинет** (usage). Stripe — только если `BILLING_ENABLED=true`. Подробнее — раздел 4.8 в `README.md`.

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

## 3. Релизы и маркетинг-бандл (GitHub)

1. Обновите **`CHANGELOG.md`**: добавьте секцию `## [x.y.z] - ГГГГ-ММ-ДД` с пунктами изменений (секция должна совпадать с номером тега без префикса `v`).
2. Создайте и отправьте тег: `git tag v1.0.1 && git push origin v1.0.1`.
3. Запустится workflow **Release & marketing bundle** (`.github/workflows/release-marketing.yml`): создаётся **GitHub Release** с телом из changelog и архив **`textflow-marketing-x.y.z.zip`** с черновиками `twitter.md`, `linkedin.md`, `telegram.md`.
4. Опционально: в репозитории **Settings → Secrets and variables → Actions → Variables** задайте **`MARKETING_SITE_URL`** (ваш прод-домен) — иначе в ссылках используется `https://textflow.app`.

Локальная проверка без тега:

```bash
npm run marketing:bundle -- 1.0.1
```

Полный пошаговый чеклист (CHANGELOG, bump, тег): **`docs/RELEASING.md`**.

---

Итоговый чеклист проверки сайта — **раздел 4.8 в `README.md`**.
