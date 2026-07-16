import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature ?? "",
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch {
    return NextResponse.json({ error: `Webhook signature verification failed` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as "PRO" | "BUSINESS" | undefined;
      if (userId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await prisma.subscription.update({
          where: { userId },
          data: {
            tier: plan ?? "PRO",
            status: "ACTIVE",
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
          },
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const dbSub = await prisma.subscription.findFirst({
        where: { stripeCustomerId: subscription.customer as string },
      });
      if (dbSub) {
        const status =
          subscription.status === "active"
            ? "ACTIVE"
            : subscription.status === "trialing"
              ? "TRIALING"
              : subscription.status === "past_due"
                ? "PAST_DUE"
                : event.type === "customer.subscription.deleted"
                  ? "CANCELED"
                  : "INCOMPLETE";

        await prisma.subscription.update({
          where: { id: dbSub.id },
          data: {
            status,
            tier: status === "CANCELED" ? "FREE" : dbSub.tier,
            currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
          },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
