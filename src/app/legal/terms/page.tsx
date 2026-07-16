import type { Metadata } from "next";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16 prose prose-slate">
        <h1 className="text-2xl font-semibold">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toISOString().slice(0, 10)}</p>

        <h2 className="mt-8 text-lg font-semibold">1. Agreement to Terms</h2>
        <p className="mt-2 text-slate-700">
          By accessing or using AN Technologies (&quot;the Service&quot;), you agree to be bound by these
          Terms of Service. If you do not agree, do not use the Service.
        </p>

        <h2 className="mt-8 text-lg font-semibold">2. Description of Service</h2>
        <p className="mt-2 text-slate-700">
          AN Technologies provides a suite of online business tools, including a PDF toolkit and a QR/
          barcode generator, offered on a freemium basis with paid subscription tiers for expanded usage
          limits.
        </p>

        <h2 className="mt-8 text-lg font-semibold">3. Accounts</h2>
        <p className="mt-2 text-slate-700">
          You are responsible for maintaining the confidentiality of your account credentials and for all
          activity under your account. You must provide accurate information when creating an account.
        </p>

        <h2 className="mt-8 text-lg font-semibold">4. Subscriptions &amp; Billing</h2>
        <p className="mt-2 text-slate-700">
          Paid subscriptions are billed on a recurring basis (monthly) through our payment processor.
          Subscriptions renew automatically until cancelled. You may cancel at any time from your account;
          cancellation takes effect at the end of the current billing period.
        </p>

        <h2 className="mt-8 text-lg font-semibold">5. Acceptable Use</h2>
        <p className="mt-2 text-slate-700">
          You agree not to use the Service to process content that is illegal, infringes third-party rights,
          or violates applicable law. We reserve the right to suspend accounts that violate this policy.
        </p>

        <h2 className="mt-8 text-lg font-semibold">6. Disclaimer of Warranties</h2>
        <p className="mt-2 text-slate-700">
          The Service is provided &quot;as is&quot; without warranties of any kind, express or implied. We do not
          guarantee uninterrupted or error-free operation.
        </p>

        <h2 className="mt-8 text-lg font-semibold">7. Limitation of Liability</h2>
        <p className="mt-2 text-slate-700">
          To the maximum extent permitted by law, AN Technologies shall not be liable for any indirect,
          incidental, or consequential damages arising from your use of the Service.
        </p>

        <h2 className="mt-8 text-lg font-semibold">8. Changes to These Terms</h2>
        <p className="mt-2 text-slate-700">
          We may update these Terms from time to time. Continued use of the Service after changes take
          effect constitutes acceptance of the revised Terms.
        </p>

        <h2 className="mt-8 text-lg font-semibold">9. Contact</h2>
        <p className="mt-2 text-slate-700">
          Questions about these Terms can be sent to{" "}
          <a href="mailto:anenterprises9396@gmail.com" className="underline">
            anenterprises9396@gmail.com
          </a>
          .
        </p>
      </main>
    </>
  );
}
