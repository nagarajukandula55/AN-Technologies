import type { Metadata } from "next";
import { WatermarkClient } from "./watermark-client";

export const metadata: Metadata = {
  title: "Free Image Watermark Tool Online",
  description: "Add a text watermark to your images entirely in your browser. Free, private, no upload required.",
};

export default function WatermarkPage() {
  return <WatermarkClient />;
}
