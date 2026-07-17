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
    return <p className="mt-12 text-center text-slate-500">Loading catalog…</p>;
  }

  const tools = listings.filter((listing) => listing.kind === "TOOL");
  const products = listings.filter((listing) => listing.kind === "PRODUCT");

  return (
    <div className="mt-12 space-y-16">
      {bundles.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Bundles</h2>
          <p className="mt-1 text-sm text-slate-600">Everything at a discount vs. buying separately.</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {bundles.map((bundle) => (
              <div key={bundle.slug} className="rounded-lg border-2 border-slate-900 p-6">
                <h3 className="text-lg font-semibold">{bundle.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{bundle.description}</p>
                <p className="mt-4 text-3xl font-bold">
                  {formatPrice(bundle.priceCents, bundle.currency, bundle.billingInterval)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Includes {bundle.listingSlugs.length} listing{bundle.listingSlugs.length === 1 ? "" : "s"}
                </p>
                <button
                  onClick={() => buy({ bundleSlug: bundle.slug })}
                  disabled={pendingSlug === bundle.slug}
                  className="mt-4 w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
                >
                  {pendingSlug === bundle.slug ? "Redirecting…" : "Get bundle"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Products</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {products.map((listing) => (
              <ListingCard key={listing.slug} listing={listing} onBuy={buy} pending={pendingSlug === listing.slug} />
            ))}
          </div>
        </section>
      )}

      {tools.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Tools</h2>
          <p className="mt-1 text-sm text-slate-600">Buy only what you need, priced per tool.</p>
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
    <div className="rounded-lg border border-slate-200 p-6">
      <h3 className="font-semibold">{listing.name}</h3>
      {listing.description && <p className="mt-1 text-sm text-slate-600">{listing.description}</p>}
      <p className="mt-4 text-2xl font-bold">
        {formatPrice(listing.priceCents, listing.currency, listing.billingInterval)}
      </p>
      {listing.owned ? (
        <span className="mt-4 inline-block rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
          Owned
        </span>
      ) : (
        <button
          onClick={() => onBuy({ listingSlug: listing.slug })}
          disabled={pending}
          className="mt-4 w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {pending ? "Redirecting…" : "Buy"}
        </button>
      )}
    </div>
  );
}
