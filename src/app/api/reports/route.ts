import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireBusinessTier } from "@/lib/entitlements";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.string().min(1),
  data: z.unknown(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const tierError = await requireBusinessTier(session.user.id);
  if (tierError) return tierError;

  const reports = await prisma.report.findMany({
    where: { userId: session.user.id },
    orderBy: { generatedAt: "desc" },
  });
  return NextResponse.json(reports);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const tierError = await requireBusinessTier(session.user.id);
  if (tierError) return tierError;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const report = await (prisma.report.create as any)({
    data: {
      userId: session.user.id,
      title: parsed.data.title,
      type: parsed.data.type,
      data: parsed.data.data,
      status: "DRAFT",
    },
  });
  return NextResponse.json(report, { status: 201 });
}
