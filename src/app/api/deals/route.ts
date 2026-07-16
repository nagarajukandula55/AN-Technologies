import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  clientName: z.string().min(1).max(200),
  value: z.number().min(0).default(0),
  expectedCloseDate: z.string().optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deals = await prisma.deal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(deals);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const deal = await prisma.deal.create({
    data: {
      title: parsed.data.title,
      clientName: parsed.data.clientName,
      value: parsed.data.value,
      expectedCloseDate: parsed.data.expectedCloseDate ? new Date(parsed.data.expectedCloseDate) : null,
      userId: session.user.id,
    },
  });
  return NextResponse.json(deal, { status: 201 });
}
