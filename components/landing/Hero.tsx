import Link from "next/link";
import { Button } from "@/components/ui/Button";

/**
 * Hero: catchy headline and CTA for Product Hunt / landing.
 * Copy is benefit-led and conversion-focused.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Turn 1 video into 19+ posts. In seconds.
        </h1>
        <p className="mt-6 text-lg text-slate-600 sm:text-xl">
          Paste a YouTube or TikTok link. Get 10 Twitter posts, 5 LinkedIn posts, 3 TikTok ideas,
          and a blog summary — written by AI, ready to copy and ship.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/generator">
            <Button size="lg" className="shadow-lg">
              Start generating free
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">
              Sign in with Google
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Free plan: 5 generations per month. No credit card required.
        </p>
      </div>
    </section>
  );
}
