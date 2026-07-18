"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Nav() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-sm font-bold text-white shadow-sm">
            AN
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            AN Technologies
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/tools" className="text-slate-600 transition hover:text-slate-900">
            All Tools
          </Link>
          <Link href="/marketplace" className="text-slate-600 transition hover:text-slate-900">
            Marketplace
          </Link>
          <Link href="/pricing" className="text-slate-600 transition hover:text-slate-900">
            Pricing
          </Link>
          {status === "authenticated" && session?.user ? (
            <>
              <Link href="/dashboard" className="text-slate-600 transition hover:text-slate-900">
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-slate-600 transition hover:text-slate-900"
              >
                Sign out
              </button>
            </>
          ) : status === "unauthenticated" ? (
            <>
              <Link href="/login" className="text-slate-600 transition hover:text-slate-900">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-indigo-600 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-700"
              >
                Get Started
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
