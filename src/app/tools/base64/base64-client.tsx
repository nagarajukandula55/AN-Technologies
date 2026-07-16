"use client";

import { useState } from "react";
import { Nav } from "@/components/nav";
import { FreeTierNotice, LimitReachedBanner } from "@/components/tool-banners";
import { useTier, checkAndRecordUsage } from "@/hooks/use-tier";

export function Base64Client() {
  const { tier } = useTier();
  const [input, setInput] = useState("Hello, world!");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  async function handleEncode() {
    if (!input) {
      setError("Enter some text first.");
      return;
    }
    const usage = await checkAndRecordUsage("base64");
    if (!usage.allowed) {
      setLimitReached(true);
      return;
    }
    setLimitReached(false);
    setError(null);
    try {
      setOutput(btoa(unescape(encodeURIComponent(input))));
    } catch {
      setError("Could not encode that input.");
    }
  }

  async function handleDecode() {
    if (!input) {
      setError("Enter some Base64 text first.");
      return;
    }
    const usage = await checkAndRecordUsage("base64");
    if (!usage.allowed) {
      setLimitReached(true);
      return;
    }
    setLimitReached(false);
    setError(null);
    try {
      setOutput(decodeURIComponent(escape(atob(input))));
    } catch {
      setError("That doesn't look like valid Base64.");
    }
  }

  function handleCopy() {
    if (output) navigator.clipboard.writeText(output);
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">Base64 Encoder / Decoder</h1>
        <p className="mt-2 text-slate-600">Encode or decode Base64 text instantly, entirely in your browser.</p>

        <FreeTierNotice tier={tier} toolLabel="conversions" />

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          placeholder="Enter text or Base64..."
          className="mt-6 w-full rounded-md border border-slate-300 p-3 font-mono text-sm"
        />

        <div className="mt-4 flex gap-4">
          <button
            onClick={handleEncode}
            className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Encode
          </button>
          <button
            onClick={handleDecode}
            className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-50"
          >
            Decode
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {output && (
          <div className="mt-6">
            <label className="text-sm font-medium text-slate-700">Result</label>
            <textarea
              value={output}
              readOnly
              rows={6}
              className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm"
            />
            <button
              onClick={handleCopy}
              className="mt-2 rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              Copy Result
            </button>
          </div>
        )}

        {limitReached && <LimitReachedBanner />}
      </main>
    </>
  );
}
