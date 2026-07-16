import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  itemName: z.string().min(1).max(200),
  customerName: z.string().min(1).max(200),
  issue: z.string().min(1).max(2000),
  cost: z.number().min(0).default(0),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const repairs = await prisma.repairTicket.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(repairs);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const repair = await prisma.repairTicket.create({
    data: { ...parsed.data, userId: session.user.id },
  });
  return NextResponse.json(repair, { status: 201 });
}
