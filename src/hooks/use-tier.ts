"use client";

import { useEffect, useState } from "react";

export type Tier = "ANON" | "FREE" | "PRO" | "BUSINESS";

export function useTier() {
  const [tier, setTier] = useState<Tier>("ANON");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tools/tier")
      .then((res) => res.json())
      .then((data) => setTier(data.tier))
      .finally(() => setLoading(false));
  }, []);

  return { tier, loading, isPaid: tier === "PRO" || tier === "BUSINESS" };
}

export async function checkAndRecordUsage(tool: string): Promise<{ allowed: boolean; remaining?: number }> {
  const res = await fetch("/api/tools/usage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool }),
  });
  if (res.status === 402) {
    const data = await res.json();
    return { allowed: false, remaining: data.remaining };
  }
  const data = await res.json();
  return { allowed: true, remaining: data.remaining };
}
