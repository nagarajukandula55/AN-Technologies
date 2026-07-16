"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";
import { Nav } from "@/components/nav";

const DEFAULT_MD = `# Hello, world!

This is a **free** markdown editor with live preview.

- Item one
- Item two

\`\`\`js
console.log("code blocks work too");
\`\`\`
`;

export function MarkdownClient() {
  const [markdown, setMarkdown] = useState(DEFAULT_MD);
  const [html, setHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.resolve(marked.parse(markdown)).then((result) => {
      if (!cancelled) setHtml(result as string);
    });
    return () => {
      cancelled = true;
    };
  }, [markdown]);

  function handleDownload() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">Markdown Editor</h1>
        <p className="mt-2 text-slate-600">Write Markdown with a live preview. Free and unlimited.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            rows={20}
            className="w-full rounded-md border border-slate-300 p-3 font-mono text-sm"
          />
          <div
            className="prose max-w-none rounded-md border border-slate-200 p-4 text-sm [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:text-slate-100 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

        <button
          onClick={handleDownload}
          className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          Download .md
        </button>
      </main>
    </>
  );
}
