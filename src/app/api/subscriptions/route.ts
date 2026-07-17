import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().min(0),
  interval: z.string(),
  features: z.array(z.string()),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plans = await prisma.subscriptionPlan.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(plans);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const plan = await prisma.subscriptionPlan.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      interval: parsed.data.interval,
      features: parsed.data.features,
      isActive: true,
    },
  });
  return NextResponse.json(plan, { status: 201 });
}
