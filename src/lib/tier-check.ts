import { auth } from "@/lib/auth";
import { getUserTier } from "@/lib/entitlements";

export async function requireBusinessTierPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const tier = await getUserTier(session.user.id);
  if (tier === "PRO" || tier === "BUSINESS") return true;

  return false;
}
