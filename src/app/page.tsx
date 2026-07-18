import Link from "next/link";
import { Nav } from "@/components/nav";

const tools = [
  {
    href: "/tools/pdf",
    name: "PDF Toolkit",
    desc: "Merge and split PDFs in your browser. No upload required.",
    icon: "📄",
  },
  {
    href: "/tools/qr",
    name: "QR & Barcode Generator",
    desc: "Generate branded QR codes and barcodes instantly, export as PNG.",
    icon: "🔳",
  },
  {
    href: "/tools/invoice",
    name: "Invoice & Estimate Generator",
    desc: "Print or download invoices, estimates, receipts, and more.",
    icon: "🧾",
  },
  {
    href: "/tools/image-compressor",
    name: "Image Compressor",
    desc: "Shrink image file size without leaving your browser.",
    icon: "🖼️",
  },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[480px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-white"
          />
          <div className="mx-auto max-w-6xl px-6 py-24 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
              20+ tools, one marketplace
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Business tools that just work.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
              Fast, no-nonsense utilities for PDFs, QR codes, invoicing, and more. Buy a single
              tool, a full product, or everything as a bundle.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/marketplace"
                className="rounded-full bg-indigo-600 px-6 py-3 font-medium text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700"
              >
                Browse the Marketplace
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Popular Tools</h2>
            <Link href="/marketplace" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View all in Marketplace →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                  {tool.icon}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-indigo-700">
                  {tool.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{tool.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
