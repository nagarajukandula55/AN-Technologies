import type { Metadata } from "next";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16 prose prose-slate">
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toISOString().slice(0, 10)}</p>

        <h2 className="mt-8 text-lg font-semibold">1. Information We Collect</h2>
        <p className="mt-2 text-slate-700">
          When you create an account, we collect your name and email address. If you sign in with Google,
          we receive your name, email, and profile image from Google. Payment information for paid plans is
          collected and processed directly by our payment provider (Lemon Squeezy) — we do not store your
          card details.
        </p>

        <h2 className="mt-8 text-lg font-semibold">2. Tool Usage &amp; File Processing</h2>
        <p className="mt-2 text-slate-700">
          Our PDF and QR/barcode tools process files entirely in your browser. Files you upload to these
          tools are never sent to our servers. We record only that a tool was used (tool name, timestamp,
          and your account) to enforce free-tier usage limits.
        </p>

        <h2 className="mt-8 text-lg font-semibold">3. How We Use Information</h2>
        <p className="mt-2 text-slate-700">
          We use your information to operate your account, process subscription payments, enforce usage
          limits, and communicate with you about the Service.
        </p>

        <h2 className="mt-8 text-lg font-semibold">4. Data Sharing</h2>
        <p className="mt-2 text-slate-700">
          We share data with service providers necessary to operate the Service: our hosting provider
          (Vercel), database provider (Neon), and payment processor (Lemon Squeezy). We do not sell your
          personal information.
        </p>

        <h2 className="mt-8 text-lg font-semibold">5. Data Retention</h2>
        <p className="mt-2 text-slate-700">
          We retain account data for as long as your account is active. You may request deletion of your
          account and associated data by contacting us.
        </p>

        <h2 className="mt-8 text-lg font-semibold">6. Your Rights</h2>
        <p className="mt-2 text-slate-700">
          You may access, correct, or request deletion of your personal data at any time by contacting us
          at the address below.
        </p>

        <h2 className="mt-8 text-lg font-semibold">7. Contact</h2>
        <p className="mt-2 text-slate-700">
          Questions about this Privacy Policy can be sent to{" "}
          <a href="mailto:anenterprises9396@gmail.com" className="underline">
            anenterprises9396@gmail.com
          </a>
          .
        </p>
      </main>
    </>
  );
}
