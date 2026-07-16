"use client";

import { useState } from "react";
import { Nav } from "@/components/nav";
import { FreeTierNotice, LimitReachedBanner } from "@/components/tool-banners";
import { useTier, checkAndRecordUsage } from "@/hooks/use-tier";
import { loadImageFromFile, canvasToBlob, downloadBlob } from "@/lib/image";

export function ResizerClient() {
  const { tier, isPaid } = useTier();
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [keepAspect, setKeepAspect] = useState(true);
  const [originalDims, setOriginalDims] = useState<{ w: number; h: number } | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleFile(f: File | null) {
    setFile(f);
    if (f) {
      const img = await loadImageFromFile(f);
      setOriginalDims({ w: img.width, h: img.height });
      setWidth(img.width);
      setHeight(img.height);
    }
  }

  function handleWidthChange(w: number) {
    setWidth(w);
    if (keepAspect && originalDims) {
      setHeight(Math.round((w / originalDims.w) * originalDims.h));
    }
  }

  async function handleResize() {
    if (!file) {
      setStatus("Choose an image first.");
      return;
    }
    const usage = await checkAndRecordUsage("image-resizer");
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
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      if (!isPaid) {
        ctx.font = `${Math.max(12, Math.round(width / 40))}px sans-serif`;
        ctx.fillStyle = "rgba(150,150,150,0.6)";
        ctx.fillText("AN Technologies — Free Plan", 10, height - 10);
      }

      const blob = await canvasToBlob(canvas, "image/png");
      downloadBlob(blob, "resized.png");
      setStatus("Resized successfully.");
    } catch {
      setStatus("Something went wrong resizing that image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">Image Resizer</h1>
        <p className="mt-2 text-slate-600">Resize images to exact dimensions, entirely in your browser.</p>

        <FreeTierNotice tier={tier} toolLabel="resizes" />

        <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="mx-auto"
          />
          {originalDims && (
            <p className="mt-3 text-sm text-slate-600">
              Original: {originalDims.w} × {originalDims.h}px
            </p>
          )}
        </div>

        {file && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Width (px)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Height (px)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                disabled={keepAspect}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100"
              />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" checked={keepAspect} onChange={(e) => setKeepAspect(e.target.checked)} />
              Keep aspect ratio
            </label>
          </div>
        )}

        <button
          onClick={handleResize}
          disabled={busy}
          className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Resize &amp; Download
        </button>

        {status && <p className="mt-4 text-sm text-slate-700">{status}</p>}
        {limitReached && <LimitReachedBanner />}
      </main>
    </>
  );
}
