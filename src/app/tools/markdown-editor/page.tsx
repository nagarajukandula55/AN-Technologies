import type { Metadata } from "next";
import { MarkdownClient } from "./markdown-client";

export const metadata: Metadata = {
  title: "Free Markdown Editor with Live Preview",
  description: "Write Markdown with a live HTML preview, entirely in your browser. Free and unlimited.",
};

export default function MarkdownEditorPage() {
  return <MarkdownClient />;
}
