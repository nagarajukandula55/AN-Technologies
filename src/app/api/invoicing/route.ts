import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireBusinessTier } from "@/lib/entitlements";

const createSchema = z.object({
  invoiceNumber: z.string().min(1).max(50),
  clientName: z.string().min(1).max(200),
  clientEmail: z.string().email().optional(),
  items: z.array(z.object({
    id: z.string(),
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
  })),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const tierError = await requireBusinessTier(session.user.id);
  if (tierError) return tierError;

  const invoices = await prisma.invoice.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(invoices);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const tierError = await requireBusinessTier(session.user.id);
  if (tierError) return tierError;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const invoice = await prisma.invoice.create({
    data: {
      userId: session.user.id,
      invoiceNumber: parsed.data.invoiceNumber,
      clientName: parsed.data.clientName,
      clientEmail: parsed.data.clientEmail,
      items: parsed.data.items,
      subtotal: parsed.data.subtotal,
      tax: parsed.data.tax,
      total: parsed.data.total,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      notes: parsed.data.notes,
      status: "DRAFT",
    },
  });
  return NextResponse.json(invoice, { status: 201 });
}
