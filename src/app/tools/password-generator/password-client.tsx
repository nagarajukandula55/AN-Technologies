"use client";

import { useState, useCallback } from "react";
import { Nav } from "@/components/nav";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

function generatePassword(length: number, opts: { upper: boolean; digits: boolean; symbols: boolean }) {
  let charset = LOWER;
  if (opts.upper) charset += UPPER;
  if (opts.digits) charset += DIGITS;
  if (opts.symbols) charset += SYMBOLS;

  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length];
  }
  return result;
}

export function PasswordClient() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState(() => generatePassword(16, { upper: true, digits: true, symbols: true }));
  const [copied, setCopied] = useState(false);

  const regenerate = useCallback(() => {
    setPassword(generatePassword(length, { upper, digits, symbols }));
    setCopied(false);
  }, [length, upper, digits, symbols]);

  function handleCopy() {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">Password Generator</h1>
        <p className="mt-2 text-slate-600">
          Generate strong, random passwords using your browser&apos;s cryptographically secure random
          number generator. Free and unlimited — nothing is sent to any server.
        </p>

        <div className="mt-8 rounded-lg border border-slate-200 p-6 text-center">
          <p className="break-all font-mono text-xl font-semibold">{password}</p>
          <button
            onClick={handleCopy}
            className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <label className="flex justify-between text-sm font-medium text-slate-700">
              <span>Length</span>
              <span>{length}</span>
            </label>
            <input
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} />
            Include uppercase letters
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={digits} onChange={(e) => setDigits(e.target.checked)} />
            Include digits
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} />
            Include symbols
          </label>
        </div>

        <button
          onClick={regenerate}
          className="mt-6 rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-50"
        >
          Generate New Password
        </button>
      </main>
    </>
  );
}
