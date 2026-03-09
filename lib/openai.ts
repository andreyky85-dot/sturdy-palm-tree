import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

// Если ключ не задан, не падаем на этапе билда, а вернём ошибку при вызове API
export const openai = apiKey ? new OpenAI({ apiKey }) : null;

export type GenerateResult = {
  twitter_posts: string[];
  linkedin_posts: string[];
  tiktok_ideas: string[];
  blog_summary: string;
};

const SYSTEM_PROMPT = `Ты — эксперт по контенту для соцсетей. На основе транскрипта видео создай:
1. Ровно 10 постов для Twitter (короткие, с хештегами, до 280 символов каждый).
2. Ровно 5 постов для LinkedIn (профессиональный тон, 1–3 абзаца).
3. Ровно 3 идеи для TikTok (описание сценария/хука в 1–2 предложения).
4. Один краткий summary для блога (2–4 абзаца).

Отвечай ТОЛЬКО валидным JSON в таком формате, без markdown и лишнего текста:
{"twitter_posts":["...","...", ...10 штук], "linkedin_posts":["...", ...5], "tiktok_ideas":["...", ...3], "blog_summary":"..."}`;

export async function generateContentFromTranscript(transcript: string): Promise<GenerateResult> {
  if (!openai) {
    throw new Error("OPENAI_API_KEY is not configured on the server.");
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Транскрипт видео:\n\n${transcript.slice(0, 12000)}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty response from OpenAI");
  }

  const parsed = JSON.parse(raw) as GenerateResult;
  return {
    twitter_posts: Array.isArray(parsed.twitter_posts) ? parsed.twitter_posts.slice(0, 10) : [],
    linkedin_posts: Array.isArray(parsed.linkedin_posts) ? parsed.linkedin_posts.slice(0, 5) : [],
    tiktok_ideas: Array.isArray(parsed.tiktok_ideas) ? parsed.tiktok_ideas.slice(0, 3) : [],
    blog_summary: typeof parsed.blog_summary === "string" ? parsed.blog_summary : "",
  };
}
