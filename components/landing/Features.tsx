import { Card } from "@/components/ui/Card";
import { Layers, Zap, Share2, Clock, BarChart3 } from "lucide-react";

const items = [
  {
    icon: Layers,
    title: "Один текст — несколько форматов",
    description:
      "Вы работаете с исходным текстом, а сервис предлагает идеи коротких постов, развёрнутых материалов, кратких конспектов и сценариев для коротких видео.",
  },
  {
    icon: Zap,
    title: "Фокус на ясности и структуре",
    description:
      "Подсказки построены вокруг простой логики: контекст → пример → вывод. Это помогает быстро превратить черновик в понятный и пригодный для публикации материал.",
  },
  {
    icon: Share2,
    title: "Готово к использованию",
    description:
      "Каждый блок можно скопировать в один клик и сразу использовать в соцсетях, рассылке или любом другом канале.",
  },
  {
    icon: Clock,
    title: "Экономия времени команды",
    description:
      "Часть работы по структурированию текста и поиску формулировок берёт на себя сервис, высвобождая время на экспертизу и стратегию.",
  },
  {
    icon: BarChart3,
    title: "Подходит авторам и бизнесу",
    description:
      "Инструмент полезен как для личных проектов, так и для компаний, которые регулярно готовят экспертный контент.",
  },
];

export function Features() {
  return (
    <section className="px-4 py-20" id="features">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
          Чем помогает TextFlow
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          Сервис не заменяет экспертизу, а упрощает путь от черновика до готовых форматов контента.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <Icon className="h-10 w-10 text-slate-700" />
              <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            </Card>
          ))}
          {items.slice(3).map(({ icon: Icon, title, description }) => (
            <Card key={title} className="sm:col-span-2 lg:col-span-1">
              <Icon className="h-10 w-10 text-slate-700" />
              <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
