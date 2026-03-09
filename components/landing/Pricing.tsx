import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Check } from "lucide-react";

/**
 * Pricing: Free (5 generations) and Pro ($19/mo unlimited). Marketing-ready copy.
 */
const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try the full product. No credit card required.",
    features: [
      "5 generations per month",
      "10 Twitter + 5 LinkedIn + 3 TikTok ideas + 1 blog summary each time",
      "Copy to clipboard for every block",
      "Google sign-in to track usage",
    ],
    cta: "Get started free",
    href: "/generator",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Unlimited generations. For creators and teams who ship daily.",
    features: [
      "Unlimited generations",
      "All output formats, same quality",
      "Manage or cancel anytime via Stripe",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    href: "/dashboard",
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section className="border-t border-slate-200 bg-white px-4 py-20" id="pricing">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
          Simple pricing
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
          Start free. Upgrade when you need more. Cancel anytime.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlighted ? "ring-2 ring-slate-900" : ""}
            >
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-slate-500">{plan.period}</span>
              </div>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{plan.description}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href={plan.href}>
                  <Button
                    variant={plan.highlighted ? "primary" : "secondary"}
                    size="lg"
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
