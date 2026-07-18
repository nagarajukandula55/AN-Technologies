import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
      <p>&copy; {new Date().getFullYear()} AN Technologies. All rights reserved.</p>
      <div className="mt-3 flex justify-center gap-5">
        <Link href="/marketplace" className="transition hover:text-indigo-600">
          Marketplace
        </Link>
        <Link href="/legal/terms" className="transition hover:text-indigo-600">
          Terms
        </Link>
        <Link href="/legal/privacy" className="transition hover:text-indigo-600">
          Privacy
        </Link>
        <Link href="/legal/refund" className="transition hover:text-indigo-600">
          Refunds
        </Link>
      </div>
    </footer>
  );
}
