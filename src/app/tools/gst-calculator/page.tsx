import type { Metadata } from "next";
import { GstCalculatorClient } from "./gst-client";

export const metadata: Metadata = {
  title: "Free GST Calculator — CGST, SGST & IGST",
  description: "Calculate GST-inclusive or exclusive amounts with CGST/SGST/IGST breakdown. Free and unlimited.",
};

export default function GstCalculatorPage() {
  return <GstCalculatorClient />;
}
