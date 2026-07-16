"use client";

import { useState } from "react";
import { Nav } from "@/components/nav";
import { FreeTierNotice, LimitReachedBanner } from "@/components/tool-banners";
import { useTier, checkAndRecordUsage } from "@/hooks/use-tier";
import { loadImageFromFile, canvasToBlob, downloadBlob } from "@/lib/image";

const FORMATS = [
  { label: "PNG", mime: "image/png", ext: "png" },
  { label: "JPEG", mime: "image/jpeg", ext: "jpg" },
  { label: "WebP", mime: "image/webp", ext: "webp" },
];

export function ImageConverterClient() {
  const { tier, isPaid } = useTier();
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState(FORMATS[1]);
  const [status, setStatus] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleConvert() {
    if (!file) {
      setStatus("Choose an image first.");
      return;
    }
    const usage = await checkAndRecordUsage("image-converter");
    if (!usage.allowed) {
      setLimitReached(true);
      return;
    }
    setLimitReached(false);
    setStatus(null);
    setBusy(true);
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      if (format.mime !== "image/png") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      if (!isPaid) {
        ctx.font = `${Math.max(12, Math.round(canvas.width / 40))}px sans-serif`;
        ctx.fillStyle = "rgba(150,150,150,0.6)";
        ctx.fillText("AN Technologies — Free Plan", 10, canvas.height - 10);
      }

      const blob = await canvasToBlob(canvas, format.mime, 0.92);
      downloadBlob(blob, `converted.${format.ext}`);
      setStatus(`Converted to ${format.label}.`);
    } catch {
      setStatus("Something went wrong converting that image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">Image Format Converter</h1>
        <p className="mt-2 text-slate-600">Convert images between PNG, JPEG, and WebP, entirely in your browser.</p>

        <FreeTierNotice tier={tier} toolLabel="conversions" />

        <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mx-auto"
          />
        </div>

        <div className="mt-6 flex gap-3">
          {FORMATS.map((f) => (
            <button
              key={f.mime}
              onClick={() => setFormat(f)}
              className={`rounded-md px-4 py-2 text-sm ${format.mime === f.mime ? "bg-slate-900 text-white" : "border border-slate-300"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleConvert}
          disabled={busy}
          className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Convert &amp; Download
        </button>

        {status && <p className="mt-4 text-sm text-slate-700">{status}</p>}
        {limitReached && <LimitReachedBanner />}
      </main>
    </>
  );
}
