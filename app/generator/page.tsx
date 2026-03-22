"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ResultsCards } from "@/components/generator/ResultsCards";
import type { GenerateResult } from "@/components/generator/ResultsCards";

type HistoryItem = {
  id: string;
  input: string;
  // URL видео, если генерация была по YouTube-ссылке; иначе null
  videoUrl: string | null;
  createdAt: string;
  result: GenerateResult;
};

const HISTORY_KEY = "textflow_history_v1";
const HISTORY_LIMIT = 5;
// Регулярное выражение для детекта YouTube-URL (синхронизировано с lib/transcript.ts)
const YOUTUBE_URL_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export default function GeneratorPage() {
  // Текстовый транскрипт (либо вставленный вручную, либо сохранённый результат по YouTube)
  const [transcript, setTranscript] = useState("");
  // YouTube URL, если пользователь выбирает генерацию по ссылке
  const [videoUrl, setVideoUrl] = useState("");
  // Режим ввода: true — работаем по YouTube URL, false — по тексту
  const [useVideoUrl, setUseVideoUrl] = useState(false);
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

  // Сохраняем в историю как текст и (опционально) URL видео,
  // чтобы пользователь мог вернуться к прошлой генерации
  const saveHistory = (input: string, res: GenerateResult, videoUrlValue: string | null) => {
    const item: HistoryItem = {
      id: String(Date.now()),
      input,
      videoUrl: videoUrlValue,
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

    // Валидация в зависимости от выбранного режима
    if (useVideoUrl) {
      const trimmedUrl = videoUrl.trim();
      if (!trimmedUrl) {
        setError("Вставьте ссылку на YouTube-видео");
        return;
      }
      // Простейшая валидация URL на клиенте; на сервере есть дополнительная проверка
      if (!/^https?:\/\/.+/i.test(trimmedUrl)) {
        setError("Введите корректный URL (начинающийся с http:// или https://)");
        return;
      }
    } else {
      const trimmedTranscript = transcript.trim();
      if (!trimmedTranscript) {
        setError("Вставьте текст, с которым нужно работать");
        return;
      }
      if (trimmedTranscript.length < 50) {
        setError("Текст должен быть не короче 50 символов");
        return;
      }
    }

    setLoading(true);
    try {
      const trimmedTranscript = transcript.trim();
      const trimmedUrl = videoUrl.trim();

      // Формируем тело запроса согласно контракту API:
      // либо videoUrl, либо transcript, но не оба сразу.
      const body =
        useVideoUrl && trimmedUrl
          ? { videoUrl: trimmedUrl }
          : { transcript: trimmedTranscript };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось сгенерировать");
        if (data.used != null && data.limit != null) {
          setError(`Достигнут месячный лимит (${data.used}/${data.limit}).`);
        } else if (res.status === 429 && data.retryAfter) {
          setError(`Слишком много запросов. Повторите через ${data.retryAfter} с.`);
        }
        return;
      }
      setResult(data);

      // В историю сохраняем текущий режим:
      // либо исходный текст, либо пустую строку (если будет нужно — можно дополнительно вытаскивать транскрипт)
      const historyInput = useVideoUrl ? trimmedUrl : trimmedTranscript;
      const historyVideoUrl = useVideoUrl ? trimmedUrl : null;
      saveHistory(historyInput, data, historyVideoUrl);
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFromHistory = (item: HistoryItem) => {
    // Если генерация была по тексту — подставляем текст.
    // Если по YouTube — подставляем URL и очищаем текст, чтобы не было двойного источника.
    if (item.videoUrl) {
      setUseVideoUrl(true);
      setVideoUrl(item.videoUrl);
      setTranscript("");
    } else {
      setUseVideoUrl(false);
      setTranscript(item.input);
      setVideoUrl("");
    }
    setResult(item.result);
    setError(null);
  };

  const handleLoadLast = () => {
    if (!history.length) return;
    handleLoadFromHistory(history[0]);
  };

  const handleNew = () => {
    setTranscript("");
    setVideoUrl("");
    setResult(null);
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
          <CardTitle>Сгенерировать идеи из текста или YouTube</CardTitle>
        </CardHeader>
        <p className="text-sm text-slate-600">
          Вставьте любой текст (идею, конспект, отрывок статьи) или ссылку на YouTube‑видео, а мы предложим варианты
          постов для разных площадок.
        </p>
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setUseVideoUrl(false);
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  !useVideoUrl
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                disabled={loading}
              >
                Вставить текст
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseVideoUrl(true);
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  useVideoUrl
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                disabled={loading}
              >
                Ссылка на YouTube
              </button>
            </div>

            {useVideoUrl ? (
              <div className="flex flex-col gap-2">
                <input
                  type="url"
                  placeholder="Вставьте ссылку на YouTube‑видео (youtube.com или youtu.be)…"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={loading}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
                <p className="text-xs text-slate-500">
                  Мы автоматически получим транскрипт видео (если он доступен) и сгенерируем контент на его основе.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <textarea
                  placeholder="Вставьте сюда текст, с которым хотите поработать..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  disabled={loading}
                  rows={8}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
                <p className="text-xs text-slate-500">Минимум 50 символов, максимум 35 000.</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" loading={loading} size="lg">
                Сгенерировать
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={!history.length || loading}
                onClick={handleLoadLast}
              >
                Последняя генерация
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={loading}
                onClick={handleNew}
              >
                Новая
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
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-slate-800 line-clamp-2">
                      {item.input}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          item.videoUrl
                            ? "bg-red-50 text-red-700 ring-1 ring-red-100"
                            : "bg-slate-50 text-slate-700 ring-1 ring-slate-100"
                        }`}
                      >
                        {item.videoUrl ? "YouTube" : "Текст"}
                      </span>
                    </div>
                  </div>
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
