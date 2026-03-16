"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ResultsCards } from "@/components/generator/ResultsCards";
import type { GenerateResult } from "@/components/generator/ResultsCards";

export default function GeneratorPage() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!transcript.trim()) {
      setError("Вставьте текст, с которым нужно работать");
      return;
    }
    if (transcript.trim().length < 50) {
      setError("Текст должен быть не короче 50 символов");
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
    <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-bold text-slate-900">Сгенерировать идеи из текста</h1>
        <p className="mt-1 text-slate-600">
          Вставьте любой текст (идею, конспект, отрывок статьи), а мы предложим варианты постов для разных площадок.
        </p>
        <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex flex-col gap-3">
              <textarea
                placeholder="Вставьте сюда текст, с которым хотите поработать..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                disabled={loading}
                rows={8}
                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
              <p className="text-xs text-slate-500">Минимум 50 символов, максимум 35 000.</p>
              <Button type="submit" loading={loading} size="lg">
                Сгенерировать
              </Button>
            </div>
        </form>
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        {result && (
          <div className="mt-10">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">Результаты</h2>
            <ResultsCards data={result} />
          </div>
        )}
      </main>
  );
}
