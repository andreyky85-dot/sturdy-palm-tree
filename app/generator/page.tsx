"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ResultsCards } from "@/components/generator/ResultsCards";
import type { GenerateResult } from "@/components/generator/ResultsCards";

export default function GeneratorPage() {
  const [mode] = useState<"transcript">("transcript");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!transcript.trim()) {
      setError("Paste the transcript text");
      return;
    }
    if (transcript.trim().length < 50) {
      setError("Transcript must be at least 50 characters");
      return;
    }
    setLoading(true);
    try {
      const body = { transcript: transcript.trim() };
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Generation failed");
        if (data.used != null && data.limit != null) {
          setError(`Monthly limit reached (${data.used}/${data.limit}). Upgrade to Pro for unlimited.`);
        } else if (res.status === 429 && data.retryAfter) {
          setError(`Too many requests. Try again in ${data.retryAfter} seconds.`);
        }
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-bold text-slate-900">Generate content</h1>
        <p className="mt-1 text-slate-600">
          Paste a transcript (e.g. TikTok, podcast, any text). We’ll generate posts for different platforms.
        </p>
        <form onSubmit={handleSubmit} className="mt-8">
          {mode === "transcript" && (
            <div className="flex flex-col gap-3">
              <textarea
                placeholder="Paste your transcript here (e.g. from TikTok subtitles, a podcast, or any video text)..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                disabled={loading}
                rows={8}
                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
              <p className="text-xs text-slate-500">Minimum 50 characters. Max 35,000.</p>
              <Button type="submit" loading={loading} size="lg">
                Generate
              </Button>
            </div>
          )}
        </form>
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        {result && (
          <div className="mt-10">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">Results</h2>
            <ResultsCards data={result} />
          </div>
        )}
      </main>
    </>
  );
}
