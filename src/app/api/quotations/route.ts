import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const lineItemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
});

const createSchema = z.object({
  quoteNumber: z.string().min(1).max(100),
  clientName: z.string().min(1).max(200),
  items: z.array(lineItemSchema).min(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quotations = await prisma.quotation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(quotations);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const quotation = await prisma.quotation.create({
    data: {
      quoteNumber: parsed.data.quoteNumber,
      clientName: parsed.data.clientName,
      items: parsed.data.items,
      userId: session.user.id,
    },
  });
  return NextResponse.json(quotation, { status: 201 });
}
