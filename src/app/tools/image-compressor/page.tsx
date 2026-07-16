import type { Metadata } from "next";
import { CompressorClient } from "./compressor-client";

export const metadata: Metadata = {
  title: "Free Image Compressor Online",
  description: "Shrink image file size by adjusting quality, entirely in your browser. Free, private, no upload required.",
};

export default function ImageCompressorPage() {
  return <CompressorClient />;
}
