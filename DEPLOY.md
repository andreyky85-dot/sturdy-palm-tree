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

3. **База (до первого успешного деплоя с миграциями):** вкладка **Storage** → **Create Database** → **Postgres** → **Connect to Project**.

   **Если сборка пишет «не задана строка подключения»:** в списке переменных проекта иногда нет `DATABASE_URL` на этапе **Build**. Тогда вручную:
   - откройте **Storage** → вашу базу → скопируйте **Connection string** (или блок из вкладки **.env**);
   - **Settings** → **Environment Variables** → **Add** → имя **`DATABASE_URL`**, значение — скопированная строка (`postgres://...` или `postgresql://...`);
   - отметьте **Production** (и при необходимости **Preview**);
   - **Save** → **Deployments** → **Redeploy**.

   Скрипт `scripts/vercel-build.mjs` также пробует `POSTGRES_PRISMA_URL`, `POSTGRES_URL` и другие типичные имена, если они реально попадают в env сборки.

   Если сборка всё равно не видит БД — пошаговая памятка: **`docs/VERCEL_DATABASE_URL.md`** (в т.ч. обход `PRISMA_BUILD_SKIP_MIGRATE`).

4. **Переменные (обязательный минимум):** **Settings** → **Environment Variables**:
   - `NEXTAUTH_URL` = **https://ваш-домен.vercel.app** (без слэша в конце; после кастомного домена обновите)
   - `NEXT_PUBLIC_APP_URL` = то же значение
   - `NEXTAUTH_SECRET` (например `openssl rand -base64 32`, длина ≥ 32 символов)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

   **Опционально:**
   - `OPENAI_API_KEY` — без ключа генератор работает в шаблонном режиме
   - `BILLING_ENABLED=false` или не задавать; Stripe-ключи и webhook — только если включаете оплату (`BILLING_ENABLED=true`), см. `env.vercel.example`

5. **Deploy:** нажмите **Deploy**. Команда сборки из `vercel.json`: **`npm run build:vercel`** (скрипт `scripts/vercel-build.mjs`: при отсутствии `DATABASE_URL` подставляет `POSTGRES_PRISMA_URL` / `POSTGRES_URL`, затем `prisma generate` → **`prisma migrate deploy`** → `next build`). В логах должны быть эти этапы. Если сборка падает с **P1012** / «Environment variable not found: DATABASE_URL» — не задана БД для Production. Если **P1001** — строка есть, но сервер БД недоступен с Vercel (неверный host, firewall, только локальный Postgres).

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
