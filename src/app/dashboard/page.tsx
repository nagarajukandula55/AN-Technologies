import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { getUserTier } from "@/lib/entitlements";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tier = await getUserTier(session.user.id);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">Welcome back{session.user.name ? `, ${session.user.name}` : ""}</h1>
        <p className="mt-2 text-slate-600">
          Current plan: <span className="font-medium">{tier}</span>
        </p>
        {tier === "FREE" && (
          <Link
            href="/pricing"
            className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Upgrade to Pro
          </Link>
        )}

        <div className="mt-10">
          <Link
            href="/tools"
            className="inline-block rounded-lg border border-slate-200 px-6 py-4 font-medium hover:border-slate-400"
          >
            Browse all 20 tools →
          </Link>
        </div>
      </main>
    </>
  );
}
