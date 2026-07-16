"use client";

import { useState } from "react";
import { Nav } from "@/components/nav";
import { FreeTierNotice, LimitReachedBanner } from "@/components/tool-banners";
import { useTier, checkAndRecordUsage } from "@/hooks/use-tier";

type Mode = "json" | "xml" | "sql";

function formatJson(input: string): string {
  return JSON.stringify(JSON.parse(input), null, 2);
}

function minifyJson(input: string): string {
  return JSON.stringify(JSON.parse(input));
}

function formatXml(input: string): string {
  const PADDING = "  ";
  const collapsed = input.replace(/>\s*</g, "><").trim();
  let pad = 0;
  let out = "";
  const tokens = collapsed.split(/(?=<)/g);
  for (const token of tokens) {
    if (/^<\/\w/.test(token)) {
      pad = Math.max(0, pad - 1);
      out += PADDING.repeat(pad) + token + "\n";
    } else if (/^<\w[^>]*[^/]>$/.test(token) && !/^<\?/.test(token)) {
      out += PADDING.repeat(pad) + token + "\n";
      pad += 1;
    } else {
      out += PADDING.repeat(pad) + token + "\n";
    }
  }
  return out.trim();
}

function formatSql(input: string): string {
  const keywords = [
    "SELECT", "FROM", "WHERE", "AND", "OR", "JOIN", "LEFT JOIN", "RIGHT JOIN",
    "INNER JOIN", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "INSERT INTO",
    "VALUES", "UPDATE", "SET", "DELETE FROM", "CREATE TABLE",
  ];
  let out = input.trim().replace(/\s+/g, " ");
  for (const kw of keywords) {
    out = out.replace(new RegExp(`\\b${kw}\\b`, "gi"), `\n${kw}`);
  }
  return out.trim();
}

export function FormatterClient() {
  const { tier, isPaid } = useTier();
  const [mode, setMode] = useState<Mode>("json");
  const [input, setInput] = useState('{"hello": "world", "nested": {"a": 1, "b": [1,2,3]}}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  async function handleFormat(action: "format" | "minify") {
    if (!input.trim()) {
      setError("Paste some content first.");
      return;
    }
    const usage = await checkAndRecordUsage("formatter");
    if (!usage.allowed) {
      setLimitReached(true);
      return;
    }
    setLimitReached(false);
    setError(null);

    try {
      let result: string;
      if (mode === "json") {
        result = action === "format" ? formatJson(input) : minifyJson(input);
      } else if (mode === "xml") {
        result = formatXml(input);
      } else {
        result = formatSql(input);
      }
      if (!isPaid) {
        result = `-- AN Technologies Free Plan --\n${result}`;
      }
      setOutput(result);
    } catch {
      setError(`Invalid ${mode.toUpperCase()} — check your syntax and try again.`);
    }
  }

  function handleCopy() {
    if (output) navigator.clipboard.writeText(output);
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">JSON / XML / SQL Formatter</h1>
        <p className="mt-2 text-slate-600">Format, validate, and minify structured text — fully in your browser.</p>

        <FreeTierNotice tier={tier} toolLabel="formats" />

        <div className="mt-6 flex gap-3">
          {(["json", "xml", "sql"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-md px-4 py-2 text-sm uppercase ${mode === m ? "bg-slate-900 text-white" : "border border-slate-300"}`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={14}
              className="mt-1 w-full rounded-md border border-slate-300 p-3 font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Output</label>
            <textarea
              value={output}
              readOnly
              rows={14}
              className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-4">
          <button
            onClick={() => handleFormat("format")}
            className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Format
          </button>
          {mode === "json" && (
            <button
              onClick={() => handleFormat("minify")}
              className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-50"
            >
              Minify
            </button>
          )}
          <button
            onClick={handleCopy}
            className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-50"
          >
            Copy Output
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {limitReached && <LimitReachedBanner />}
      </main>
    </>
  );
}
