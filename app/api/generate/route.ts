import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { fetchTranscript } from "@/lib/transcript";
import { generateContentFromTranscript } from "@/lib/openai";
import { checkUsage, incrementUsage } from "@/lib/usage";
import { getClientIp, checkRateLimit } from "@/lib/ratelimit";

const MIN_TRANSCRIPT_LENGTH = 50;
const MAX_TRANSCRIPT_LENGTH = 35000;

const bodySchema = z.object({
  videoUrl: z.string().optional(),
  transcript: z.string().max(MAX_TRANSCRIPT_LENGTH).optional(),
}).refine(
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
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User id missing" }, { status: 401 });
    }

    const { allowed, used, limit } = await checkUsage(userId);
    if (!allowed) {
      return NextResponse.json(
        { error: "Monthly limit reached", used, limit },
        { status: 429 }
      );
    }

    const ip = getClientIp(req);
    const rateLimitResult = await checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: `Too many requests. Try again in ${rateLimitResult.retryAfter} seconds.`,
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
          { error: `Transcript must be at least ${MIN_TRANSCRIPT_LENGTH} characters.` },
          { status: 400 }
        );
      }
      transcript = rawTranscript.trim();
    } else if (videoUrl?.trim()) {
      try {
        new URL(videoUrl.trim());
      } catch {
        return NextResponse.json({ error: "Invalid video URL." }, { status: 400 });
      }
      transcript = await fetchTranscript(videoUrl.trim());
    } else {
      return NextResponse.json({ error: "Provide videoUrl or transcript." }, { status: 400 });
    }

    const result = await generateContentFromTranscript(transcript);
    await incrementUsage(userId);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
