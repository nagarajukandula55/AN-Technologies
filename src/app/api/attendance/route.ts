import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const date = new Date(dateParam);

  const employees = await prisma.employee.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
    orderBy: { name: "asc" },
    include: { attendance: { where: { date } } },
  });

  const result = employees.map((emp) => ({
    id: emp.id,
    name: emp.name,
    status: emp.attendance[0]?.status ?? null,
  }));

  return NextResponse.json(result);
}

const upsertSchema = z.object({
  employeeId: z.string(),
  date: z.string(),
  status: z.enum(["PRESENT", "ABSENT", "HALF_DAY", "LEAVE"]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const employee = await prisma.employee.findUnique({ where: { id: parsed.data.employeeId } });
  if (!employee || employee.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const date = new Date(parsed.data.date);
  const record = await prisma.attendanceRecord.upsert({
    where: { employeeId_date: { employeeId: parsed.data.employeeId, date } },
    update: { status: parsed.data.status },
    create: { employeeId: parsed.data.employeeId, date, status: parsed.data.status },
  });
  return NextResponse.json(record);
}
