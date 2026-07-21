import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireBusinessTier } from "@/lib/entitlements";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().max(100).optional().or(z.literal("")),
  serialNumber: z.string().max(100).optional().or(z.literal("")),
  value: z.number().min(0).default(0),
  purchaseDate: z.string().optional().or(z.literal("")),
  assignedToId: z.string().optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const tierError = await requireBusinessTier(session.user.id);
  if (tierError) return tierError;

  const assets = await prisma.asset.findMany({
    where: { userId: session.user.id },
    include: { assignedTo: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(assets);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const tierError = await requireBusinessTier(session.user.id);
  if (tierError) return tierError;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const asset = await prisma.asset.create({
    data: {
      name: parsed.data.name,
      category: parsed.data.category,
      serialNumber: parsed.data.serialNumber,
      value: parsed.data.value,
      purchaseDate: parsed.data.purchaseDate ? new Date(parsed.data.purchaseDate) : null,
      assignedToId: parsed.data.assignedToId || null,
      userId: session.user.id,
    },
    include: { assignedTo: { select: { id: true, name: true } } },
  });
  return NextResponse.json(asset, { status: 201 });
}
