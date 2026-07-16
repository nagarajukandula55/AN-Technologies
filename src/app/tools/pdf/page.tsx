import type { Metadata } from "next";
import { PdfToolClient } from "./pdf-tool-client";

export const metadata: Metadata = {
  title: "Free PDF Merge & Split Tool — No Upload Required",
  description:
    "Merge or split PDF files entirely in your browser. Free, private, no upload required. Upgrade for unlimited watermark-free exports.",
};

export default function PdfToolkitPage() {
  return <PdfToolClient />;
}
