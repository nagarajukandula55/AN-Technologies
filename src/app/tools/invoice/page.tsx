import type { Metadata } from "next";
import { InvoiceClient } from "./invoice-client";

export const metadata: Metadata = {
  title: "Free Invoice Generator — Create PDF Invoices Online",
  description:
    "Create professional PDF invoices instantly in your browser. Free, private, no upload required.",
};

export default function InvoicePage() {
  return <InvoiceClient />;
}
