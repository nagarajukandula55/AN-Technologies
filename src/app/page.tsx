import Link from "next/link";
import { Nav } from "@/components/nav";

const tools = [
  {
    href: "/tools/pdf",
    name: "PDF Toolkit",
    desc: "Merge and split PDFs in your browser. No upload required.",
  },
  {
    href: "/tools/qr",
    name: "QR & Barcode Generator",
    desc: "Generate branded QR codes and barcodes instantly, export as PNG.",
  },
  {
    href: "/tools/invoice",
    name: "Invoice & Estimate Generator",
    desc: "Print or download invoices, estimates, receipts, and more.",
  },
  {
    href: "/tools/image-compressor",
    name: "Image Compressor",
    desc: "Shrink image file size without leaving your browser.",
  },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Business tools that just work.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
            Fast, no-nonsense utilities for PDFs, QR codes, and more. Free to try, unlimited with Pro.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-md bg-slate-900 px-6 py-3 text-white hover:bg-slate-700"
            >
              Start Free
            </Link>
            <Link
              href="/pricing"
              className="rounded-md border border-slate-300 px-6 py-3 hover:bg-slate-50"
            >
              View Pricing
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <h2 className="mb-8 text-center text-2xl font-semibold">Popular Tools</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="rounded-lg border border-slate-200 p-6 transition hover:border-slate-400 hover:shadow-sm"
              >
                <h3 className="text-lg font-semibold">{tool.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{tool.desc}</p>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-center">
            <Link href="/tools" className="text-sm font-medium underline">
              View all tools →
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}
