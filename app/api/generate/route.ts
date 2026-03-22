import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { fetchTranscript } from "@/lib/transcript";
import { generateContentFromTranscript } from "@/lib/openai";
import { getClientIp, checkRateLimit } from "@/lib/ratelimit";
import { checkUsage, incrementUsage } from "@/lib/usage";

const MIN_TRANSCRIPT_LENGTH = 50;
const MAX_TRANSCRIPT_LENGTH = 35000;

const bodySchema = z
  .object({
    videoUrl: z.string().optional(),
    transcript: z.string().max(MAX_TRANSCRIPT_LENGTH).optional(),
  })
  .refine(
    (data) => {
      const hasUrl = !!data.videoUrl?.trim();
      const hasTranscript = !!data.transcript?.trim();
      return (hasUrl && !hasTranscript) || (!hasUrl && hasTranscript);
    },
    { message: "Provide either videoUrl or transcript, not both and not neither." }
  );

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Требуется вход в аккаунт." }, { status: 401 });
    }

    const ip = getClientIp(req);
    const rateLimitResult = await checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: `Слишком много запросов. Повторите через ${rateLimitResult.retryAfter} с.`,
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfter),
          },
        }
      );
    }

    const usage = await checkUsage(session.user.id);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: `Достигнут месячный лимит генераций (${usage.used}/${usage.limit}).`,
          used: usage.used,
          limit: usage.limit,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { videoUrl, transcript: rawTranscript } = parsed.data;
    let transcript: string;

    if (rawTranscript?.trim()) {
      if (rawTranscript.trim().length < MIN_TRANSCRIPT_LENGTH) {
        return NextResponse.json(
          { error: `Текст должен быть не короче ${MIN_TRANSCRIPT_LENGTH} символов.` },
          { status: 400 }
        );
      }
      transcript = rawTranscript.trim();
    } else if (videoUrl?.trim()) {
      try {
        new URL(videoUrl.trim());
      } catch {
        return NextResponse.json({ error: "Некорректный URL видео." }, { status: 400 });
      }
      transcript = await fetchTranscript(videoUrl.trim());
    } else {
      return NextResponse.json({ error: "Укажите videoUrl или transcript." }, { status: 400 });
    }

    const result = await generateContentFromTranscript(transcript);
    try {
      await incrementUsage(session.user.id);
    } catch (err) {
      console.error("[generate] incrementUsage", err);
      return NextResponse.json(
        { error: "Генерация выполнена, но не удалось зафиксировать использование. Проверьте базу данных." },
        { status: 503 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
