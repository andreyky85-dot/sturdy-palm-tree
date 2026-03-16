import { Card } from "@/components/ui/Card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Раньше я тратил около часа, чтобы из одного материала сделать несколько постов. Сейчас за несколько минут получаю варианты формулировок и дальше просто выбираю подходящие.",
    name: "Иван Петров",
    role: "Автор и продюсер контента",
  },
  {
    quote:
      "У нас небольшая команда маркетинга. TextFlow помогает быстрее разбирать заметки и материалы экспертов на понятные форматы для соцсетей и рассылок, без лишней рутины.",
    name: "Анна Смирнова",
    role: "Руководитель маркетинга",
  },
  {
    quote:
      "Нравится, что подсказки не пытаются написать текст за нас, а предлагают структурированные варианты, с которыми удобно дальше работать и адаптировать под бренд.",
    name: "Дмитрий Коваленко",
    role: "Основатель проекта",
  },
];

export function Testimonials() {
  return (
    <section className="border-t border-slate-200 bg-slate-50/50 px-4 py-20" id="testimonials">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
          Кому уже полезен TextFlow
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
          Короткие отзывы тех, кто регулярно работает с текстами и контентом.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {testimonials.map(({ quote, name, role }) => (
            <Card key={name}>
              <Quote className="h-8 w-8 text-slate-300" />
              <blockquote className="mt-3 text-slate-700">
                &ldquo;{quote}&rdquo;
              </blockquote>
              <footer className="mt-4">
                <p className="font-semibold text-slate-900">{name}</p>
                <p className="text-sm text-slate-500">{role}</p>
              </footer>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
