import type { Metadata } from "next";
import { InvoiceClient } from "./invoice-client";

export const metadata: Metadata = {
  title: "Free Invoice & Estimate Generator — Print or Download PDF",
  description:
    "Create professional invoices and estimates and print directly from your browser, or download as PDF. Free, private, no upload required.",
};

export default function InvoicePage() {
  return <InvoiceClient />;
}
