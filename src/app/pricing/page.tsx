import { Nav } from "@/components/nav";
import { UpgradeButton } from "@/components/upgrade-button";
import { PLANS } from "@/lib/lemonsqueezy";

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
        <h1 className="text-center text-3xl font-bold">Simple, transparent pricing</h1>
        <p className="mx-auto mt-2 max-w-md text-center text-slate-600">
          Start free with 3 operations/day per tool. Upgrade anytime.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold">Free</h2>
            <p className="mt-2 text-3xl font-bold">$0</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>3 operations/day per tool</li>
              <li>Watermarked exports</li>
              <li>Community support</li>
            </ul>
          </div>

          {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((key) => {
            const plan = PLANS[key];
            return (
              <div key={key} className="rounded-lg border-2 border-slate-900 p-6">
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                <p className="mt-2 text-3xl font-bold">
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
