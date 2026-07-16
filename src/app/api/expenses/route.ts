import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  description: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  amount: z.number().positive(),
  date: z.string(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expenses = await prisma.expense.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(expenses);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const expense = await prisma.expense.create({
    data: {
      description: parsed.data.description,
      category: parsed.data.category,
      amount: parsed.data.amount,
      date: new Date(parsed.data.date),
      userId: session.user.id,
    },
  });
  return NextResponse.json(expense, { status: 201 });
}
