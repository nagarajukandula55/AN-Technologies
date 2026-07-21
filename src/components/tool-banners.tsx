import Link from "next/link";
import type { Tier } from "@/hooks/use-tier";

export function FreeTierNotice({ tier, toolLabel }: { tier: Tier; toolLabel: string }) {
  if (tier !== "FREE") return null;
  return (
    <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <p className="text-sm text-blue-900">
        <strong>Free tier:</strong> Limited to 3 {toolLabel} per day.{" "}
        <Link href="/billing" className="font-semibold underline hover:no-underline">
          Upgrade to Pro
        </Link>
        {" "}for unlimited usage.
      </p>
    </div>
  );
}

export function LimitReachedBanner() {
  return (
    <div className="mt-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
      <p className="text-sm text-orange-900">
        <strong>Daily limit reached.</strong> You&apos;ve used your 3 free uses today.{" "}
        <Link href="/billing" className="font-semibold underline hover:no-underline">
          Upgrade to Pro
        </Link>
        {" "}to continue using this tool.
      </p>
    </div>
  );
}
