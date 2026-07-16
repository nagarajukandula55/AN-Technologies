import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { getUserTier } from "@/lib/entitlements";

const categories = [
  {
    name: "Sales & Customers",
    apps: [
      { href: "/crm", name: "CRM", desc: "Track leads and customers" },
      { href: "/quotations", name: "Quotation Management", desc: "Create, track, and print quotations" },
      { href: "/vendors", name: "Vendor Portal", desc: "Track suppliers and vendors" },
    ],
  },
  {
    name: "Operations",
    apps: [
      { href: "/inventory", name: "Inventory", desc: "Track stock levels and products" },
      { href: "/projects", name: "Projects & Tasks", desc: "Manage projects and to-dos" },
      { href: "/helpdesk", name: "Helpdesk", desc: "Track support tickets" },
      { href: "/appointments", name: "Appointment Booking", desc: "Schedule and track appointments" },
    ],
  },
  {
    name: "HR & Finance",
    apps: [
      { href: "/hrms", name: "HRMS", desc: "Manage employee records" },
      { href: "/attendance", name: "Attendance", desc: "Mark daily attendance" },
      { href: "/payroll", name: "Payroll", desc: "Generate monthly payslips" },
      { href: "/assets", name: "Asset Management", desc: "Track company assets" },
      { href: "/expenses", name: "Expense Tracker", desc: "Log and categorize expenses" },
    ],
  },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tier = await getUserTier(session.user.id);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
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

        {categories.map((category) => (
          <section key={category.name} className="mt-10">
            <h2 className="text-lg font-semibold text-slate-700">{category.name}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {category.apps.map((app) => (
                <Link
                  key={app.href}
                  href={app.href}
                  className="rounded-lg border border-slate-200 p-5 transition hover:border-slate-400"
                >
                  <h3 className="font-semibold">{app.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{app.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
