import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  fileName: z.string().min(1).max(200),
  fileSize: z.number().min(1),
  fileType: z.string().min(1),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { uploadedAt: "desc" },
  });
  return NextResponse.json(documents);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const document = await prisma.document.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title,
      fileName: parsed.data.fileName,
      fileSize: parsed.data.fileSize,
      fileType: parsed.data.fileType,
      category: parsed.data.category,
      tags: parsed.data.tags,
    },
  });
  return NextResponse.json(document, { status: 201 });
}
