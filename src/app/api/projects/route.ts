import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireBusinessTier } from "@/lib/entitlements";

const createSchema = z.object({ name: z.string().min(1).max(200) });

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const tierError = await requireBusinessTier(session.user.id);
  if (tierError) return tierError;

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: { tasks: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const tierError = await requireBusinessTier(session.user.id);
  if (tierError) return tierError;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const project = await prisma.project.create({
    data: { name: parsed.data.name, userId: session.user.id },
    include: { tasks: true },
  });
  return NextResponse.json(project, { status: 201 });
}
