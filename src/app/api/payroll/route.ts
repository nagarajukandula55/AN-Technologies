import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);

  const employees = await prisma.employee.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
    orderBy: { name: "asc" },
    include: { payslips: { where: { month } } },
  });

  const result = employees.map((emp) => ({
    id: emp.id,
    name: emp.name,
    monthlySalary: emp.monthlySalary,
    payslip: emp.payslips[0] ?? null,
  }));

  return NextResponse.json(result);
}

const createSchema = z.object({
  employeeId: z.string(),
  month: z.string(),
  deductions: z.number().min(0).default(0),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const employee = await prisma.employee.findUnique({ where: { id: parsed.data.employeeId } });
  if (!employee || employee.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const netPay = employee.monthlySalary - parsed.data.deductions;
  const payslip = await prisma.payslip.upsert({
    where: { employeeId_month: { employeeId: parsed.data.employeeId, month: parsed.data.month } },
    update: { deductions: parsed.data.deductions, basicSalary: employee.monthlySalary, netPay },
    create: {
      employeeId: parsed.data.employeeId,
      month: parsed.data.month,
      basicSalary: employee.monthlySalary,
      deductions: parsed.data.deductions,
      netPay,
    },
  });
  return NextResponse.json(payslip);
}
