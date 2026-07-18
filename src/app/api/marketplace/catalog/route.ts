import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasListingEntitlement } from "@/lib/entitlements";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  const [listings, bundles] = await Promise.all([
    prisma.listing.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.bundle.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: { listings: { include: { listing: true } } },
    }),
  ]);

  const listingsWithOwnership = await Promise.all(
    listings.map(async (listing) => ({
      ...listing,
      owned: userId ? await hasListingEntitlement(userId, listing.slug) : false,
    })),
  );

  const bundlesWithSlugs = bundles.map((bundle) => ({
    ...bundle,
    listingSlugs: bundle.listings.map((item) => item.listing.slug),
  }));

  return NextResponse.json({ listings: listingsWithOwnership, bundles: bundlesWithSlugs });
}
