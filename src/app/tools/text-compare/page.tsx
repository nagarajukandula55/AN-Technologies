import type { Metadata } from "next";
import { CompareClient } from "./compare-client";

export const metadata: Metadata = {
  title: "Free Text Compare / Diff Tool Online",
  description: "Compare two blocks of text line by line. Free, private, unlimited.",
};

export default function TextComparePage() {
  return <CompareClient />;
}
