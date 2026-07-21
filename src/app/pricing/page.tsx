import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { UpgradeButton } from "@/components/upgrade-button";
import { PLANS } from "@/lib/lemonsqueezy";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing & Plans",
  description: "Simple, transparent pricing for business tools and utilities. Start free or upgrade to Pro.",
};

export default async function PricingPage() {
  const session = await auth();

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl flex-1 px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-slate-600 mb-2">
            Choose the perfect plan for your business
          </p>
          <p className="text-slate-600">
            Start free with 20 utility tools. Upgrade to access 36 business apps.
          </p>
          <p className="mx-auto mt-4 max-w-md text-center text-sm text-slate-500">
            Want just one tool instead of a full plan? Buy it individually in the{" "}
            <Link href="/marketplace" className="font-medium text-indigo-600 hover:text-indigo-700">
              Marketplace
            </Link>
            .
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3 mb-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Free</h2>
            <p className="text-slate-600 text-sm mb-6">Get started with essentials</p>
            <p className="text-4xl font-bold text-slate-900 mb-6">
              $0<span className="text-lg text-slate-600 font-normal">/month</span>
            </p>
            <button disabled className="w-full rounded-md bg-slate-200 px-4 py-2 text-slate-700 font-medium mb-6">
              Current Plan
            </button>
            <ul className="space-y-3 text-sm">
              <li className="text-green-700">✓ 20 utility tools</li>
              <li className="text-green-700">✓ 3 uses/day per tool</li>
              <li className="text-red-700">✗ No business apps</li>
              <li className="text-red-700">✗ No advanced features</li>
            </ul>
          </div>

          {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((key) => {
            const plan = PLANS[key];
            const isPopular = key === "PRO";
            return (
              <div
                key={key}
                className={
                  isPopular
                    ? "rounded-2xl border-2 border-indigo-600 bg-gradient-to-br from-indigo-50 via-white to-white p-8 shadow-md shadow-indigo-100"
                    : "rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
                }
              >
                {isPopular && (
                  <div className="inline-block bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold mb-3">
                    RECOMMENDED
                  </div>
                )}
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h2>
                <p className="text-slate-600 text-sm mb-6">Perfect for growing businesses</p>
                <p className="text-4xl font-bold text-slate-900 mb-6">
                  ${plan.price}
                  <span className="text-lg text-slate-600 font-normal">/month</span>
                </p>
                <UpgradeButton plan={key} />
                <ul className="mt-6 space-y-3 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="text-green-700">✓ {f}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Complete Feature Comparison</h2>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold">Free</th>
                  <th className="text-center py-3 px-4 font-semibold">Pro</th>
                  <th className="text-center py-3 px-4 font-semibold">Business</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-4">Utility Tools</td>
                  <td className="text-center">20</td>
                  <td className="text-center">20</td>
                  <td className="text-center">20</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50 bg-slate-50">
                  <td className="py-3 px-4">Tool Usage / Day</td>
                  <td className="text-center">3 uses</td>
                  <td className="text-center">Unlimited</td>
                  <td className="text-center">Unlimited</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-4">Business Apps</td>
                  <td className="text-center text-red-600">✗</td>
                  <td className="text-center text-green-600">✓ 36 apps</td>
                  <td className="text-center text-green-600">✓ 36 apps</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50 bg-slate-50">
                  <td className="py-3 px-4">CRM & Contacts</td>
                  <td className="text-center text-red-600">✗</td>
                  <td className="text-center text-green-600">✓</td>
                  <td className="text-center text-green-600">✓</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-4">Sales Pipeline</td>
                  <td className="text-center text-red-600">✗</td>
                  <td className="text-center text-green-600">✓</td>
                  <td className="text-center text-green-600">✓</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50 bg-slate-50">
                  <td className="py-3 px-4">Invoicing & Payments</td>
                  <td className="text-center text-red-600">✗</td>
                  <td className="text-center text-green-600">✓</td>
                  <td className="text-center text-green-600">✓</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-4">Inventory & Projects</td>
                  <td className="text-center text-red-600">✗</td>
                  <td className="text-center text-green-600">✓</td>
                  <td className="text-center text-green-600">✓</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50 bg-slate-50">
                  <td className="py-3 px-4">HRMS & Payroll</td>
                  <td className="text-center text-red-600">✗</td>
                  <td className="text-center text-green-600">✓</td>
                  <td className="text-center text-green-600">✓</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-4">Advanced Analytics</td>
                  <td className="text-center text-red-600">✗</td>
                  <td className="text-center">Basic</td>
                  <td className="text-center">Advanced</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50 bg-slate-50">
                  <td className="py-3 px-4">API Access</td>
                  <td className="text-center text-red-600">✗</td>
                  <td className="text-center text-red-600">✗</td>
                  <td className="text-center text-green-600">✓</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-4">Support</td>
                  <td className="text-center">Community</td>
                  <td className="text-center">Priority Email</td>
                  <td className="text-center">24/7 Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2 text-slate-900">Can I upgrade anytime?</h3>
              <p className="text-slate-600 text-sm">Yes! Upgrade or downgrade anytime. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-slate-900">Can I cancel?</h3>
              <p className="text-slate-600 text-sm">Yes, cancel anytime. No questions asked, no long-term contracts.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-slate-900">What payment methods do you accept?</h3>
              <p className="text-slate-600 text-sm">We accept all major credit cards through our secure payment processor.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-slate-900">Is there a free trial?</h3>
              <p className="text-slate-600 text-sm">Get started free with our Free plan. Try Pro features with a 14-day trial.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        {session?.user?.id ? (
          <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to upgrade?</h2>
            <p className="text-slate-600 mb-6">Start with Pro today and unlock all business apps.</p>
            <Link
              href="/billing"
              className="inline-block rounded-full bg-indigo-600 px-8 py-3 text-white hover:bg-indigo-700 font-medium"
            >
              Go to Billing
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-900 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Get started today</h2>
            <p className="text-slate-300 mb-6">Create your free account and start using our tools immediately.</p>
            <Link
              href="/signup"
              className="inline-block rounded-full bg-white px-8 py-3 text-slate-900 hover:bg-slate-100 font-medium"
            >
              Create Free Account
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
