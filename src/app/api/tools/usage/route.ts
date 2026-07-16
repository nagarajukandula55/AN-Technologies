import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canUseTool, recordToolUsage } from "@/lib/entitlements";

export async function POST(req: Request) {
  const session = await auth();
  const { tool } = (await req.json()) as { tool: string };

  if (!session?.user?.id) {
    // Anonymous users get a generous but unmetered client-side trial;
    // real enforcement only applies once they're signed in.
    return NextResponse.json({ allowed: true, tier: "ANON" });
  }

  const { allowed, remaining } = await canUseTool(session.user.id, tool);
  if (!allowed) {
    return NextResponse.json({ allowed: false, remaining }, { status: 402 });
  }

  await recordToolUsage(session.user.id, tool);
  return NextResponse.json({ allowed: true, remaining: remaining - 1 });
}
