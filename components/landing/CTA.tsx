import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function CTA() {
  return (
    <section className="border-t border-slate-200 bg-slate-900 px-4 py-20 text-white">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Попробуйте на своём тексте
        </h2>
        <p className="mt-4 text-slate-300">
          Возьмите заметку, черновик статьи или конспект встречи и посмотрите, какие форматы контента можно из
          неё получить за пару минут.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/generator">
            <Button size="lg" variant="secondary">
              Перейти к генератору
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">
              Войти через Google
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
