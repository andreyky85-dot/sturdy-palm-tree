import OpenAI from "openai";
import { z } from "zod";
import type { GenerateResult } from "@/components/generator/ResultsCards";

const generateResultSchema = z.object({
  twitter_posts: z.array(z.string()),
  linkedin_posts: z.array(z.string()),
  tiktok_ideas: z.array(z.string()),
  telegram_posts: z.array(z.string()),
  titles: z.array(z.string()),
  blog_summary: z.string(),
});

/**
 * Приводит ответ модели к фиксированным размерам массивов, ожидаемым UI (карточки с фиксированными заголовками).
 * Лишнее обрезаем, нехватку добиваем нейтральными строками — стабильнее, чем падение рендера.
 */
function normalizeGenerateResult(raw: z.infer<typeof generateResultSchema>): GenerateResult {
  const pad = (items: string[], target: number, filler: string) => {
    const next = items.map((s) => s.trim()).filter(Boolean);
    while (next.length < target) {
      next.push(filler);
    }
    return next.slice(0, target);
  };

  return {
    twitter_posts: pad(raw.twitter_posts, 10, "Дополнительная идея поста по теме исходного текста."),
    linkedin_posts: pad(raw.linkedin_posts, 5, "Короткий экспертный пост по мотивам исходного материала."),
    tiktok_ideas: pad(raw.tiktok_ideas, 3, "Идея для короткого вертикального видео по теме текста."),
    telegram_posts: pad(raw.telegram_posts, 3, "Пост для Telegram-канала на основе исходного текста."),
    titles: pad(raw.titles, 5, "Заголовок по теме материала"),
    blog_summary:
      raw.blog_summary.trim().slice(0, 12000) ||
      "Краткое резюме: перескажите исходный текст своими словами в 2–3 абзацах.",
  };
}

async function generateWithOpenAI(transcript: string): Promise<GenerateResult | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return null;
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const client = new OpenAI({ apiKey: key });
  const excerpt = transcript.slice(0, 28_000);

  const system =
    "Ты редактор контента для соцсетей. Отвечай только одним JSON-объектом без markdown и пояснений. Язык выхода: русский.";

  const user = `Проанализируй текст ниже и верни JSON со строго такими ключами:
twitter_posts (массив из 10 коротких твитов/постов X),
linkedin_posts (5 развёрнутых постов),
tiktok_ideas (3 идеи сценария короткого видео),
telegram_posts (3 поста для Telegram),
titles (5 цепляющих заголовков),
blog_summary (один связный абзац-конспект).

Текст:
---
${excerpt}
---`;

  try {
    const completion = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.6,
      max_tokens: 4096,
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("[openai] JSON parse failed");
      return null;
    }

    const safe = generateResultSchema.safeParse(parsed);
    if (!safe.success) {
      console.error("[openai] schema mismatch", safe.error.flatten());
      return null;
    }

    return normalizeGenerateResult(safe.data);
  } catch (err) {
    console.error("[openai] API error", err);
    return null;
  }
}

/**
 * Основной вход: при наличии OPENAI_API_KEY вызывается API OpenAI; иначе — детерминированный шаблонный режим (локальная разработка без ключа).
 */
export async function generateContentFromTranscript(transcript: string): Promise<GenerateResult> {
  const fromApi = await generateWithOpenAI(transcript);
  if (fromApi) {
    return fromApi;
  }
  return buildFallbackFromTranscript(transcript);
}

