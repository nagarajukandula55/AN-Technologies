import Link from "next/link";
import type { Tier } from "@/hooks/use-tier";

export function FreeTierNotice({ tier, toolLabel }: { tier: Tier; toolLabel: string }) {
  if (tier !== "FREE") return null;
  return (
    <p className="mt-2 text-sm text-amber-600">
      Free plan: 3 {toolLabel}/day, watermarked output.{" "}
      <Link href="/pricing" className="underline">
        Upgrade for unlimited, watermark-free access
      </Link>
      .
    </p>
  );
}

export function LimitReachedBanner() {
  return (
    <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
      <p className="text-sm text-amber-800">
        You&apos;ve hit today&apos;s free limit for this tool.{" "}
        <Link href="/pricing" className="font-medium underline">
          Upgrade to Pro
        </Link>{" "}
        for unlimited access.
      </p>
    </div>
  );
}
