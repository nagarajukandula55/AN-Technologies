import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireBusinessTier } from "@/lib/entitlements";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const tierError = await requireBusinessTier(session.user.id);
  if (tierError) return tierError;

  const { id } = await params;
  const existing = await prisma.vendor.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.vendor.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
