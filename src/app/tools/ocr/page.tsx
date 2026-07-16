import type { Metadata } from "next";
import { OcrClient } from "./ocr-client";

export const metadata: Metadata = {
  title: "Free OCR — Extract Text from Images Online",
  description: "Extract text from photos or scanned documents entirely in your browser. Free, private, no upload required.",
};

export default function OcrPage() {
  return <OcrClient />;
}
