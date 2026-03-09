# Content Multiplier — соответствие спецификации

Приложение уже реализовано. Ниже — привязка требований к файлам.

---

## 1. Landing page

| Требование | Реализация |
|------------|------------|
| Hero section | `components/landing/Hero.tsx` |
| Features | `components/landing/Features.tsx` |
| Pricing (Free + Pro) | `components/landing/Pricing.tsx` |
| Testimonials | `components/landing/Testimonials.tsx` |
| FAQ | `components/landing/FAQ.tsx` |
| CTA buttons | Hero, CTA (`components/landing/CTA.tsx`) |
| Сборка лендинга | `app/page.tsx` |

---

## 2. Generator page

| Требование | Реализация |
|------------|------------|
| Input для video URL | `app/generator/page.tsx` + `components/ui/Input.tsx` |
| Generate button | `app/generator/page.tsx` |
| Loading spinner | `components/ui/Button.tsx` (prop `loading`) |
| Error handling | `app/generator/page.tsx` (state `error`, 429/500) |
| 10 Twitter posts | `components/generator/ResultsCards.tsx` + API JSON |
| 5 LinkedIn posts | то же |
| 3 TikTok ideas | то же |
| 1 blog summary | то же |
| Copy-to-clipboard | `ResultsCards.tsx` — кнопка Copy на каждый блок |

---

## 3. Dashboard

| Требование | Реализация |
|------------|------------|
| User info | `app/dashboard/page.tsx` + `components/dashboard/DashboardClient.tsx`, `GET /api/me` |
| Usage stats | DashboardClient, `usage` из `/api/me` |
| Subscription info | план Free/Pro, кнопки Upgrade / Manage plan |
| Manage plan | `POST /api/stripe/portal` → Stripe Customer Portal |

---

## 4. Authentication

| Требование | Реализация |
|------------|------------|
| Google login | NextAuth + Google Provider в `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts` |
| Session management | JWT, `getServerSession`, middleware для `/dashboard` и `/login` |
| Страница входа | `app/login/page.tsx` |

---

## 5. Monetization

| Требование | Реализация |
|------------|------------|
| Free: 5 generations/month | `lib/usage.ts` — `FREE_MONTHLY_LIMIT`, `checkUsage` |
| Pro: $19/month unlimited | Stripe subscription, план `PRO` в БД |
| Stripe subscriptions | `lib/stripe.ts`, `/api/stripe/checkout`, `/api/stripe/webhook`, `/api/stripe/portal` |

---

## 6. API

| Требование | Реализация |
|------------|------------|
| POST /api/generate | `app/api/generate/route.ts` |
| Accept video URL | body `{ videoUrl }`, валидация zod |
| Extract transcript | `lib/transcript.ts` — YouTube (youtube-transcript) |
| Send to OpenAI | `lib/openai.ts` — `generateContentFromTranscript` |
| Return JSON: twitter_posts, linkedin_posts, tiktok_ideas, blog_summary | тип `GenerateResult`, ответ `NextResponse.json(result)` |

---

## 7. Tech stack

| Требование | Реализация |
|------------|------------|
| Next.js 14 App Router | `app/` (layout, page, routes) |
| TypeScript | tsconfig, типы в компонентах и API |
| Tailwind CSS | tailwind.config.ts, классы в компонентах |
| OpenAI GPT | `lib/openai.ts`, модель gpt-4o-mini |
| YouTube transcript | `youtube-transcript`, `lib/transcript.ts` |
| Stripe API | `lib/stripe.ts`, checkout/webhook/portal |
| Vercel deployment | `vercel.json`, `DEPLOY.md`, `.vercelignore` |

---

## 8. UI design

| Требование | Реализация |
|------------|------------|
| Modern SaaS (Stripe/Linear style) | Светлая палитра, slate, карточки, минимализм |
| Reusable Tailwind components | `components/ui/Button.tsx`, `Card.tsx`, `Input.tsx` |
| Responsive | breakpoints sm/lg в Tailwind |

---

## 9. Project structure

```
/app          — страницы и API routes (App Router)
/components   — UI, landing, generator, dashboard
/lib          — auth, db, openai, stripe, transcript, usage
/types        — next-auth.d.ts
prisma        — schema, migrations
scripts       — local-run.ps1, vercel-deploy.ps1, run-both*.ps1
```

---

## 10. Environment variables

См. `.env.example` и `env.vercel.example`:  
OPENAI_API_KEY, STRIPE_*, NEXTAUTH_*, GOOGLE_*, DATABASE_URL.

---

## Запуск

- Локально: `.\scripts\run-both.ps1` или `npm install && npx prisma migrate dev --name init && npm run dev`
- Деплой: см. `DEPLOY.md` и `README.md` (п. 4).
