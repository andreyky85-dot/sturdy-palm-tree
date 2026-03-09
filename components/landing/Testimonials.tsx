import { Card } from "@/components/ui/Card";
import { Quote } from "lucide-react";

/**
 * Testimonials: dummy social proof for landing. Replace with real quotes later.
 */
const testimonials = [
  {
    quote:
      "I used to spend an hour turning one YouTube video into threads and LinkedIn posts. Now I do it in under a minute. Game changer.",
    name: "Alex Chen",
    role: "Content creator",
    avatar: null,
  },
  {
    quote:
      "We run a small marketing team. Content Multiplier lets us repurpose webinars and demos into a week of social content without hiring.",
    name: "Jordan Miller",
    role: "Marketing lead",
    avatar: null,
  },
  {
    quote:
      "Finally a tool that actually gives you platform-ready copy, not generic fluff. The Twitter posts are the right length and the LinkedIn ones sound professional.",
    name: "Sam Rivera",
    role: "Founder",
    avatar: null,
  },
];

export function Testimonials() {
  return (
    <section className="border-t border-slate-200 bg-slate-50/50 px-4 py-20" id="testimonials">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
          Loved by creators and marketers
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
          See what people say about repurposing content with Content Multiplier.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {testimonials.map(({ quote, name, role }) => (
            <Card key={name}>
              <Quote className="h-8 w-8 text-slate-300" />
              <blockquote className="mt-3 text-slate-700">
                &ldquo;{quote}&rdquo;
              </blockquote>
              <footer className="mt-4">
                <p className="font-semibold text-slate-900">{name}</p>
                <p className="text-sm text-slate-500">{role}</p>
              </footer>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
