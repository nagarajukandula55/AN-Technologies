"use client";

import { useState } from "react";
import { Nav } from "@/components/nav";
import { FreeTierNotice, LimitReachedBanner } from "@/components/tool-banners";
import { useTier, checkAndRecordUsage } from "@/hooks/use-tier";
import { loadImageFromFile, canvasToBlob, downloadBlob } from "@/lib/image";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function CompressorClient() {
  const { tier } = useTier();
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.7);
  const [status, setStatus] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleCompress() {
    if (!file) {
      setStatus("Choose an image first.");
      return;
    }
    const usage = await checkAndRecordUsage("image-compressor");
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
      ctx.drawImage(img, 0, 0);

      const blob = await canvasToBlob(canvas, "image/jpeg", quality);
      setResultSize(blob.size);
      downloadBlob(blob, "compressed.jpg");
      const savings = Math.round((1 - blob.size / file.size) * 100);
      setStatus(savings > 0 ? `Compressed successfully — ${savings}% smaller.` : "Compressed successfully.");
    } catch {
      setStatus("Something went wrong compressing that image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">Image Compressor</h1>
        <p className="mt-2 text-slate-600">Shrink image file size by adjusting quality, entirely in your browser.</p>

        <FreeTierNotice tier={tier} toolLabel="compressions" />

        <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mx-auto"
          />
          {file && (
            <p className="mt-3 text-sm text-slate-600">Original: {formatSize(file.size)}</p>
          )}
        </div>

        <div className="mt-6">
          <label className="flex justify-between text-sm font-medium text-slate-700">
            <span>Quality</span>
            <span>{Math.round(quality * 100)}%</span>
          </label>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </div>

        <button
          onClick={handleCompress}
          disabled={busy}
          className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Compress &amp; Download
        </button>

        {status && (
          <p className="mt-4 text-sm text-slate-700">
            {status} {resultSize ? `New size: ${formatSize(resultSize)}` : ""}
          </p>
        )}
        {limitReached && <LimitReachedBanner />}
      </main>
    </>
  );
}
