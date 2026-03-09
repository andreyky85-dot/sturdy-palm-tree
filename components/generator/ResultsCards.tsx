"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export type GenerateResult = {
  twitter_posts: string[];
  linkedin_posts: string[];
  tiktok_ideas: string[];
  blog_summary: string;
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
      title="Copy"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div className="group flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
      <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm text-slate-700">{text}</p>
      <CopyButton text={text} />
    </div>
  );
}

export function ResultsCards({ data }: { data: GenerateResult }) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Twitter posts (10)</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {data.twitter_posts.map((post, i) => (
            <Block key={i} label={`Post ${i + 1}`} text={post} />
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>LinkedIn posts (5)</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {data.linkedin_posts.map((post, i) => (
            <Block key={i} label={`Post ${i + 1}`} text={post} />
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>TikTok ideas (3)</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {data.tiktok_ideas.map((idea, i) => (
            <Block key={i} label={`Idea ${i + 1}`} text={idea} />
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Blog summary</CardTitle>
        </CardHeader>
        <Block label="Summary" text={data.blog_summary} />
      </Card>
    </div>
  );
}
