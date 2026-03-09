# Чего не хватает и что можно доделать

## Критично для запуска

| Что | Статус | Действие |
|-----|--------|----------|
| OG-картинка для соцсетей | Нет файла | Добавить `public/og.png` (1200×630). См. `public/README_ASSETS.md` |
| Favicon | Нет | Добавить `public/favicon.ico` (см. README_ASSETS.md) |
| Страница 404 | ✅ Сделано | `app/not-found.tsx` |
| Footer на лендинге | ✅ Сделано | `components/Footer.tsx`, ссылки Home, Generator, Privacy, Terms |
| Privacy / Terms | ✅ Сделано | `app/privacy/page.tsx`, `app/terms/page.tsx` |
| Sitemap / robots | ✅ Сделано | `app/sitemap.ts`, `app/robots.ts` |

## Продукт и UX

| Что | Статус | Действие |
|-----|--------|----------|
| TikTok / ручной транскрипт | ✅ Сделано | Вкладка «Paste transcript», API принимает `transcript`, FAQ обновлён. См. `docs/PUNKT2_TIKTOK_TRANSCRIPT.md` |
| Генератор без входа | Нет | Сейчас 401 без логина. Вариант: 1 бесплатная генерация без аккаунта (по IP/cookie) или явный CTA «Войдите, чтобы генерировать» |
| Скелетон загрузки на Dashboard | Нет | Пока только спиннер; можно добавить skeleton для карточек |
| Сообщение на Generator для гостя | ✅ Сделано | Проверка `/api/me`, блок «Sign in to generate» + CTA Login, скелетон при загрузке |

## Техническое

| Что | Статус | Действие |
|-----|--------|----------|
| Rate limit по IP | ✅ Сделано | Upstash Redis + @upstash/ratelimit, 10 req/мин на IP. См. `docs/PUNKT3_RATE_LIMIT.md`. Без UPSTASH_* — отключён. |
| sitemap.xml | Нет | Добавить `app/sitemap.ts` (Next.js) |
| robots.txt | Нет | Добавить `app/robots.ts` или `public/robots.txt` |
| Тесты | ✅ Сделано | Unit: Vitest, lib/usage.test.ts (мок Prisma). E2E: Playwright, лендинг и генератор. См. docs/PUNKT4_TESTS.md. Запуск: npm run test, npm run test:e2e |
| Логирование ошибок | console.error | Подключить Sentry или другой error tracking в продакшене |

## Маркетинг и контент

| Что | Статус | Действие |
|-----|--------|----------|
| Реальные отзывы | Сейчас dummy | Заменить на реальные цитаты и, по желанию, фото |
| Блог / Changelog | Нет | Опционально: `/blog` или `/changelog` для SEO и доверия |
| Email-подписка | Нет | Опционально: форма на лендинге (Resend, ConvertKit) для лидов |

## Уже сделано

- Лендинг (Hero, Features, Pricing, Testimonials, FAQ, CTA), SEO, JSON-LD  
- Генератор с URL, спиннером, ошибками, копированием  
- Dashboard, usage, Stripe, Google Auth  
- API generate, миграции, Vercel config, скрипты, документация и маркетинговый контент  

**Уже добавлено в этом обновлении:** Footer на лендинге и на Privacy/Terms; страница 404; Privacy Policy и Terms of Service; проверка сессии на Generator (блок «Sign in to generate» + скелетон); sitemap.ts и robots.ts; папка public с README_ASSETS.md (инструкция по og.png и favicon).

---

## После выполнения 5 пунктов — что ещё понадобится

*5 пунктов: og.png + favicon, TikTok (ручной транскрипт), rate limit, тесты, Sentry.*

### Обязательно для продакшена

| Что | Зачем |
|-----|--------|
| **Контакт / поддержка** | В Footer и в Privacy/Terms указан «support email» — завести почту (например support@yourdomain.com) или форму обратной связи и прописать в текстах. |
| **Реальный NEXTAUTH_URL и домен** | В проде в Vercel задать `NEXTAUTH_URL` и `NEXT_PUBLIC_APP_URL` на боевой домен; в Google OAuth и Stripe webhook — тот же домен. |
| **Резервные копии БД** | Vercel Postgres/Neon обычно дают бэкапы; проверить настройки и при необходимости включить автоматические снапшоты. |

### Желательно

| Что | Зачем |
|-----|--------|
| **Cookie / согласие (если есть пользователи из ЕС)** | Баннер или страница про cookies и согласие на обработку данных; обновить Privacy под это. |
| **Аналитика** | Подключить Vercel Analytics, Plausible или Google Analytics (с учётом согласия на cookies) — смотреть трафик и конверсии. |
| **Политика возвратов** | Кратко описать в Terms или отдельной странице: при отмене Pro возврат за текущий месяц (или нет) и как обращаться. |
| **Skeleton на Dashboard** | Пока грузится `/api/me`, показывать skeleton карточек вместо одного спиннера — лучше UX. |

### По мере роста

| Что | Зачем |
|-----|--------|
| **Блог или Changelog** | SEO, доверие, анонсы обновлений. |
| **Email-рассылка** | Форма на лендинге (Resend, ConvertKit) для лидов и напоминаний. |
| **Реальные отзывы** | Заменить dummy-цитаты в Testimonials на отзывы ранних пользователей. |
| **GDPR: экспорт/удаление данных** | Если есть пользователи из ЕС — возможность скачать свои данные и удалить аккаунт (ручной процесс или простой `/api/me/export`, `/api/me/delete`). |
| **Мониторинг доступности** | UptimeRobot, Better Stack или встроенный Vercel — алерты при падении сайта. |
