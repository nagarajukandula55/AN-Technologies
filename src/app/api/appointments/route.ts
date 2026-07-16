import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  clientName: z.string().min(1).max(200),
  startTime: z.string(),
  durationMinutes: z.number().int().positive().default(30),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const appointments = await prisma.appointment.findMany({
    where: { userId: session.user.id },
    orderBy: { startTime: "asc" },
  });
  return NextResponse.json(appointments);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const appointment = await prisma.appointment.create({
    data: {
      title: parsed.data.title,
      clientName: parsed.data.clientName,
      startTime: new Date(parsed.data.startTime),
      durationMinutes: parsed.data.durationMinutes,
      notes: parsed.data.notes,
      userId: session.user.id,
    },
  });
  return NextResponse.json(appointment, { status: 201 });
}
