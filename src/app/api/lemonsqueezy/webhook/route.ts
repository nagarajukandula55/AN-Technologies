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
  const customData = payload.meta?.custom_data as { user_id?: string; plan?: PlanTier } | undefined;
  const attributes = payload.data?.attributes ?? {};
  const lsSubscriptionId = payload.data?.id as string | undefined;

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
