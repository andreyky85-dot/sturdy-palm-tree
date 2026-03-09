"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ResultsCards } from "@/components/generator/ResultsCards";
import type { GenerateResult } from "@/components/generator/ResultsCards";

type InputMode = "url" | "transcript";

export default function GeneratorPage() {
  const [mode, setMode] = useState<InputMode>("url");
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => {
        setIsSignedIn(r.ok);
      })
      .catch(() => setIsSignedIn(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (mode === "url") {
      if (!url.trim()) {
        setError("Enter a video URL");
        return;
      }
    } else {
      if (!transcript.trim()) {
        setError("Paste the transcript text");
        return;
      }
      if (transcript.trim().length < 50) {
        setError("Transcript must be at least 50 characters");
        return;
      }
    }
    setLoading(true);
    try {
      const body = mode === "url"
        ? { videoUrl: url.trim() }
        : { transcript: transcript.trim() };
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
          Paste a YouTube URL or paste a transcript (e.g. TikTok, podcast, any text). We’ll pull the transcript and generate posts.
        </p>
        {isSignedIn === false && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-slate-800">
            <p className="font-medium">Sign in to generate</p>
            <p className="mt-1 text-sm text-slate-600">
              Free plan: 5 generations per month. Sign in with Google to start.
            </p>
            <Link href="/login" className="mt-3 inline-block">
              <Button size="md">Sign in with Google</Button>
            </Link>
          </div>
        )}
        {isSignedIn === true && (
        <>
        <div className="mt-6 flex gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => { setMode("url"); setError(null); }}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${mode === "url" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            YouTube URL
          </button>
          <button
            type="button"
            onClick={() => { setMode("transcript"); setError(null); }}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${mode === "transcript" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            Paste transcript (TikTok, podcast, any text)
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-8">
          {mode === "url" ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" loading={loading} size="lg">
                Generate
              </Button>
            </div>
          ) : (
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
        </>
        )}
        {isSignedIn === null && (
          <div className="mt-8 h-10 w-48 animate-pulse rounded-lg bg-slate-100" />
        )}
      </main>
    </>
  );
}
