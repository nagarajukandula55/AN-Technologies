// Seeds the initial marketplace catalog: the two existing tools at per-tool pricing,
// plus AN Dev Studio as a paid-only product, and one starter bundle.
//
// Run: npx tsx prisma/seed-listings.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const pdfToolkit = await prisma.listing.upsert({
    where: { slug: "pdf-toolkit" },
    update: {},
    create: {
      slug: "pdf-toolkit",
      name: "PDF Toolkit",
      kind: "TOOL",
      description: "Merge/split PDFs, fully client-side.",
      priceCents: 500,
      currency: "USD",
      billingInterval: "MONTHLY",
    },
  });

  const qrGenerator = await prisma.listing.upsert({
    where: { slug: "qr-barcode-generator" },
    update: {},
    create: {
      slug: "qr-barcode-generator",
      name: "QR & Barcode Generator",
      kind: "TOOL",
      description: "Generate and export QR codes and barcodes.",
      priceCents: 500,
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
      description: "All tools and products in one subscription, at a discount.",
      priceCents: 2500,
      currency: "USD",
      billingInterval: "MONTHLY",
    },
  });

  for (const listing of [pdfToolkit, qrGenerator, anDevStudio]) {
    await prisma.bundleListing.upsert({
      where: { bundleId_listingId: { bundleId: bundle.id, listingId: listing.id } },
      update: {},
      create: { bundleId: bundle.id, listingId: listing.id },
    });
  }

  console.log("Seeded listings:", { pdfToolkit: pdfToolkit.slug, qrGenerator: qrGenerator.slug, anDevStudio: anDevStudio.slug, bundle: bundle.slug });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
