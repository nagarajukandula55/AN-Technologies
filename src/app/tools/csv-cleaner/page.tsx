import type { Metadata } from "next";
import { CsvCleanerClient } from "./csv-client";

export const metadata: Metadata = {
  title: "Free CSV Cleaner — Trim, Deduplicate & Clean CSV Data",
  description:
    "Trim whitespace, remove empty rows, and de-duplicate CSV data entirely in your browser. Free, private, no upload required.",
};

export default function CsvCleanerPage() {
  return <CsvCleanerClient />;
}
