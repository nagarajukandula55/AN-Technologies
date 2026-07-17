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
      <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
        <h1 className="text-center text-3xl font-bold">Marketplace</h1>
        <p className="mx-auto mt-2 max-w-md text-center text-slate-600">
          Buy exactly what you need - a single tool, a full product, or everything as a bundle.
        </p>
        <MarketplaceClient />
      </main>
    </>
  );
}
