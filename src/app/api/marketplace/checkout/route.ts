import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createListingCheckout } from "@/lib/lemonsqueezy";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingSlug, bundleSlug } = (await req.json()) as { listingSlug?: string; bundleSlug?: string };
  if (!listingSlug && !bundleSlug) {
    return NextResponse.json({ error: "listingSlug or bundleSlug is required" }, { status: 400 });
  }

  const variantId = listingSlug
    ? (await prisma.listing.findUnique({ where: { slug: listingSlug } }))?.lsVariantId
    : (await prisma.bundle.findUnique({ where: { slug: bundleSlug } }))?.lsVariantId;

  if (!variantId) {
    return NextResponse.json({ error: "This item is not yet available for purchase" }, { status: 400 });
  }

  try {
    const url = await createListingCheckout({
      variantId,
      userId: session.user.id,
      userEmail: session.user.email,
      listingSlug,
      bundleSlug,
    });
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Could not start checkout" }, { status: 502 });
  }
}
