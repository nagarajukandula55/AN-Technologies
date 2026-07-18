import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { MarketplaceClient } from "./marketplace-client";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Every tool, bundle, and product from AN Technologies, priced individually.",
};

export default function MarketplacePage() {
  return (
    <>
      <Nav />
      <main className="relative flex-1">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-white"
        />
        <div className="mx-auto max-w-5xl px-6 py-16">
          <span className="mx-auto flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
            The AN Technologies Marketplace
          </span>
          <h1 className="mt-4 text-center text-3xl font-bold text-slate-900 sm:text-4xl">
            Everything you need, priced your way
          </h1>
          <p className="mx-auto mt-2 max-w-md text-center text-slate-600">
            Buy exactly what you need — a single tool, a full product, or everything as a bundle.
          </p>
          <MarketplaceClient />
        </div>
      </main>
    </>
  );
}
