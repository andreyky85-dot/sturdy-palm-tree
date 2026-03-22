import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { isBillingEnabled } from "@/lib/billing";
import { getStripe } from "@/lib/stripe";

/**
 * Webhook при выключенном биллинге не проверяет подпись и сразу отвечает 200 —
 * чтобы случайный endpoint в Stripe Dashboard не крутил ретраи с ошибками.
 * При BILLING_ENABLED=true — проверка подписи обязательна; обновление плана в БД — отдельный этап.
 */
export async function POST(req: Request) {
  if (!isBillingEnabled()) {
    return NextResponse.json({ received: true, billing: "disabled" });
  }

  const stripe = getStripe();
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !whSecret) {
    return NextResponse.json(
      { error: "Webhook включён (BILLING_ENABLED), но нет STRIPE_WEBHOOK_SECRET или Stripe-клиента." },
      { status: 503 }
    );
  }

  const rawBody = await req.text();
  const sig = headers().get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe-Signature" }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
    // Синхронизация подписки с Prisma — когда появится постоянное хранилище customer id.
    console.info("[stripe webhook]", event.type, event.id);
    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
