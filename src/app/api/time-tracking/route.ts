import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireBusinessTier } from "@/lib/entitlements";

const createSchema = z.object({
  projectName: z.string().min(1).max(200),
  taskName: z.string().min(1).max(200),
  hours: z.number().min(0).max(24),
  date: z.string(),
  description: z.string().optional(),
  billable: z.boolean().default(true),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const tierError = await requireBusinessTier(session.user.id);
  if (tierError) return tierError;

  const entries = await prisma.timeEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(entries);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const tierError = await requireBusinessTier(session.user.id);
  if (tierError) return tierError;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const entry = await prisma.timeEntry.create({
    data: {
      userId: session.user.id,
      projectName: parsed.data.projectName,
      taskName: parsed.data.taskName,
      hours: parsed.data.hours,
      date: new Date(parsed.data.date),
      description: parsed.data.description,
      billable: parsed.data.billable,
      status: "COMPLETED",
    },
  });
  return NextResponse.json(entry, { status: 201 });
}
