import { prisma } from "@/lib/prisma";

const FREE_DAILY_LIMIT = 3;

export async function getUserTier(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return "FREE" as const;
  if (sub.status !== "ACTIVE" && sub.status !== "TRIALING") return "FREE" as const;
  return sub.tier;
}

export async function canUseTool(userId: string, tool: string) {
  const tier = await getUserTier(userId);
  if (tier !== "FREE") return { allowed: true as const, remaining: Infinity };

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const usage = await prisma.toolUsage.findUnique({
    where: { userId_tool_date: { userId, tool, date: today } },
  });
  const used = usage?.count ?? 0;
  return { allowed: used < FREE_DAILY_LIMIT, remaining: Math.max(0, FREE_DAILY_LIMIT - used) };
}

export async function recordToolUsage(userId: string, tool: string) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await prisma.toolUsage.upsert({
    where: { userId_tool_date: { userId, tool, date: today } },
    update: { count: { increment: 1 } },
    create: { userId, tool, date: today },
  });
}
