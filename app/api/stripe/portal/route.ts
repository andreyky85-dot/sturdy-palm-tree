import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  BILLING_DISABLED_API_CODE,
  BILLING_DISABLED_USER_MESSAGE,
  isBillingEnabled,
} from "@/lib/billing";
import { getStripe } from "@/lib/stripe";

/**
 * Customer Portal — только при включённом биллинге. Клиент ищется по email сессии;
 * если покупки не было, Stripe не вернёт customer — честная 400 без побочных эффектов.
 */
export async function POST() {
  if (!isBillingEnabled()) {
    return NextResponse.json(
      { error: BILLING_DISABLED_USER_MESSAGE, code: BILLING_DISABLED_API_CODE },
      { status: 403 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe не настроен (STRIPE_SECRET_KEY).", code: "STRIPE_MISCONFIGURED" },
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
    const { data: customers } = await stripe.customers.list({
      email: authSession.user.email,
      limit: 1,
    });

    const customer = customers[0];
    if (!customer) {
      return NextResponse.json(
        {
          error:
            "Платёжный профиль в Stripe не найден. Сначала оформите подписку через «Upgrade to Pro».",
          code: "NO_STRIPE_CUSTOMER",
        },
        { status: 400 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${baseUrl}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Portal session failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
