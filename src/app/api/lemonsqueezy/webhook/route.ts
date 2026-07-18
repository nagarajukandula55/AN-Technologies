import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type { PlanTier, SubscriptionStatus } from "@prisma/client";

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "";
  if (!secret || !signature) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const sigBuffer = Buffer.from(signature, "utf8");
  const digestBuffer = Buffer.from(digest, "utf8");
  if (sigBuffer.length !== digestBuffer.length) return false;
  return crypto.timingSafeEqual(digestBuffer, sigBuffer);
}

function mapStatus(lsStatus: string): SubscriptionStatus {
  switch (lsStatus) {
    case "active":
      return "ACTIVE";
    case "on_trial":
      return "TRIALING";
    case "past_due":
    case "unpaid":
    case "paused":
      return "PAST_DUE";
    case "cancelled":
    case "expired":
      return "CANCELED";
    default:
      return "INCOMPLETE";
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const eventName = payload.meta?.event_name as string | undefined;
  const customData = payload.meta?.custom_data as
    | { user_id?: string; plan?: PlanTier; listing_slug?: string; bundle_slug?: string }
    | undefined;
  const attributes = payload.data?.attributes ?? {};
  const lsSubscriptionId = payload.data?.id as string | undefined;

  if (eventName?.startsWith("subscription_") && lsSubscriptionId && (customData?.listing_slug || customData?.bundle_slug)) {
    return handleListingOrBundleSubscription(customData, attributes, lsSubscriptionId, mapStatus(attributes.status as string));
  }

  if (!eventName?.startsWith("subscription_") || !lsSubscriptionId) {
    return NextResponse.json({ received: true });
  }

  const userId = customData?.user_id;
  const status = mapStatus(attributes.status as string);

  if (eventName === "subscription_created" && userId) {
    await prisma.subscription.upsert({
      where: { userId },
      update: {
        tier: customData?.plan ?? "PRO",
        status,
        lsCustomerId: String(attributes.customer_id ?? ""),
        lsSubscriptionId,
        lsVariantId: String(attributes.variant_id ?? ""),
        currentPeriodEnd: attributes.renews_at ? new Date(attributes.renews_at) : null,
      },
      create: {
        userId,
        tier: customData?.plan ?? "PRO",
        status,
        lsCustomerId: String(attributes.customer_id ?? ""),
        lsSubscriptionId,
        lsVariantId: String(attributes.variant_id ?? ""),
        currentPeriodEnd: attributes.renews_at ? new Date(attributes.renews_at) : null,
      },
    });
  } else {
    const dbSub = await prisma.subscription.findUnique({ where: { lsSubscriptionId } });
    if (dbSub) {
      await prisma.subscription.update({
        where: { id: dbSub.id },
        data: {
          status,
          tier: status === "CANCELED" ? "FREE" : dbSub.tier,
          currentPeriodEnd: attributes.renews_at ? new Date(attributes.renews_at) : dbSub.currentPeriodEnd,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}

// A single listing (e.g. AN Dev Studio sold on its own) or a bundle purchase.
// A bundle grants one Entitlement per listing it contains, so `hasListingEntitlement`
// never needs to walk the bundle graph at check time.
async function handleListingOrBundleSubscription(
  customData: { user_id?: string; listing_slug?: string; bundle_slug?: string },
  attributes: Record<string, unknown>,
  lsSubscriptionId: string,
  status: SubscriptionStatus,
) {
  const userId = customData.user_id;
  if (!userId) return NextResponse.json({ received: true });

  const entitlementStatus = status === "ACTIVE" || status === "TRIALING" ? "ACTIVE" : status === "CANCELED" ? "CANCELED" : "ACTIVE";
  const currentPeriodEnd = attributes.renews_at ? new Date(attributes.renews_at as string) : null;
  const lsOrderId = attributes.order_id ? String(attributes.order_id) : undefined;

  let listingIds: string[] = [];
  if (customData.listing_slug) {
    const listing = await prisma.listing.findUnique({ where: { slug: customData.listing_slug } });
    if (listing) listingIds = [listing.id];
  } else if (customData.bundle_slug) {
    const bundle = await prisma.bundle.findUnique({
      where: { slug: customData.bundle_slug },
      include: { listings: true },
    });
    if (bundle) listingIds = bundle.listings.map((item) => item.listingId);
  }

  const source = customData.listing_slug ? "LISTING_PURCHASE" : "BUNDLE_PURCHASE";

  for (const listingId of listingIds) {
    await prisma.entitlement.upsert({
      where: { userId_listingId: { userId, listingId } },
      update: { status: entitlementStatus, currentPeriodEnd, lsSubscriptionId, lsOrderId },
      create: { userId, listingId, source, status: entitlementStatus, currentPeriodEnd, lsSubscriptionId, lsOrderId },
    });
  }

  return NextResponse.json({ received: true });
}
