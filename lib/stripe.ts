import Stripe from "stripe";
import { isBillingEnabled } from "@/lib/billing";

let client: Stripe | null = null;

/**
 * Клиент Stripe создаётся только при включённом биллинге и наличии секрета.
 * Нет выброса при импорте модуля — безопасно подключать из любых роутов.
 */
export function getStripe(): Stripe | null {
  if (!isBillingEnabled()) {
    return null;
  }
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret?.trim()) {
    return null;
  }
  if (!client) {
    client = new Stripe(secret, { typescript: true });
  }
  return client;
}

/** Price ID подписки Pro; плейсхолдер не используем для реальных запросов */
export function getProPriceId(): string | null {
  const id = process.env.STRIPE_PRO_PRICE_ID?.trim();
  if (!id || id === "price_pro_placeholder") {
    return null;
  }
  return id;
}
