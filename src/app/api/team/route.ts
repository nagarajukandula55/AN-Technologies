import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireBusinessTier } from "@/lib/entitlements";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  role: z.string().min(1).max(100),
  department: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const tierError = await requireBusinessTier(session.user.id);
  if (tierError) return tierError;

  const members = await prisma.teamMember.findMany({
    where: { userId: session.user.id },
    orderBy: { joinDate: "desc" },
  });
  return NextResponse.json(members);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const tierError = await requireBusinessTier(session.user.id);
  if (tierError) return tierError;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const member = await prisma.teamMember.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      department: parsed.data.department,
      status: "ACTIVE",
    },
  });
  return NextResponse.json(member, { status: 201 });
}
