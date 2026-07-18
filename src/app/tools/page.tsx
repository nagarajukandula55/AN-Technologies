import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "All Tools",
  description: "Browse all free business tools — PDF, QR/barcode, documents, images, and developer utilities.",
};

const categories = [
  {
    name: "Documents",
    tools: [
      { href: "/tools/pdf", name: "PDF Toolkit", desc: "Merge and split PDFs in your browser." },
      {
        href: "/tools/invoice",
        name: "Invoice, Estimate, Receipt & PO Generator",
        desc: "Print or download invoices, estimates, receipts, purchase orders, and delivery notes.",
      },
      { href: "/tools/resume", name: "Resume Builder", desc: "Build a clean PDF resume." },
      { href: "/tools/signature", name: "Signature Generator", desc: "Draw or type a signature, export as PNG." },
    ],
  },
  {
    name: "Images",
    tools: [
      { href: "/tools/image-resizer", name: "Image Resizer", desc: "Resize images to exact dimensions." },
      { href: "/tools/image-compressor", name: "Image Compressor", desc: "Shrink image file size." },
      { href: "/tools/watermark", name: "Watermark Tool", desc: "Add a text watermark to images." },
      { href: "/tools/qr", name: "QR & Barcode Generator", desc: "Generate and export QR codes and barcodes." },
      { href: "/tools/image-converter", name: "Image Format Converter", desc: "Convert between PNG, JPEG, and WebP." },
    ],
  },
  {
    name: "Developer",
    tools: [
      { href: "/tools/json-formatter", name: "JSON / XML / SQL Formatter", desc: "Format and validate structured text." },
      { href: "/tools/base64", name: "Base64 Encoder / Decoder", desc: "Encode or decode Base64 text." },
      { href: "/tools/password-generator", name: "Password Generator", desc: "Generate strong random passwords." },
      { href: "/tools/color-picker", name: "Color Picker", desc: "Pick colors and generate a shade palette." },
      { href: "/tools/text-compare", name: "Text Compare", desc: "Compare two blocks of text line by line." },
      { href: "/tools/csv-cleaner", name: "CSV Cleaner", desc: "Trim, deduplicate, and clean CSV data." },
      { href: "/tools/markdown-editor", name: "Markdown Editor", desc: "Write Markdown with a live preview." },
      { href: "/tools/email-validator", name: "Email Validator", desc: "Check email format validity in bulk." },
      { href: "/tools/api-tester", name: "API Tester", desc: "Send HTTP requests and inspect responses." },
      { href: "/tools/ocr", name: "OCR — Extract Text from Images", desc: "Pull text out of photos or scanned documents." },
    ],
  },
  {
    name: "Business",
    tools: [
      { href: "/tools/gst-calculator", name: "GST Calculator", desc: "Calculate CGST/SGST/IGST breakdowns." },
    ],
  },
];

export default function ToolsIndexPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900">All Tools</h1>
        <p className="mt-2 text-slate-600">
          Every tool runs entirely in your browser — nothing you upload is sent to our servers.{" "}
          <Link href="/marketplace" className="font-medium text-indigo-600 hover:text-indigo-700">
            See pricing in the Marketplace →
          </Link>
        </p>

        {categories.map((category) => (
          <section key={category.name} className="mt-10">
            <h2 className="text-lg font-semibold text-slate-700">{category.name}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {category.tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                >
                  <h3 className="font-semibold text-slate-900">{tool.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
