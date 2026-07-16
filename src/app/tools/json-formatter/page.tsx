import type { Metadata } from "next";
import { FormatterClient } from "./formatter-client";

export const metadata: Metadata = {
  title: "Free JSON, XML & SQL Formatter — Validate & Beautify Online",
  description:
    "Format, validate, and minify JSON, XML, and SQL entirely in your browser. Free, private, no upload required.",
};

export default function JsonFormatterPage() {
  return <FormatterClient />;
}
