import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  trigger: z.string().min(1),
  actions: z.array(z.object({
    type: z.string(),
    config: z.record(z.string(), z.unknown()),
  })),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workflows = await prisma.workflow.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(workflows);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workflow = await (prisma.workflow.create as any)({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      trigger: parsed.data.trigger,
      actions: parsed.data.actions,
      isActive: true,
    },
  });
  return NextResponse.json(workflow, { status: 201 });
}
