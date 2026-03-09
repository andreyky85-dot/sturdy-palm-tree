import { Card } from "@/components/ui/Card";
import { Layers, Zap, Share2, Clock, BarChart3 } from "lucide-react";

/**
 * Five key features for SEO and conversion. Clear value props.
 */
const items = [
  {
    icon: Layers,
    title: "One input, four outputs",
    description:
      "One video URL gives you 10 Twitter posts, 5 LinkedIn posts, 3 TikTok video ideas, and one blog summary. No manual rewriting.",
  },
  {
    icon: Zap,
    title: "AI-optimized for each platform",
    description:
      "GPT tailors tone, length, and hooks for Twitter, LinkedIn, and TikTok so your message fits each audience.",
  },
  {
    icon: Share2,
    title: "Copy and publish in one click",
    description:
      "Every block has a copy button. Paste into Buffer, Hootsuite, or publish directly — no export hassle.",
  },
  {
    icon: Clock,
    title: "Save hours every week",
    description:
      "Stop repurposing by hand. What used to take an hour now takes under a minute.",
  },
  {
    icon: BarChart3,
    title: "Built for creators and marketers",
    description:
      "Whether you’re a solo creator or a marketing team, scale your content without scaling headcount.",
  },
];

export function Features() {
  return (
    <section className="px-4 py-20" id="features">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
          Built for content creators who ship
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          Stop rewriting the same idea for every platform. One link in, 19+ pieces of content out.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <Icon className="h-10 w-10 text-slate-700" />
              <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            </Card>
          ))}
          {items.slice(3).map(({ icon: Icon, title, description }) => (
            <Card key={title} className="sm:col-span-2 lg:col-span-1">
              <Icon className="h-10 w-10 text-slate-700" />
              <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
