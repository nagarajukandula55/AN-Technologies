import Link from "next/link";

export function UpgradePrompt({ appName }: { appName: string }) {
  return (
    <div className="mx-auto max-w-md flex-1 px-6 py-16 flex flex-col items-center justify-center">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Upgrade Required</h1>
        <p className="text-slate-700 mb-4">
          <strong>{appName}</strong> is available on Pro and Business plans only.
        </p>
        <p className="text-slate-600 text-sm mb-6">
          Upgrade your plan to get access to all 36 business apps and unlimited usage.
        </p>
        <div className="space-y-2">
          <Link
            href="/billing"
            className="block w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 font-medium"
          >
            View Plans & Upgrade
          </Link>
          <Link
            href="/dashboard"
            className="block w-full rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
