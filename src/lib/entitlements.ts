import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FREE_DAILY_LIMIT = 3;

export async function getUserTier(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return "FREE" as const;
  if (sub.status !== "ACTIVE" && sub.status !== "TRIALING") return "FREE" as const;
  return sub.tier;
}

export async function canUseTool(userId: string, tool: string) {
  const tier = await getUserTier(userId);
  if (tier !== "FREE") return { allowed: true as const, remaining: Infinity };

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const usage = await prisma.toolUsage.findUnique({
    where: { userId_tool_date: { userId, tool, date: today } },
  });
  const used = usage?.count ?? 0;
  return { allowed: used < FREE_DAILY_LIMIT, remaining: Math.max(0, FREE_DAILY_LIMIT - used) };
}

export async function recordToolUsage(userId: string, tool: string) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await prisma.toolUsage.upsert({
    where: { userId_tool_date: { userId, tool, date: today } },
    update: { count: { increment: 1 } },
    create: { userId, tool, date: today },
  });
}

// Per-listing entitlement check, for products (like AN Dev Studio) that are sold
// individually or via a bundle rather than gated by the single global Subscription.tier.
// A bundle purchase writes one Entitlement per listing it contains (source: BUNDLE_PURCHASE,
// see the webhook handler), so this only ever needs to check the direct listing row.
export async function hasListingEntitlement(userId: string, listingSlug: string): Promise<boolean> {
  const listing = await prisma.listing.findUnique({ where: { slug: listingSlug } });
  if (!listing) return false;

  const entitlement = await prisma.entitlement.findUnique({
    where: { userId_listingId: { userId, listingId: listing.id } },
  });
  return entitlement !== null && isEntitlementActive(entitlement);
}

function isEntitlementActive(entitlement: { status: string; currentPeriodEnd: Date | null }): boolean {
  if (entitlement.status !== "ACTIVE") return false;
  if (!entitlement.currentPeriodEnd) return true;
  return entitlement.currentPeriodEnd.getTime() > Date.now();
}

// Explicit, revocable consent check - never assume consent from a purchase or signup.
export async function hasConsent(
  userId: string,
  purpose: "ANU_TRAINING" | "PRODUCT_ANALYTICS" | "MARKETING_EMAIL",
): Promise<boolean> {
  const record = await prisma.consentRecord.findUnique({
    where: { userId_purpose: { userId, purpose } },
  });
  return record?.granted === true && record.revokedAt === null;
}

export async function setConsent(
  userId: string,
  purpose: "ANU_TRAINING" | "PRODUCT_ANALYTICS" | "MARKETING_EMAIL",
  granted: boolean,
) {
  const now = new Date();
  return prisma.consentRecord.upsert({
    where: { userId_purpose: { userId, purpose } },
    update: granted
      ? { granted: true, grantedAt: now, revokedAt: null }
      : { granted: false, revokedAt: now },
    create: { userId, purpose, granted, grantedAt: granted ? now : null, revokedAt: granted ? null : now },
  });
}

export async function requireBusinessTier(userId: string) {
  const tier = await getUserTier(userId);
  if (tier === "PRO" || tier === "BUSINESS") return null;
  return NextResponse.json({ error: "This feature requires a Pro or Business plan" }, { status: 403 });
}
