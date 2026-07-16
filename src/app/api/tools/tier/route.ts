import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserTier } from "@/lib/entitlements";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ tier: "ANON" });
  const tier = await getUserTier(session.user.id);
  return NextResponse.json({ tier });
}
