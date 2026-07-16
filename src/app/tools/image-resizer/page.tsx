import type { Metadata } from "next";
import { ResizerClient } from "./resizer-client";

export const metadata: Metadata = {
  title: "Free Image Resizer Online",
  description: "Resize images to exact dimensions entirely in your browser. Free, private, no upload required.",
};

export default function ImageResizerPage() {
  return <ResizerClient />;
}
