"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type BillingData = {
  tier: string;
  status: string;
  currentPeriodEnd: string | null;
  lsSubscriptionId: string | null;
};

type Invoice = {
  id: string;
  amount: number;
  createdAt: string;
  status: string;
};

const PLAN_DETAILS = {
  FREE: {
    name: "Free",
    price: "$0",
    period: "/month",
    features: [
      "20 utility tools",
      "3 uses/day per tool",
      "Basic features",
    ],
    cta: "Current Plan",
  },
  PRO: {
    name: "Pro",
    price: "$29",
    period: "/month",
    features: [
      "All 36 business apps",
      "Unlimited usage",
      "Priority support",
      "Custom branding",
    ],
    cta: "Upgrade to Pro",
  },
  BUSINESS: {
    name: "Business",
    price: "$99",
    period: "/month",
    features: [
      "All business apps",
      "Unlimited everything",
      "Dedicated support",
      "Advanced analytics",
      "Team management",
      "API access",
    ],
    cta: "Upgrade to Business",
  },
};

export function BillingClient() {
  const router = useRouter();
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const billingRes = await fetch("/api/billing/current");
        const invoicesRes = await fetch("/api/billing/invoices");

        if (billingRes.ok) {
          const data = await billingRes.json();
          setBilling(data);
        }

        if (invoicesRes.ok) {
          const data = await invoicesRes.json();
          setInvoices(data);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (checkoutUrl) {
      router.push(checkoutUrl);
    }
  }, [checkoutUrl, router]);

  async function handleCheckout(plan: "PRO" | "BUSINESS") {
    try {
      const res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (res.ok) {
        const { url } = await res.json();
        setCheckoutUrl(url);
      }
    } catch (err) {
      console.error("Checkout error:", err);
    }
  }

  return (
    <main className="mx-auto max-w-4xl flex-1 px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Billing & Account</h1>
      <p className="text-slate-600 mb-8">Manage your subscription and billing information</p>

      {loading ? (
        <p className="text-slate-600">Loading...</p>
      ) : (
        <div className="space-y-8">
          {/* Current Plan Section */}
          <section className="rounded-lg border border-slate-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
            {billing && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Plan</p>
                  <p className="text-lg font-semibold">{billing.tier}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <p className={`text-lg font-semibold ${
                    billing.status === "ACTIVE" ? "text-green-700" :
                    billing.status === "TRIALING" ? "text-blue-700" :
                    billing.status === "CANCELED" ? "text-red-700" : "text-yellow-700"
                  }`}>
                    {billing.status}
                  </p>
                </div>
                {billing.currentPeriodEnd && (
                  <div>
                    <p className="text-sm text-slate-600">Renews On</p>
                    <p className="text-lg font-semibold">
                      {new Date(billing.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Plans Comparison */}
          <section>
            <h2 className="text-xl font-semibold mb-4">All Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["FREE", "PRO", "BUSINESS"] as const).map((tier) => {
                const plan = PLAN_DETAILS[tier];
                const isCurrent = billing?.tier === tier;

                return (
                  <div
                    key={tier}
                    className={`rounded-lg border p-6 ${
                      isCurrent
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200"
                    }`}
                  >
                    <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
                    <p className="text-2xl font-bold mb-4">
                      {plan.price}
                      <span className="text-sm text-slate-600 font-normal">{plan.period}</span>
                    </p>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="text-sm text-slate-700">
                          ✓ {feature}
                        </li>
                      ))}
                    </ul>
                    {isCurrent ? (
                      <button disabled className="w-full rounded-md bg-slate-200 px-4 py-2 text-slate-700 font-medium">
                        Current Plan
                      </button>
                    ) : tier === "FREE" ? (
                      <button disabled className="w-full rounded-md bg-slate-200 px-4 py-2 text-slate-700 font-medium">
                        Free Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCheckout(tier)}
                        className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 font-medium"
                      >
                        {plan.cta}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Invoices Section */}
          {invoices.length > 0 && (
            <section className="rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-4">Date</th>
                      <th className="text-left py-2 px-4">Amount</th>
                      <th className="text-left py-2 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">${(invoice.amount / 100).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            invoice.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Help Section */}
          <section className="rounded-lg border border-slate-200 p-6 bg-slate-50">
            <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
            <div className="space-y-2 text-sm text-slate-700">
              <p>• Contact us at support@an-technologies.com</p>
              <p>• Check out our <Link href="/help" className="underline">help documentation</Link></p>
              <p>• View our <Link href="/pricing" className="underline">pricing page</Link></p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
