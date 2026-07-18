"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Listing = {
  id: string;
  slug: string;
  name: string;
  kind: "TOOL" | "PRODUCT";
  description: string | null;
  priceCents: number;
  currency: string;
  billingInterval: "ONE_TIME" | "MONTHLY" | "YEARLY";
  owned: boolean;
};

type Bundle = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  billingInterval: "ONE_TIME" | "MONTHLY" | "YEARLY";
  listingSlugs: string[];
};

function formatPrice(cents: number, currency: string, interval: string) {
  const amount = (cents / 100).toLocaleString(undefined, { style: "currency", currency });
  const suffix = interval === "MONTHLY" ? "/mo" : interval === "YEARLY" ? "/yr" : "";
  return `${amount}${suffix}`;
}

export function MarketplaceClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/marketplace/catalog")
      .then((res) => res.json())
      .then((data) => {
        setListings(data.listings ?? []);
        setBundles(data.bundles ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function buy(params: { listingSlug?: string; bundleSlug?: string }) {
    if (!session) {
      router.push("/signup");
      return;
    }
    const key = params.listingSlug ?? params.bundleSlug ?? "";
    setPendingSlug(key);
    const res = await fetch("/api/marketplace/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    setPendingSlug(null);
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error ?? "Could not start checkout");
    }
  }

  if (loading) {
    return (
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {[0, 1, 2, 3, 5, 6].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
        ))}
      </div>
    );
  }

  const tools = listings.filter((listing) => listing.kind === "TOOL");
  const products = listings.filter((listing) => listing.kind === "PRODUCT");

  return (
    <div className="mt-12 space-y-16">
      {bundles.length > 0 && (
        <section>
          <SectionHeader icon="🎁" title="Bundles" subtitle="Everything at a discount vs. buying separately." />
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {bundles.map((bundle) => {
              const includedListings = listings.filter((l) => bundle.listingSlugs.includes(l.slug));
              const separatePriceCents = includedListings.reduce((sum, l) => sum + l.priceCents, 0);
              const savingsPercent =
                separatePriceCents > 0
                  ? Math.round(((separatePriceCents - bundle.priceCents) / separatePriceCents) * 100)
                  : 0;

              return (
                <div
                  key={bundle.slug}
                  className="relative overflow-hidden rounded-2xl border-2 border-indigo-600 bg-gradient-to-br from-indigo-50 via-white to-white p-6 shadow-md shadow-indigo-100"
                >
                  {savingsPercent > 0 && (
                    <span className="absolute right-5 top-5 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      Save {savingsPercent}%
                    </span>
                  )}
                  <h3 className="pr-20 text-lg font-semibold text-slate-900">{bundle.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{bundle.description}</p>
                  <div className="mt-4 flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-slate-900">
                      {formatPrice(bundle.priceCents, bundle.currency, bundle.billingInterval)}
                    </p>
                    {separatePriceCents > bundle.priceCents && (
                      <p className="text-sm text-slate-400 line-through">
                        {formatPrice(separatePriceCents, bundle.currency, bundle.billingInterval)}
                      </p>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Includes {bundle.listingSlugs.length} listing{bundle.listingSlugs.length === 1 ? "" : "s"}
                  </p>
                  <button
                    onClick={() => buy({ bundleSlug: bundle.slug })}
                    disabled={pendingSlug === bundle.slug}
                    className="mt-5 w-full rounded-full bg-indigo-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {pendingSlug === bundle.slug ? "Redirecting…" : "Get bundle"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section>
          <SectionHeader icon="🧩" title="Products" subtitle="Full products, priced on their own." />
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {products.map((listing) => (
              <ListingCard key={listing.slug} listing={listing} onBuy={buy} pending={pendingSlug === listing.slug} />
            ))}
          </div>
        </section>
      )}

      {tools.length > 0 && (
        <section>
          <SectionHeader icon="🛠️" title="Tools" subtitle="Buy only what you need, priced per tool." />
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {tools.map((listing) => (
              <ListingCard key={listing.slug} listing={listing} onBuy={buy} pending={pendingSlug === listing.slug} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-lg">{icon}</span>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>
    </div>
  );
}

function ListingCard({
  listing,
  onBuy,
  pending,
}: {
  listing: Listing;
  onBuy: (params: { listingSlug: string }) => void;
  pending: boolean;
}) {
  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
      <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700">{listing.name}</h3>
      {listing.description && <p className="mt-1 flex-1 text-sm text-slate-600">{listing.description}</p>}
      <p className="mt-4 text-2xl font-bold text-slate-900">
        {formatPrice(listing.priceCents, listing.currency, listing.billingInterval)}
      </p>
      {listing.owned ? (
        <span className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          ✓ Owned
        </span>
      ) : (
        <button
          onClick={() => onBuy({ listingSlug: listing.slug })}
          disabled={pending}
          className="mt-4 w-full rounded-full bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-indigo-600 disabled:opacity-50"
        >
          {pending ? "Redirecting…" : "Buy"}
        </button>
      )}
    </div>
  );
}
