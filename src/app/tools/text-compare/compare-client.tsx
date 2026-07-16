"use client";

import { useMemo, useState } from "react";
import { Nav } from "@/components/nav";

type DiffLine = { type: "same" | "added" | "removed"; text: string };

function diffLines(a: string[], b: string[]): DiffLine[] {
  const m = a.length;
  const n = b.length;
  const lcs: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      result.push({ type: "same", text: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      result.push({ type: "removed", text: a[i] });
      i++;
    } else {
      result.push({ type: "added", text: b[j] });
      j++;
    }
  }
  while (i < m) {
    result.push({ type: "removed", text: a[i] });
    i++;
  }
  while (j < n) {
    result.push({ type: "added", text: b[j] });
    j++;
  }
  return result;
}

export function CompareClient() {
  const [left, setLeft] = useState("The quick brown fox\njumps over the lazy dog");
  const [right, setRight] = useState("The quick brown fox\njumped over the lazy dog\ntwice");

  const diff = useMemo(() => diffLines(left.split("\n"), right.split("\n")), [left, right]);

  const stats = useMemo(() => {
    const added = diff.filter((d) => d.type === "added").length;
    const removed = diff.filter((d) => d.type === "removed").length;
    return { added, removed };
  }, [diff]);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">Text Compare</h1>
        <p className="mt-2 text-slate-600">
          Compare two blocks of text line by line. Free and unlimited — nothing leaves your browser.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Original</label>
            <textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              rows={10}
              className="mt-1 w-full rounded-md border border-slate-300 p-3 font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Changed</label>
            <textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              rows={10}
              className="mt-1 w-full rounded-md border border-slate-300 p-3 font-mono text-sm"
            />
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          <span className="text-green-700">+{stats.added} added</span>
          {" · "}
          <span className="text-red-700">-{stats.removed} removed</span>
        </p>

        <div className="mt-4 rounded-md border border-slate-200 p-4 font-mono text-sm">
          {diff.map((line, i) => (
            <div
              key={i}
              className={
                line.type === "added"
                  ? "bg-green-50 text-green-800"
                  : line.type === "removed"
                    ? "bg-red-50 text-red-800 line-through"
                    : "text-slate-700"
              }
            >
              {line.type === "added" ? "+ " : line.type === "removed" ? "- " : "  "}
              {line.text || " "}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
