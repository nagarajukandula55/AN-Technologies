import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription || !subscription.lsSubscriptionId) {
    return NextResponse.json([]);
  }

  try {
    const invoicesResponse = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${subscription.lsSubscriptionId}/invoices`,
      {
        headers: {
          Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
          Accept: "application/vnd.api+json",
        },
      }
    );

    if (!invoicesResponse.ok) {
      return NextResponse.json([]);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invoices = (await invoicesResponse.json() as any).data?.map((invoice: any) => ({
      id: invoice.id,
      amount: invoice.attributes?.amount ?? 0,
      createdAt: invoice.attributes?.created_at ?? new Date().toISOString(),
      status: invoice.attributes?.status ?? "pending",
    })) ?? [];

    return NextResponse.json(invoices);
  } catch {
    return NextResponse.json([]);
  }
}
