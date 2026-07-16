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

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/tools"
            className="rounded-lg border border-slate-200 p-6 hover:border-slate-400"
          >
            <h2 className="font-semibold">All Tools</h2>
            <p className="mt-1 text-sm text-slate-600">Browse all 20 free/paid utility tools</p>
          </Link>
          <Link
            href="/crm"
            className="rounded-lg border border-slate-200 p-6 hover:border-slate-400"
          >
            <h2 className="font-semibold">CRM</h2>
            <p className="mt-1 text-sm text-slate-600">Track leads and customers</p>
          </Link>
          <Link
            href="/inventory"
            className="rounded-lg border border-slate-200 p-6 hover:border-slate-400"
          >
            <h2 className="font-semibold">Inventory</h2>
            <p className="mt-1 text-sm text-slate-600">Track stock levels and products</p>
          </Link>
          <Link
            href="/expenses"
            className="rounded-lg border border-slate-200 p-6 hover:border-slate-400"
          >
            <h2 className="font-semibold">Expense Tracker</h2>
            <p className="mt-1 text-sm text-slate-600">Log and categorize expenses</p>
          </Link>
          <Link
            href="/projects"
            className="rounded-lg border border-slate-200 p-6 hover:border-slate-400"
          >
            <h2 className="font-semibold">Projects &amp; Tasks</h2>
            <p className="mt-1 text-sm text-slate-600">Manage projects and to-dos</p>
          </Link>
          <Link
            href="/helpdesk"
            className="rounded-lg border border-slate-200 p-6 hover:border-slate-400"
          >
            <h2 className="font-semibold">Helpdesk</h2>
            <p className="mt-1 text-sm text-slate-600">Track support tickets</p>
          </Link>
          <Link
            href="/appointments"
            className="rounded-lg border border-slate-200 p-6 hover:border-slate-400"
          >
            <h2 className="font-semibold">Appointment Booking</h2>
            <p className="mt-1 text-sm text-slate-600">Schedule and track appointments</p>
          </Link>
          <Link
            href="/quotations"
            className="rounded-lg border border-slate-200 p-6 hover:border-slate-400"
          >
            <h2 className="font-semibold">Quotation Management</h2>
            <p className="mt-1 text-sm text-slate-600">Create, track, and print quotations</p>
          </Link>
          <Link
            href="/vendors"
            className="rounded-lg border border-slate-200 p-6 hover:border-slate-400"
          >
            <h2 className="font-semibold">Vendor Portal</h2>
            <p className="mt-1 text-sm text-slate-600">Track suppliers and vendors</p>
          </Link>
        </div>
      </main>
    </>
  );
}
