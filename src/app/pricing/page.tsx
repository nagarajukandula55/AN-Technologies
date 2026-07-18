import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { UpgradeButton } from "@/components/upgrade-button";
import { PLANS } from "@/lib/lemonsqueezy";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for PDF, QR, and business tools. Free to start.",
};

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
        <h1 className="text-center text-3xl font-bold text-slate-900">Simple, transparent pricing</h1>
        <p className="mx-auto mt-2 max-w-md text-center text-slate-600">
          Start free with 3 operations/day per tool. Upgrade anytime.
        </p>
        <p className="mx-auto mt-4 max-w-md text-center text-sm text-slate-500">
          Want just one tool instead of a full plan? Buy it individually in the{" "}
          <Link href="/marketplace" className="font-medium text-indigo-600 hover:text-indigo-700">
            Marketplace
          </Link>
          .
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Free</h2>
            <p className="mt-2 text-3xl font-bold text-slate-900">$0</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>3 operations/day per tool</li>
              <li>Watermarked exports</li>
              <li>Community support</li>
            </ul>
          </div>

          {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((key) => {
            const plan = PLANS[key];
            return (
              <div
                key={key}
                className="rounded-2xl border-2 border-indigo-600 bg-gradient-to-br from-indigo-50 via-white to-white p-6 shadow-md shadow-indigo-100"
              >
                <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  ${plan.price}
                  <span className="text-base font-normal text-slate-500">/mo</span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <UpgradeButton plan={key} />
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
