"use client";

import { useState } from "react";
import { Nav } from "@/components/nav";
import { FreeTierNotice, LimitReachedBanner } from "@/components/tool-banners";
import { useTier, checkAndRecordUsage } from "@/hooks/use-tier";

function parseCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line) => line.split(",").map((cell) => cell.trim()));
}

function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map((cell) => (cell.includes(",") ? `"${cell}"` : cell)).join(",")).join("\n");
}

export function CsvCleanerClient() {
  const { tier, isPaid } = useTier();
  const [input, setInput] = useState("Name, Email, Age\nJane, jane@example.com, 29\nJane, jane@example.com, 29\nBob,  ,");
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [preview, setPreview] = useState<string[][] | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  function clean(): string[][] {
    let rows = parseCsv(input);
    if (trimWhitespace) {
      rows = rows.map((row) => row.map((cell) => cell.trim()));
    }
    if (removeEmpty) {
      rows = rows.filter((row) => row.some((cell) => cell !== ""));
    }
    if (removeDuplicates) {
      const seen = new Set<string>();
      rows = rows.filter((row) => {
        const key = row.join("|");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    return rows;
  }

  function handlePreview() {
    setPreview(clean());
    setStatus(null);
  }

  async function handleDownload() {
    const usage = await checkAndRecordUsage("csv-cleaner");
    if (!usage.allowed) {
      setLimitReached(true);
      return;
    }
    setLimitReached(false);
    const rows = clean();
    let csv = toCsv(rows);
    if (!isPaid) {
      csv = `# Cleaned with AN Technologies — Free Plan\n${csv}`;
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cleaned.csv";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Cleaned CSV downloaded.");
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">CSV Cleaner</h1>
        <p className="mt-2 text-slate-600">
          Trim whitespace, remove empty rows, and de-duplicate CSV data — entirely in your browser.
        </p>

        <FreeTierNotice tier={tier} toolLabel="downloads" />

        <label className="mt-6 block text-sm font-medium text-slate-700">Paste CSV</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          className="mt-1 w-full rounded-md border border-slate-300 p-3 font-mono text-sm"
        />

        <div className="mt-4 space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={trimWhitespace} onChange={(e) => setTrimWhitespace(e.target.checked)} />
            Trim whitespace
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={removeEmpty} onChange={(e) => setRemoveEmpty(e.target.checked)} />
            Remove empty rows
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={removeDuplicates} onChange={(e) => setRemoveDuplicates(e.target.checked)} />
            Remove duplicate rows
          </label>
        </div>

        <div className="mt-4 flex gap-4">
          <button onClick={handlePreview} className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-50">
            Preview
          </button>
          <button onClick={handleDownload} className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">
            Clean &amp; Download
          </button>
        </div>

        {status && <p className="mt-4 text-sm text-slate-700">{status}</p>}
        {limitReached && <LimitReachedBanner />}

        {preview && (
          <div className="mt-6 overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full text-sm">
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2">
                        {cell || <span className="text-slate-300">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
