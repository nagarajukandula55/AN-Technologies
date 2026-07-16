import type { Metadata } from "next";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Refund Policy",
};

export default function RefundPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16 prose prose-slate">
        <h1 className="text-2xl font-semibold">Refund Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toISOString().slice(0, 10)}</p>

        <h2 className="mt-8 text-lg font-semibold">Subscription Cancellations</h2>
        <p className="mt-2 text-slate-700">
          You may cancel your subscription at any time from your account dashboard. When you cancel, you
          retain access to paid features until the end of your current billing period; you will not be
          charged again after cancellation.
        </p>

        <h2 className="mt-8 text-lg font-semibold">Refund Eligibility</h2>
        <p className="mt-2 text-slate-700">
          If you believe you were charged in error, or are unsatisfied with the Service within 7 days of a
          charge, contact us at the email below and we will review your request. Refunds are issued at our
          discretion via our payment processor, Lemon Squeezy, and typically take 5–10 business days to
          appear on your statement.
        </p>

        <h2 className="mt-8 text-lg font-semibold">How to Request a Refund</h2>
        <p className="mt-2 text-slate-700">
          Email{" "}
          <a href="mailto:anenterprises9396@gmail.com" className="underline">
            anenterprises9396@gmail.com
          </a>{" "}
          with your account email and the reason for your request. We aim to respond within 2 business
          days.
        </p>
      </main>
    </>
  );
}
