import Link from "next/link";
import { Button } from "@/components/ui/Button";

/**
 * Hero: catchy headline and CTA for Product Hunt / landing.
 * Copy is benefit-led and conversion-focused.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Превратите один текст в десятки идей для постов.
        </h1>
        <p className="mt-6 text-lg text-slate-600 sm:text-xl">
          Вставьте любой текст — конспект, заметку, отрывок статьи. Сервис предложит варианты постов
          для соцсетей, коротких видео и блога.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/generator">
            <Button size="lg" className="shadow-lg">
              Начать бесплатно
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">
              Войти через Google
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Бесплатный план: до 5 генераций в месяц. Без банковской карты.
        </p>
      </div>
    </section>
  );
}
