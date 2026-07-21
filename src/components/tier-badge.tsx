"use client";

import { useEffect, useState } from "react";

type Tier = "FREE" | "PRO" | "BUSINESS" | "ANON";

const TIER_COLORS = {
  FREE: "bg-slate-100 text-slate-800",
  PRO: "bg-blue-100 text-blue-800",
  BUSINESS: "bg-purple-100 text-purple-800",
  ANON: "bg-gray-100 text-gray-800",
};

export function TierBadge() {
  const [tier, setTier] = useState<Tier>("ANON");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tools/tier")
      .then((res) => res.json())
      .then((data) => setTier(data.tier))
      .finally(() => setLoading(false));
  }, []);

  if (loading || tier === "ANON") return null;

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${TIER_COLORS[tier]}`}>
      {tier} Plan
    </span>
  );
}
