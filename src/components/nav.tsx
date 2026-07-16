import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/lib/actions";

const baseLinks = (
  <>
    <Link href="/tools/pdf" className="text-slate-600 hover:text-slate-900">
      PDF Toolkit
    </Link>
    <Link href="/tools/qr" className="text-slate-600 hover:text-slate-900">
      QR Generator
    </Link>
    <Link href="/pricing" className="text-slate-600 hover:text-slate-900">
      Pricing
    </Link>
  </>
);

// Reads the session via headers(), so it must run inside a real request —
// isolated behind Suspense to avoid Next.js prefetching it outside request scope.
async function NavAuthSection() {
  const session = await auth();

  return session?.user ? (
    <>
      <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
        Dashboard
      </Link>
      <form action={signOutAction}>
        <button className="text-slate-600 hover:text-slate-900">Sign out</button>
      </form>
    </>
  ) : (
    <>
      <Link href="/login" className="text-slate-600 hover:text-slate-900">
        Log in
      </Link>
      <Link
        href="/signup"
        className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
      >
        Get Started
      </Link>
    </>
  );
}

export function Nav() {
  return (
    <header className="border-b border-slate-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          AN Technologies
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {baseLinks}
          <Suspense fallback={null}>
            <NavAuthSection />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
