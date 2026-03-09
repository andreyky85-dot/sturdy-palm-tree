import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(secret, { typescript: true });

export const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID ?? "price_pro_placeholder";
