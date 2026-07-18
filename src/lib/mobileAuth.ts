import jwt from "jsonwebtoken";

/**
 * Separate from NextAuth's own session mechanism (see lib/auth.ts) —
 * NextAuth v5's "jwt" strategy signs an encrypted JWE session cookie, not
 * a portable bearer token a mobile client can hold and send itself. This
 * is a parallel, deliberately simple HS256 JWT issued only by
 * /api/mobile-auth/login, verified here, and checked as a fallback by any
 * route that wants to support mobile Bearer auth alongside the existing
 * cookie session (see getAuthedUserId in the API routes that use it).
 *
 * No refresh-token flow / 2FA yet — noted as follow-up work, not done in
 * this pass. Token is short-lived (30 days) rather than session-length,
 * so a compromised device token has a real expiry.
 */

function getSecret(): string {
  const secret = process.env.MOBILE_JWT_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("MOBILE_JWT_SECRET (or AUTH_SECRET) must be set to issue/verify mobile tokens.");
  }
  return secret;
}

export interface MobileTokenPayload {
  id: string;
  email: string;
}

export function signMobileToken(payload: MobileTokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "30d" });
}

export function verifyMobileToken(token: string): MobileTokenPayload | null {
  try {
    return jwt.verify(token, getSecret()) as MobileTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Reads a Bearer token from the request's Authorization header, if any.
 * Route handlers combine this with their existing `auth()` session check:
 * `const userId = (await auth())?.user?.id ?? getBearerUser(req)?.id`.
 */
export function getBearerUser(req: Request): MobileTokenPayload | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return verifyMobileToken(header.slice(7));
}
