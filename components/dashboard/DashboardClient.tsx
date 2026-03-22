"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Me = {
  billingEnabled: boolean;
  user: { email: string; name: string | null; image: string | null; plan: string; hasBilling: boolean };
  usage: { used: number; limit: number };
};

/**
 * Плейсхолдеры в той же сетке, что и готовый дашборд: визуально стабильнее, чем один спиннер,
 * и пользователь сразу видит ожидаемую структуру (аккаунт, usage, подписка).
 */
function DashboardSkeleton() {
  const bar = "h-4 rounded-md bg-slate-200 animate-pulse";
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2" aria-busy="true" aria-label="Загрузка панели управления">
      <Card>
        <CardHeader>
          <div className={`${bar} h-5 w-28`} />
        </CardHeader>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 shrink-0 rounded-full bg-slate-200 animate-pulse" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className={`${bar} w-3/4 max-w-[200px]`} />
            <div className={`${bar} w-full max-w-[240px]`} />
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader>
          <div className={`${bar} h-5 w-40`} />
        </CardHeader>
        <div className={`${bar} h-9 w-32`} />
        <div className={`${bar} mt-3 h-3 w-48`} />
      </Card>
      <Card className="sm:col-span-2">
        <CardHeader>
          <div className={`${bar} h-5 w-36`} />
        </CardHeader>
        <div className={`${bar} h-5 w-48`} />
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="h-10 w-44 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-10 w-32 rounded-lg bg-slate-200 animate-pulse" />
        </div>
      </Card>
    </div>
  );
}

export function DashboardClient() {
  const [data, setData] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  const loadMe = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    fetch("/api/me")
      .then(async (r) => {
        const d = (await r.json()) as Me & { error?: string };
        if (!r.ok || d.error) {
          setData(null);
          setLoadError(d.error ?? "Could not load account data");
          return;
        }
        setData(d);
      })
      .catch(() => {
        setData(null);
        setLoadError("Ошибка сети. Проверьте подключение и попробуйте снова.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const openPortal = async () => {
    setBillingError(null);
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const json = (await res.json()) as { url?: string; error?: string };
      if (json.url) {
        window.location.href = json.url;
        return;
      }
      setBillingError(json.error ?? "Не удалось открыть портал оплаты");
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <p className="font-medium">Не удалось загрузить панель</p>
        <p className="mt-1 text-sm text-amber-800">{loadError ?? "Неизвестная ошибка"}</p>
        <Button className="mt-4" size="md" variant="secondary" onClick={loadMe}>
          Повторить
        </Button>
      </div>
    );
  }

  const { user, usage, billingEnabled } = data;
  const isPro = user.plan === "PRO";
  const limitText = isPro || usage.limit === 0 ? "без лимита" : `${usage.limit} в месяц`;

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <div className="flex items-center gap-4">
          {user.image && (
            // Аватар приходит с CDN Google; список хостов для next/image нестабилен — оставляем img.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="h-12 w-12 rounded-full"
            />
          )}
          <div>
            <p className="font-medium text-slate-900">{user.name ?? user.email}</p>
            <p className="text-sm text-slate-600">{user.email}</p>
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Использование в этом месяце</CardTitle>
        </CardHeader>
        <p className="text-2xl font-bold text-slate-900">
          {usage.used} <span className="text-lg font-normal text-slate-500">/ {limitText}</span>
        </p>
        {!isPro && usage.limit > 0 && usage.used >= usage.limit && (
          <p className="mt-2 text-sm text-amber-700">
            {billingEnabled
              ? "Limit reached. Upgrade to Pro for unlimited."
              : "Достигнут лимит. Платный тариф пока недоступен в этой сборке."}
          </p>
        )}
      </Card>
      <Card className="sm:col-span-2">
        <CardHeader>
          <CardTitle>Подписка</CardTitle>
        </CardHeader>
        <p className="text-slate-700">
          Тариф: <strong>{isPro ? "Pro" : "Free"}</strong>
        </p>
        {!billingEnabled && (
          <p className="mt-2 text-sm text-slate-600">
            Платежи и Stripe отключены по умолчанию — списаний не будет. Для продакшена задайте переменные
            Stripe и <code className="rounded bg-slate-100 px-1 text-xs">BILLING_ENABLED=true</code>.
          </p>
        )}
        {billingError && (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {billingError}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          {billingEnabled && !isPro && (
            <Button
              size="md"
              loading={checkoutLoading}
              onClick={async () => {
                setBillingError(null);
                setCheckoutLoading(true);
                try {
                  const res = await fetch("/api/stripe/checkout", { method: "POST" });
                  const json = (await res.json()) as { url?: string; error?: string };
                  if (json.url) {
                    window.location.href = json.url;
                    return;
                  }
                  setBillingError(json.error ?? "Не удалось начать оплату");
                } finally {
                  setCheckoutLoading(false);
                }
              }}
            >
              Upgrade to Pro
            </Button>
          )}
          {billingEnabled && user.hasBilling && (
            <Button variant="secondary" size="md" loading={portalLoading} onClick={openPortal}>
              Управлять подпиской
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
