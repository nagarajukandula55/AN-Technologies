import type { Metadata } from "next";
import { ImageConverterClient } from "./converter-client";

export const metadata: Metadata = {
  title: "Free Image Format Converter — PNG, JPEG, WebP",
  description: "Convert images between PNG, JPEG, and WebP entirely in your browser. Free, private, no upload required.",
};

export default function ImageConverterPage() {
  return <ImageConverterClient />;
}
