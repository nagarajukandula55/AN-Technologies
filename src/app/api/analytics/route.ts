import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBearerUser } from "@/lib/mobileAuth";
import { requireBusinessTier } from "@/lib/entitlements";

const createSchema = z.object({
  metric: z.string().min(1).max(100),
  value: z.number(),
  source: z.string().optional(),
});

// Bearer fallback so mobile clients (ANu) that authenticated via
// /api/mobile-auth/login (no cookie jar available) can call this route
// too, same convention ANgroup's middleware.ts added for its own mobile
// apps. Cookie session stays primary/unaffected for the web app.
async function getAuthedUserId(req: Request): Promise<string | null> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;
  return getBearerUser(req)?.id ?? null;
}

export async function GET(req: Request) {
  const userId = await getAuthedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tierError = await requireBusinessTier(userId);
  if (tierError) return tierError;

  const data = await prisma.analyticsData.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 100,
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const userId = await getAuthedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tierError = await requireBusinessTier(userId);
  if (tierError) return tierError;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const analytics = await prisma.analyticsData.create({
    data: {
      userId,
      metric: parsed.data.metric,
      value: parsed.data.value,
      source: parsed.data.source,
    },
  });
  return NextResponse.json(analytics, { status: 201 });
}
