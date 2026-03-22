import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  BILLING_DISABLED_API_CODE,
  BILLING_DISABLED_USER_MESSAGE,
  isBillingEnabled,
} from "@/lib/billing";
import { getProPriceId, getStripe } from "@/lib/stripe";

/**
 * Создание Checkout Session только при BILLING_ENABLED=true и валидных Stripe-переменных.
 * Иначе 403 без обращения к Stripe API — нулевой финансовый риск по умолчанию.
 */
export async function POST() {
  if (!isBillingEnabled()) {
    return NextResponse.json(
      { error: BILLING_DISABLED_USER_MESSAGE, code: BILLING_DISABLED_API_CODE },
      { status: 403 }
    );
  }

  const stripe = getStripe();
  const priceId = getProPriceId();
  if (!stripe || !priceId) {
    return NextResponse.json(
      {
        error:
          "Stripe не настроен: задайте STRIPE_SECRET_KEY и реальный STRIPE_PRO_PRICE_ID из Stripe Dashboard.",
        code: "STRIPE_MISCONFIGURED",
      },
      { status: 503 }
    );
  }

  const authSession = await getServerSession(authOptions);
  if (!authSession?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: authSession.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/dashboard?checkout=cancel`,
      allow_promotion_codes: true,
      metadata: {
        userId: authSession.user.id ?? "",
        app: "textflow",
      },
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ error: "Stripe did not return checkout URL" }, { status: 502 });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
