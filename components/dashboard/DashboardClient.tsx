"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type Me = {
  user: { email: string; name: string | null; image: string | null; plan: string; hasBilling: boolean };
  usage: { used: number; limit: number };
};

export function DashboardClient() {
  const [data, setData] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return;
        setData(d);
      })
      .finally(() => setLoading(false));
  }, []);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="mt-8 flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  const { user, usage } = data;
  const isPro = user.plan === "PRO";
  const limitText = isPro || usage.limit === 0 ? "Unlimited" : `${usage.limit} per month`;

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <div className="flex items-center gap-4">
          {user.image && (
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
          <CardTitle>Usage this month</CardTitle>
        </CardHeader>
        <p className="text-2xl font-bold text-slate-900">
          {usage.used} <span className="text-lg font-normal text-slate-500">/ {limitText}</span>
        </p>
        {!isPro && usage.used >= usage.limit && (
          <p className="mt-2 text-sm text-amber-700">Limit reached. Upgrade to Pro for unlimited.</p>
        )}
      </Card>
      <Card className="sm:col-span-2">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <p className="text-slate-700">
          Plan: <strong>{isPro ? "Pro" : "Free"}</strong>
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {!isPro && (
            <Button
              size="md"
              loading={checkoutLoading}
              onClick={async () => {
                setCheckoutLoading(true);
                try {
                  const res = await fetch("/api/stripe/checkout", { method: "POST" });
                  const json = await res.json();
                  if (json.url) window.location.href = json.url;
                } finally {
                  setCheckoutLoading(false);
                }
              }}
            >
              Upgrade to Pro — $19/mo
            </Button>
          )}
          {user.hasBilling && (
            <Button variant="secondary" size="md" loading={portalLoading} onClick={openPortal}>
              Manage plan
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
