import type { Metadata } from "next";
import { QrToolClient } from "./qr-tool-client";

export const metadata: Metadata = {
  title: "Free QR Code & Barcode Generator — Instant PNG Export",
  description:
    "Generate QR codes and barcodes instantly and export as PNG. Free to use, upgrade for unlimited watermark-free generation.",
};

export default function QrToolPage() {
  return <QrToolClient />;
}
