import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  counterparty: z.string().min(1).max(200),
  startDate: z.string(),
  endDate: z.string().optional().or(z.literal("")),
  value: z.number().min(0).default(0),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contracts = await prisma.contract.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(contracts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const contract = await prisma.contract.create({
    data: {
      title: parsed.data.title,
      counterparty: parsed.data.counterparty,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      value: parsed.data.value,
      notes: parsed.data.notes,
      userId: session.user.id,
    },
  });
  return NextResponse.json(contract, { status: 201 });
}
