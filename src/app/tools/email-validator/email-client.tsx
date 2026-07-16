"use client";

import { useMemo, useState } from "react";
import { Nav } from "@/components/nav";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function analyze(email: string): { valid: boolean; reason?: string } {
  const trimmed = email.trim();
  if (!trimmed) return { valid: false, reason: "Empty" };
  if (!EMAIL_RE.test(trimmed)) return { valid: false, reason: "Invalid format" };
  if (trimmed.length > 254) return { valid: false, reason: "Too long" };
  const [local] = trimmed.split("@");
  if (local.length > 64) return { valid: false, reason: "Local part too long" };
  return { valid: true };
}

export function EmailValidatorClient() {
  const [input, setInput] = useState("jane@example.com\nnot-an-email\nbob@company");

  const results = useMemo(
    () =>
      input
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((email) => ({ email, ...analyze(email) })),
    [input]
  );

  const validCount = results.filter((r) => r.valid).length;

  function copyValid() {
    navigator.clipboard.writeText(results.filter((r) => r.valid).map((r) => r.email).join("\n"));
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">Email Validator</h1>
        <p className="mt-2 text-slate-600">
          Paste one email per line to check format validity. Free and unlimited — nothing leaves your
          browser. (Format check only — this does not verify the mailbox actually exists.)
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder="one email per line"
          className="mt-6 w-full rounded-md border border-slate-300 p-3 font-mono text-sm"
        />

        <p className="mt-4 text-sm text-slate-600">
          {validCount} of {results.length} valid
        </p>

        <div className="mt-2 space-y-1 text-sm">
          {results.map((r, i) => (
            <div key={i} className={`flex items-center gap-2 ${r.valid ? "text-green-700" : "text-red-700"}`}>
              <span>{r.valid ? "✓" : "✗"}</span>
              <span className="font-mono">{r.email}</span>
              {!r.valid && <span className="text-slate-400">({r.reason})</span>}
            </div>
          ))}
        </div>

        {validCount > 0 && (
          <button
            onClick={copyValid}
            className="mt-4 rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Copy valid emails
          </button>
        )}
      </main>
    </>
  );
}
