import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signMobileToken } from "@/lib/mobileAuth";

/**
 * POST /api/mobile-auth/login — credentials login for mobile/native
 * clients (ANu), separate from NextAuth's own cookie-based
 * /api/auth/[...nextauth] flow, which relies on a browser cookie jar and
 * CSRF token dance not practical for React Native. Same credential check
 * as lib/auth.ts's Credentials provider (prisma User + bcrypt), just
 * returning a portable Bearer token instead of setting a session cookie.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : undefined;
  const password = typeof body?.password === "string" ? body.password : undefined;

  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signMobileToken({ id: user.id, email: user.email });

  return NextResponse.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}
