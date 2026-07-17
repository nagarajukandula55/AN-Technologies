import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  content: z.string().min(1),
  category: z.string().optional(),
});

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const articles = await prisma.article.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(articles);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const slug = parsed.data.slug || generateSlug(parsed.data.title);
  const existing = await prisma.article.findUnique({
    where: { userId_slug: { userId: session.user.id, slug } },
  });
  if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 400 });

  const article = await prisma.article.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title,
      slug,
      content: parsed.data.content,
      category: parsed.data.category,
      status: "PUBLISHED",
    },
  });
  return NextResponse.json(article, { status: 201 });
}
