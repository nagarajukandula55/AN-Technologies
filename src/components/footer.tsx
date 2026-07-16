import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
      <p>&copy; {new Date().getFullYear()} AN Technologies. All rights reserved.</p>
      <div className="mt-2 flex justify-center gap-4">
        <Link href="/legal/terms" className="hover:text-slate-700">
          Terms
        </Link>
        <Link href="/legal/privacy" className="hover:text-slate-700">
          Privacy
        </Link>
        <Link href="/legal/refund" className="hover:text-slate-700">
          Refunds
        </Link>
      </div>
    </footer>
  );
}
