"use client";

import { useState } from "react";
import { Nav } from "@/components/nav";
import { FreeTierNotice, LimitReachedBanner } from "@/components/tool-banners";
import { useTier, checkAndRecordUsage } from "@/hooks/use-tier";

export function OcrClient() {
  const { tier } = useTier();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [busy, setBusy] = useState(false);

  function handleFile(f: File | null) {
    setFile(f);
    setText("");
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function handleExtract() {
    if (!file) {
      setStatus("Choose an image first.");
      return;
    }
    const usage = await checkAndRecordUsage("ocr");
    if (!usage.allowed) {
      setLimitReached(true);
      return;
    }
    setLimitReached(false);
    setStatus(null);
    setBusy(true);
    setProgress(0);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(file);
      setText(data.text);
      await worker.terminate();
      setStatus("Text extracted.");
    } catch {
      setStatus("Something went wrong extracting text from that image.");
    } finally {
      setBusy(false);
    }
  }

  function handleCopy() {
    if (text) navigator.clipboard.writeText(text);
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">OCR — Extract Text from Images</h1>
        <p className="mt-2 text-slate-600">
          Extract text from photos or scanned documents, entirely in your browser.
        </p>

        <FreeTierNotice tier={tier} toolLabel="extractions" />

        <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="mx-auto"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview && <img src={preview} alt="Preview" className="mx-auto mt-4 max-h-64 rounded-md" />}
        </div>

        <button
          onClick={handleExtract}
          disabled={busy}
          className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {busy ? `Extracting… ${progress}%` : "Extract Text"}
        </button>

        {status && <p className="mt-4 text-sm text-slate-700">{status}</p>}
        {limitReached && <LimitReachedBanner />}

        {text && (
          <div className="mt-6">
            <label className="text-sm font-medium text-slate-700">Extracted Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              className="mt-1 w-full rounded-md border border-slate-300 p-3 text-sm"
            />
            <button
              onClick={handleCopy}
              className="mt-2 rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              Copy Text
            </button>
          </div>
        )}
      </main>
    </>
  );
}
