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

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Link
            href="/tools/pdf"
            className="rounded-lg border border-slate-200 p-6 hover:border-slate-400"
          >
            <h2 className="font-semibold">PDF Toolkit</h2>
            <p className="mt-1 text-sm text-slate-600">Merge, split, compress PDFs</p>
          </Link>
          <Link
            href="/tools/qr"
            className="rounded-lg border border-slate-200 p-6 hover:border-slate-400"
          >
            <h2 className="font-semibold">QR & Barcode Generator</h2>
            <p className="mt-1 text-sm text-slate-600">Generate and export codes</p>
          </Link>
        </div>
      </main>
    </>
  );
}
