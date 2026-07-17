import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  metric: z.string().min(1).max(100),
  value: z.number(),
  source: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await prisma.analyticsData.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 100,
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const analytics = await prisma.analyticsData.create({
    data: {
      userId: session.user.id,
      metric: parsed.data.metric,
      value: parsed.data.value,
      source: parsed.data.source,
    },
  });
  return NextResponse.json(analytics, { status: 201 });
}
