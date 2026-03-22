# Как задать DATABASE_URL на Vercel (чтобы прошла сборка с Prisma)

Сборка вызывает `prisma migrate deploy`. Ему нужна строка подключения **в окружении этапа Build**. Если в логе: «БД не видна на этапе Build» — в момент сборки в проекте **нет ни одной** переменной с `postgres://` / `postgresql://`.

---

## Где взять «полную строку» (connection string)

Это **одна длинная строка** без переносов, обычно начинается с `postgres://` или `postgresql://`, внутри — логин, пароль, хост, порт, имя базы и иногда `?sslmode=require`. Её **не придумывают** — её **копируют** из панели провайдера БД (ниже по шагам).

После копирования вы вставляете её **целиком** в Vercel → **Environment Variables** → поле **Value** для переменной `DATABASE_URL`.

---

## Вариант A — база создана в Vercel (Storage)

1. Зайдите на [vercel.com](https://vercel.com) → выберите **проект** (не аккаунт целиком).
2. Верхнее меню проекта → **Storage**.
3. Откройте существующую **Postgres** или **Create Database** → Postgres → привяжите к этому же проекту (**Connect**).
4. Откройте **карточку созданной базы** (клик по названию Postgres в списке Storage). Дальше интерфейс может чуть отличаться, ищите одно из мест:
   - вкладка или блок **.env.local** / **.env** — там несколько строк; вам нужна строка, где слева **`POSTGRES_URL`** или **`DATABASE_URL`** или **`POSTGRES_PRISMA_URL`**, а справа — длинный URI; **скопируйте только значение** (всё после `=`);
   - или раздел **Quickstart** / **Connect** / **Getting started** — часто есть переключатель **Prisma** / **Node**; покажется пример с `postgres://...` — скопируйте эту строку;
   - или **Connection string** / **URI** — одна строка для подключения.
5. Вставка в Vercel (уже не в Storage, а в переменные приложения): **Settings** (шестерёнка **проекта приложения**, не отдельно только Storage) → слева **Environment Variables** → **Add New**:
   - **Key:** `DATABASE_URL`
   - **Value:** вставьте строку целиком
   - **Environments:** включите **Production** (галочка). Для превью-веток включите **Preview**, если нужно.
6. **Save** → вкладка **Deployments** → у последнего деплоя **⋯** → **Redeploy**.

Проверка: **Settings** → **Environment Variables** — в списке должна быть строка `DATABASE_URL` (значение скрыто). Если списка переменных почти нет — вы не в том проекте или не сохранили.

## Вариант B1 — Neon (neon.tech)

1. Откройте [console.neon.tech](https://console.neon.tech) и войдите.
2. Выберите **Project** (проект), внутри — **branch** обычно `main` / `production`.
3. Справа или сверху откройте блок **Connection details** / **Dashboard** с параметрами подключения.
4. Найдите поле **Connection string** (иногда выпадающий список: выберите **URI** или **Pooled connection**).
5. Нажмите **Copy** рядом со строкой — скопируется `postgresql://user:...@...neon.tech/neondb?sslmode=require` (вид может отличаться).
6. Эту строку вставьте в Vercel как **`DATABASE_URL`** (см. вариант A, шаг 5–6).

## Вариант B2 — Supabase

1. Откройте [supabase.com/dashboard](https://supabase.com/dashboard) → ваш **Project**.
2. Слева: **Project Settings** (иконка шестерёнки внизу бокового меню) → раздел **Database**.
3. Прокрутите до **Connection string** / **Connection parameters**.
4. Выберите вкладку или режим **URI** (не «Session mode» для JDBC, если есть выбор — для Prisma обычно нужен **Transaction** или обычный **URI**).
5. Скопируйте строку вида `postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-....pooler.supabase.com:6543/postgres` (пароль подставьте из поля **Database password**, если интерфейс просит сгенерировать/показать пароль отдельно).
6. Вставьте в Vercel как **`DATABASE_URL`**.

Важно: для Prisma нужна именно **Postgres URI**, не **Project URL** вида `https://xxxx.supabase.co` (это HTTP API, не подходит).

## Вариант B3 — Railway

1. [railway.app](https://railway.app) → проект → сервис **Postgres**.
2. Вкладка **Variables** или **Connect** — переменная **`DATABASE_URL`** или **`DATABASE_PUBLIC_URL`** уже может быть сгенерирована; скопируйте значение.
3. Либо **Data** → **Connect** → Postgres connection string.

## Вариант B4 — Любой другой Postgres

Ищите в панели хостинга разделы: **Connection**, **Connect**, **Credentials**, **Connection string**, **URI**. Нужна одна строка, начинающаяся с `postgres` + `://`.

После копирования: Vercel → **проект** → **Settings** → **Environment Variables** → **Add** → `DATABASE_URL` = вставка → **Production** → **Save** → **Redeploy**.

## Частые ошибки

| Симптом | Что проверить |
|--------|----------------|
| Переменные есть, сборка их «не видит» | Для этой переменной включён ли **Production**? Иногда добавляют только **Development**. |
| Деплой Preview, а `DATABASE_URL` только в Production | Либо добавьте ту же переменную для **Preview**, либо деплойте **Production**. В логе сборки скрипт печатает `VERCEL_ENV` — сверьте с тем, для какого окружения в Vercel включена переменная. |
| В Storage база есть, в Env пусто | Строку всё равно нужно **вручную** добавить в **Environment Variables** (см. шаг 5 варианта A). |
| Есть только `DIRECT_URL` (Prisma с пулером) | Добавьте в Vercel **`DIRECT_URL`** с непулинговым `postgresql://…` — скрипт `build:vercel` подхватит её для migrate, если `DATABASE_URL` нет. |
| Есть только `PGHOST`, `PGUSER`, … без одного URI | Скрипт сборки соберёт `postgresql://` из `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, опционально `PGPORT` и `PGSSLMODE=require`. |
| Строка не начинается с `postgres` | Нужна именно URI Postgres, не HTTP API Supabase. |

## Временный обход: сборка без миграций

Если строку БД **нельзя** выдать на Build (политика команды), в Vercel добавьте переменную:

- **Key:** `PRISMA_BUILD_SKIP_MIGRATE`
- **Value:** `1`
- **Environments:** Production (и Preview при необходимости)

Тогда на сборке выполнятся только `prisma generate` и `next build`. **Таблицы нужно создать отдельно**, иначе приложение упадёт при обращении к БД:

```bash
# На своём ПК, один раз после первого деплоя:
set DATABASE_URL=postgresql://...ваша_прод_строка...
npx prisma migrate deploy
```

(В PowerShell: `$env:DATABASE_URL="..."; npx prisma migrate deploy`.)

После успешных миграций лучше убрать `PRISMA_BUILD_SKIP_MIGRATE` и добавить нормальный `DATABASE_URL` на Build.
