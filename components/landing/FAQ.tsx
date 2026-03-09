"use client";

import { useState } from "react";

/**
 * FAQ: 5 questions with answers. Good for SEO and reducing support load.
 */
const items = [
  {
    q: "What video sources are supported?",
    a: "Right now we support YouTube (watch and Shorts URLs). Paste any YouTube link and we’ll pull the transcript and generate your posts. You can also use «Paste transcript» for TikTok, podcasts, or any text—same outputs.",
  },
  {
    q: "How does the free plan work?",
    a: "Free accounts get 5 generations per month. Each generation gives you 10 Twitter posts, 5 LinkedIn posts, 3 TikTok ideas, and 1 blog summary. Sign in with Google to track your usage.",
  },
  {
    q: "Can I cancel Pro anytime?",
    a: "Yes. Pro is a monthly subscription. You can upgrade or cancel from your Dashboard via the Stripe customer portal. No long-term commitment.",
  },
  {
    q: "Is the content unique or generic?",
    a: "The AI uses your actual video transcript, so the ideas and angles come from your content. We optimize tone and length per platform (e.g. short for Twitter, professional for LinkedIn).",
  },
  {
    q: "Do you store my video or transcript?",
    a: "We use the transcript only to call the AI and return the generated posts. We don’t store video files. For details, see our privacy policy.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="border-t border-slate-200 bg-white px-4 py-20" id="faq">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
          Frequently asked questions
        </h2>
        <p className="mt-3 text-center text-slate-600">
          Quick answers to common questions.
        </p>
        <dl className="mt-10 space-y-4">
          {items.map(({ q, a }, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3"
            >
              <dt>
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between text-left font-semibold text-slate-900"
                >
                  {q}
                  <span className="text-slate-400">
                    {openIndex === i ? "−" : "+"}
                  </span>
                </button>
              </dt>
              {openIndex === i && (
                <dd className="mt-2 text-sm text-slate-600">{a}</dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