function buildFallbackFromTranscript(transcript: string): GenerateResult {
  const short = transcript.slice(0, 140).trim() || "эта тема";
  const topic = short.length > 0 ? short : "эта тема";

  const twitter_posts = [
    `Главная мысль по теме "${topic}" в одном предложении. Без воды, только суть.`,
    `Объясните "${topic}" так, как будто рассказываете другу за кофе. Чем проще текст, тем больше реакций.`,
    `Поделитесь личным наблюдением по теме "${topic}" и добавьте один конкретный вывод — люди любят истории.`,
    `Сделайте мини‑серию: сегодня — что такое "${topic}", завтра — пример из жизни, потом — типичная ошибка.`,
    `Возьмите один самый важный аспект "${topic}" и раскройте только его. Один пост — одна мысль.`,
    `Ответьте на вопрос “зачем это нужно?” именно для читателя. Свяжите тему "${topic}" с реальной пользой.`,
    `Оформите "${topic}" в формат “3 коротких инсайта”: по одному предложению на каждый пункт.`,
    `Соберите 3 частых вопроса про "${topic}" и ответьте на них в одном посте. Формат Q&A читается легко.`,
    `Приведите один реальный пример по теме "${topic}" вместо общих фраз. Конкретика всегда выигрывает.`,
    `В конце поста по теме "${topic}" задайте простой вопрос аудитории — это даёт идеи для следующих публикаций.`,
  ];

  const linkedin_posts = [
    `Тема "${topic}" становится всё более актуальной, но во многих обсуждениях не хватает простоты и структуры.

Полезно смотреть на неё через три призмы:
- контекст: почему это важно именно сейчас,
- практика: как это можно применять на деле,
- выводы: что изменится, если внедрить эти идеи.

Когда вы последовательно отвечаете на эти вопросы, любая сложная тема становится понятной и применимой для аудитории.`,
    `Обсуждая "${topic}", мы часто сталкиваемся с полярными мнениями. Одни считают, что это переоценено, другие — что это “серебряная пуля”.

Правда обычно посередине: ценность появляется тогда, когда есть:
- чёткая цель,
- реалистичные ожидания,
- готовность действовать.

Полезно честно ответить себе: какую роль эта тема должна играть именно в вашей ситуации и какие шаги вы реально готовы сделать.`,
    `Хорошие объяснения сложных тем редко рождаются с первого раза.

Если вы работаете с "${topic}", попробуйте такой подход:
1. Сначала запишите свои мысли в свободной форме.
2. Затем уберите всё лишнее и усложнённые формулировки.
3. Оставьте только то, что даёт читателю ясность и конкретику.

В итоге вы получите текст, который легче читать и легче применять на практике.`,
    `Тема "${topic}" может казаться абстрактной, пока не появляется реальный пример.

Подумайте о ситуации, в которой это уже сыграло роль:
- что было до,
- что вы сделали,
- какой результат получили,
- какие выводы сделали.

Подобные истории гораздо сильнее убеждают, чем любые теоретические рассуждения.`,
    `Когда вы делитесь мыслями по теме "${topic}", вы не обязаны быть “идеальным экспертом”.

Честный формат “вот что я понял на своём опыте, вот что пока не до конца ясно” часто вызывает больше доверия, чем безупречные, но оторванные от реальности тексты.

Главное — искренность, понятная структура и уважение к читателю.`,
  ];

  const tiktok_ideas = [
    `Снимите ролик “3 простых мысли про ${topic}”: по одному тезису на каждый кадр, добавьте крупные субтитры.`,
    `Запишите формат “миф и как на самом деле” по теме ${topic}: сначала популярное заблуждение, затем ваше объяснение в одном предложении.`,
    `Сделайте видео “3 ошибки новичков в теме ${topic}”: коротко назовите ошибку и тут же покажите, как делать правильно.`,
  ];

  const telegram_posts = [
    `Сделайте разбор по теме "${topic}". Коротко опишите контекст, затем по пунктам перечислите 2–3 ключевые мысли и завершите понятным выводом или рекомендацией.`,
    `Опишите типичную ситуацию, связанную с "${topic}": что обычно происходит, какие возникают сложности и к чему это приводит. Далее предложите один–два варианта, как можно подойти к решению.`,
    `Подготовьте небольшой образовательный пост по теме "${topic}": сформулируйте три практических совета, каждый отдельной строкой, и добавьте приглашение задать вопросы в комментариях.`,
  ];

  const titles = [
    `3 главные идеи про ${topic}`,
    `Как подойти к теме "${topic}" без лишней сложности`,
    `Типичные ошибки в теме "${topic}" и как их избежать`,
    `"${topic}": с чего начать, если вы только планируете`,
    `Почему тема "${topic}" важна именно сейчас`,
  ];

  const blog_summary = `В этом тексте тема "${topic}" разбирается простым языком и с привязкой к практике. 
Сначала даётся общий контекст, затем — несколько наглядных примеров и типичных ситуаций, в которых эти идеи полезны.
Завершается разбор короткими выводами и идеями, как применить всё это в своей жизни или работе.`;

  return { twitter_posts, linkedin_posts, tiktok_ideas, telegram_posts, titles, blog_summary };
}
