import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  clientName: z.string().min(1).max(200),
  clientEmail: z.string().email().optional(),
  clientPhone: z.string().optional(),
  serviceType: z.string().min(1).max(200),
  date: z.string(),
  duration: z.number().min(15),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const booking = await prisma.booking.create({
    data: {
      userId: session.user.id,
      clientName: parsed.data.clientName,
      clientEmail: parsed.data.clientEmail,
      clientPhone: parsed.data.clientPhone,
      serviceType: parsed.data.serviceType,
      date: new Date(parsed.data.date),
      duration: parsed.data.duration,
      location: parsed.data.location,
      notes: parsed.data.notes,
      status: "CONFIRMED",
    },
  });
  return NextResponse.json(booking, { status: 201 });
}
