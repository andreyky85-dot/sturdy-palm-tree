import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Базовый",
    price: "0 ₽",
    period: "в месяц",
    description: "Познакомьтесь с сервисом без рисков и платежей.",
    features: [
      "до 5 генераций в месяц",
      "форматы: короткие посты, длинные посты, идеи для коротких видео и summary",
      "копирование результата в один клик",
      "вход через Google для сохранения истории",
    ],
    cta: "Использовать бесплатно",
    href: "/generator",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "—",
    period: "",
    description: "Платный тариф в разработке. Планируем безлимитные генерации и приоритетную поддержку.",
    features: [
      "без ограничений по количеству генераций",
      "все доступные форматы вывода",
      "дополнительные настройки под командную работу",
      "приоритетный ответ на запросы",
    ],
    cta: "Скоро доступен",
    href: "/generator",
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section className="border-t border-slate-200 bg-white px-4 py-20" id="pricing">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
          Тарифы
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
          Начните с бесплатного доступа. Платный тариф добавим, когда сервис выйдет в продакшн.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlighted ? "ring-2 ring-slate-900" : ""}
            >
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-slate-500">{plan.period}</span>
              </div>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{plan.description}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href={plan.href}>
                  <Button
                    variant={plan.highlighted ? "primary" : "secondary"}
                    size="lg"
                    className="w-full"
                    disabled={plan.highlighted}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
