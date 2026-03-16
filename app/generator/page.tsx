"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ResultsCards } from "@/components/generator/ResultsCards";
import type { GenerateResult } from "@/components/generator/ResultsCards";

type HistoryItem = {
  id: string;
  input: string;
  createdAt: string;
  result: GenerateResult;
};

const HISTORY_KEY = "textflow_history_v1";
const HISTORY_LIMIT = 5;

export default function GeneratorPage() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as HistoryItem[];
      if (Array.isArray(parsed)) {
        setHistory(parsed);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const saveHistory = (input: string, res: GenerateResult) => {
    const item: HistoryItem = {
      id: String(Date.now()),
      input,
      createdAt: new Date().toISOString(),
      result: res,
    };
    const next = [item, ...history].slice(0, HISTORY_LIMIT);
    setHistory(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    }
  };

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
      saveHistory(transcript.trim(), data);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFromHistory = (item: HistoryItem) => {
    setTranscript(item.input);
    setResult(item.result);
    setError(null);
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Сгенерировать идеи из текста</CardTitle>
        </CardHeader>
        <p className="text-sm text-slate-600">
          Вставьте любой текст (идею, конспект, отрывок статьи), а мы предложим варианты постов для разных площадок.
        </p>
        <form onSubmit={handleSubmit} className="mt-6">
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
            <div className="flex items-center gap-3">
              <Button type="submit" loading={loading} size="lg">
                Сгенерировать
              </Button>
              {loading && (
                <span className="text-xs text-slate-500">
                  Идёт генерация…
                </span>
              )}
            </div>
          </div>
        </form>
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
      </Card>

      {result && (
        <div className="mt-10">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">Результаты</h2>
          <ResultsCards data={result} />
        </div>
      )}

      {history.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Недавние генерации</h2>
          <div className="space-y-3">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleLoadFromHistory(item)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-left hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-800 line-clamp-2">
                    {item.input}
                  </p>
                  <span className="whitespace-nowrap text-xs text-slate-500">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
