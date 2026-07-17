// Seeds the full marketplace catalog: every individual utility tool at per-tool pricing,
// the business-suite modules (CRM/HRMS/POS/etc.) as one bundled product, AN Dev Studio as
// a paid-only product, and one discounted Everything Bundle.
//
// Run: npx tsx prisma/seed-listings.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const UTILITY_TOOL_PRICE_CENTS = 400;

// One listing per page under src/app/tools/<slug> - these were previously gated by a single
// blanket Free/Pro/Business tier; each now has its own price and can be bought individually.
const UTILITY_TOOLS: Array<{ slug: string; name: string; description: string }> = [
  { slug: "pdf-toolkit", name: "PDF Toolkit", description: "Merge/split PDFs, fully client-side." },
  { slug: "qr-barcode-generator", name: "QR & Barcode Generator", description: "Generate and export QR codes and barcodes." },
  { slug: "base64", name: "Base64 Encoder/Decoder", description: "Encode and decode Base64 text and files." },
  { slug: "color-picker", name: "Color Picker", description: "Pick, convert, and copy colors in HEX/RGB/HSL." },
  { slug: "csv-cleaner", name: "CSV Cleaner", description: "Clean and normalize messy CSV data." },
  { slug: "email-validator", name: "Email Validator", description: "Validate email address syntax and deliverability signals." },
  { slug: "gst-calculator", name: "GST Calculator", description: "Calculate GST-inclusive and GST-exclusive amounts." },
  { slug: "image-compressor", name: "Image Compressor", description: "Compress images without visible quality loss." },
  { slug: "image-converter", name: "Image Converter", description: "Convert images between formats." },
  { slug: "image-resizer", name: "Image Resizer", description: "Resize images to exact dimensions." },
  { slug: "invoice-generator", name: "Invoice Generator", description: "Generate one-off invoices as PDF." },
  { slug: "json-formatter", name: "JSON Formatter", description: "Format, validate, and minify JSON." },
  { slug: "markdown-editor", name: "Markdown Editor", description: "Live-preview Markdown editor and exporter." },
  { slug: "ocr", name: "OCR", description: "Extract text from images and scanned documents." },
  { slug: "password-generator", name: "Password Generator", description: "Generate strong, random passwords." },
  { slug: "resume-builder", name: "Resume Builder", description: "Build and export a resume from a template." },
  { slug: "signature-generator", name: "Signature Generator", description: "Create a digital signature image." },
  { slug: "text-compare", name: "Text Compare", description: "Diff two blocks of text." },
  { slug: "watermark", name: "Watermark Tool", description: "Add a watermark to images and PDFs." },
];

async function main() {
  const toolListings = [];
  for (const tool of UTILITY_TOOLS) {
    const listing = await prisma.listing.upsert({
      where: { slug: tool.slug },
      update: {},
      create: {
        slug: tool.slug,
        name: tool.name,
        kind: "TOOL",
        description: tool.description,
        priceCents: UTILITY_TOOL_PRICE_CENTS,
        currency: "USD",
        billingInterval: "MONTHLY",
      },
    });
    toolListings.push(listing);
  }

  // The CRM/HRMS/POS/invoicing/helpdesk/inventory/payroll/etc. business-suite pages are one
  // integrated product, not 20+ separate micro-listings - sold as a single subscription.
  const businessSuite = await prisma.listing.upsert({
    where: { slug: "business-suite" },
    update: {},
    create: {
      slug: "business-suite",
      name: "Business Suite",
      kind: "PRODUCT",
      description: "CRM, HRMS, POS, invoicing, helpdesk, inventory, payroll, and more, in one subscription.",
      priceCents: 3900,
      currency: "USD",
      billingInterval: "MONTHLY",
    },
  });

  // Paid-only from day one - no free tier, per the AN Dev Studio product decision.
  const anDevStudio = await prisma.listing.upsert({
    where: { slug: "an-dev-studio" },
    update: {},
    create: {
      slug: "an-dev-studio",
      name: "AN Dev Studio",
      kind: "PRODUCT",
      description: "Local-first AI app builder with a six-agent build system.",
      priceCents: 1900,
      currency: "USD",
      billingInterval: "MONTHLY",
    },
  });

  const bundle = await prisma.bundle.upsert({
    where: { slug: "everything-bundle" },
    update: {},
    create: {
      slug: "everything-bundle",
      name: "Everything Bundle",
      description: "Every tool, the Business Suite, and AN Dev Studio, in one subscription at a discount.",
      priceCents: 4900,
      currency: "USD",
      billingInterval: "MONTHLY",
    },
  });

  for (const listing of [...toolListings, businessSuite, anDevStudio]) {
    await prisma.bundleListing.upsert({
      where: { bundleId_listingId: { bundleId: bundle.id, listingId: listing.id } },
      update: {},
      create: { bundleId: bundle.id, listingId: listing.id },
    });
  }

  console.log("Seeded listings:", {
    tools: toolListings.length,
    businessSuite: businessSuite.slug,
    anDevStudio: anDevStudio.slug,
    bundle: bundle.slug,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
