/**
 * Управление включением платёжного контура.
 *
 * По умолчанию биллинг выключен: маршруты Stripe не создают сессий оплаты и не списывают деньги,
 * даже если в окружении случайно остались ключи. Включение только явным BILLING_ENABLED=true
 * (осознанный шаг перед продакшеном).
 *
 * Альтернатива «включать при наличии ключа» рискованнее: ключ в .env ≠ согласие запускать оплату.
 */

const ENABLED = "true";

export function isBillingEnabled(): boolean {
  return process.env.BILLING_ENABLED === ENABLED;
}

/** Сообщение для API и UI, когда оплата намеренно отключена */
export const BILLING_DISABLED_USER_MESSAGE =
  "Платежи в этой сборке отключены. Включение — только после настройки Stripe и установки BILLING_ENABLED=true (см. .env.example).";

export const BILLING_DISABLED_API_CODE = "BILLING_DISABLED" as const;
