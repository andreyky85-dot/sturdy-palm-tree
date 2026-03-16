"use client";

import { useState } from "react";

const items = [
  {
    q: "Для кого подходит сервис?",
    a: "TextFlow полезен авторам, владельцам проектов и небольшим командам, которые регулярно работают с текстами: заметками, статьями, сценариями, обучающими материалами.",
  },
  {
    q: "Нужен ли мне ключ OpenAI и банковская карта?",
    a: "В учебном режиме сервис может работать без подключённого ключа OpenAI и карты. Для полноценного использования моделей OpenAI в продакшене понадобится собственный ключ и настроенный биллинг в OpenAI.",
  },
  {
    q: "Сколько стоит использование TextFlow?",
    a: "Сейчас доступен бесплатный тариф с ограничением по количеству генераций. Платный тариф Pro с расширенными лимитами и возможностями находится в разработке.",
  },
  {
    q: "Можно ли использовать полученные тексты в коммерческих проектах?",
    a: "Да, вы можете адаптировать и использовать сгенерированные варианты в своих проектах. Рекомендуем просматривать текст перед публикацией и при необходимости дорабатывать формулировки под тон вашего бренда.",
  },
  {
    q: "Что происходит с моим текстом после генерации?",
    a: "Исходный текст используется для формирования предложений и не предназначен для долгосрочного хранения. Подробности о работе с данными и логах можно будет найти в политике конфиденциальности проекта.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="border-t border-slate-200 bg-white px-4 py-20" id="faq">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
          Часто задаваемые вопросы
        </h2>
        <p className="mt-3 text-center text-slate-600">
          Краткие ответы на основные вопросы о сервисе.
        </p>
        <dl className="mt-10 space-y-4">
          {items.map(({ q, a }, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3"
            >
              <dt>
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between text-left font-semibold text-slate-900"
                >
                  {q}
                  <span className="text-slate-400">
                    {openIndex === i ? "−" : "+"}
                  </span>
                </button>
              </dt>
              {openIndex === i && (
                <dd className="mt-2 text-sm text-slate-600">{a}</dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
