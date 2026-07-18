"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { PLANS } from "@/lib/lemonsqueezy";

export function UpgradeButton({ plan }: { plan: keyof typeof PLANS }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!session) {
      router.push("/signup");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/lemonsqueezy/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.url) window.location.href = data.url;
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="mt-6 w-full rounded-full bg-indigo-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
    >
      {loading ? "Redirecting…" : "Upgrade"}
    </button>
  );
}
