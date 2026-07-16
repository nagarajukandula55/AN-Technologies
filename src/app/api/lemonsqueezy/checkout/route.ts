import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckout, PLANS } from "@/lib/lemonsqueezy";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = (await req.json()) as { plan: keyof typeof PLANS };
  const planConfig = PLANS[plan];
  if (!planConfig?.variantId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    const url = await createCheckout({
      variantId: planConfig.variantId,
      userId: session.user.id,
      userEmail: session.user.email,
      plan,
    });
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Could not start checkout" }, { status: 502 });
  }
}
