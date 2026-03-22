# Чего не хватает и что можно доделать

Документ синхронизирован с текущим кодом. Автоматическая проверка env: `npm run check:env`. CI без секретов: `.github/workflows/ci.yml`.

## Критично для публичного запуска

| Что | Статус | Действие |
|-----|--------|----------|
| OG-картинка | Проверьте `public/og.png` | 1200×630, см. `public/README_ASSETS.md`; `npm run build-assets` |
| Favicon / иконка | `app/icon.png` + при необходимости `public/favicon.ico` | См. `public/README_ASSETS.md` |
| Страница 404 | Сделано | `app/not-found.tsx` |
| Footer, Privacy, Terms | Сделано | `components/Footer.tsx`, `app/privacy`, `app/terms` |
| Sitemap / robots | Сделано | `app/sitemap.ts`, `app/robots.ts` |
| Реальный домен и OAuth | Вручную | `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, redirect URI в Google Cloud |
| Postgres в проде | Вручную | `DATABASE_URL`, миграции, бэкапы у провайдера |

## Продукт и UX

| Что | Статус | Действие |
|-----|--------|----------|
| Генератор только после входа | Сделано | Middleware + CTA на `/login` |
| Скелетон Dashboard | Сделано | `components/dashboard/DashboardClient.tsx` |
| Гостевая генерация без аккаунта | Нет | По желанию: одна пробная по IP/cookie или оставить как есть |
| Отзывы на лендинге | Заглушки | Заменить на реальные или убрать |

## Техническое

| Что | Статус | Действие |
|-----|--------|----------|
| Rate limit по IP | Сделано | Upstash; без `UPSTASH_*` отключён |
| Unit-тесты | Сделано | `npm run test` |
| E2E Playwright | Сделано | `npm run test:e2e`; опционально логин без Google — см. `.env.example` |
| CI (lint, test, build) | Сделано | GitHub Actions, без реальных ключей |
| Проверка `.env` | Сделано | `npm run check:env` |
| Логи ошибок в проде | Желательно | Sentry / аналог |

## Платежи

| Что | Статус | Действие |
|-----|--------|----------|
| Безопасный дефолт | Сделано | `BILLING_ENABLED` не true — без списаний, см. `lib/billing.ts` |
| Включение Stripe | Вручную | Ключи, webhook, `BILLING_ENABLED=true`, проверка Terms |

## Маркетинг

| Что | Статус | Действие |
|-----|--------|----------|
| Релиз + черновики постов | Сделано | Тег `v*`, workflow `release-marketing.yml` |
| Блог / рассылка | Опционально | SEO и лиды |

## Обязательно перед продакшеном (вне репозитория)

- Почта или форма поддержки, согласованная с Privacy/Terms.
- Аналитика (Vercel Analytics, Plausible и т.д.) по желанию.
- Для аудитории ЕС: cookies / согласие и актуализация Privacy.
