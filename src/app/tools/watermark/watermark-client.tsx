"use client";

import { useState } from "react";
import { Nav } from "@/components/nav";
import { FreeTierNotice, LimitReachedBanner } from "@/components/tool-banners";
import { useTier, checkAndRecordUsage } from "@/hooks/use-tier";
import { loadImageFromFile, canvasToBlob, downloadBlob } from "@/lib/image";

export function WatermarkClient() {
  const { tier, isPaid } = useTier();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("© Your Brand");
  const [opacity, setOpacity] = useState(0.35);
  const [status, setStatus] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleApply() {
    if (!file) {
      setStatus("Choose an image first.");
      return;
    }
    if (!text.trim()) {
      setStatus("Enter watermark text first.");
      return;
    }
    const usage = await checkAndRecordUsage("watermark");
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

      const fontSize = Math.max(20, Math.round(img.width / 15));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = `rgba(255,255,255,${opacity})`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.save();
      ctx.translate(img.width / 2, img.height / 2);
      ctx.rotate((-30 * Math.PI) / 180);
      ctx.fillText(text, 0, 0);
      ctx.restore();

      if (!isPaid) {
        ctx.font = "12px sans-serif";
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(150,150,150,0.7)";
        ctx.fillText("AN Technologies — Free Plan", 10, img.height - 10);
      }

      const blob = await canvasToBlob(canvas, "image/png");
      downloadBlob(blob, "watermarked.png");
      setStatus("Watermark applied.");
    } catch {
      setStatus("Something went wrong applying the watermark.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">Watermark Tool</h1>
        <p className="mt-2 text-slate-600">Add a text watermark to your images, entirely in your browser.</p>

        <FreeTierNotice tier={tier} toolLabel="watermarks" />

        <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mx-auto"
          />
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Watermark Text</label>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="flex justify-between text-sm font-medium text-slate-700">
              <span>Opacity</span>
              <span>{Math.round(opacity * 100)}%</span>
            </label>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </div>
        </div>

        <button
          onClick={handleApply}
          disabled={busy}
          className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Apply &amp; Download
        </button>

        {status && <p className="mt-4 text-sm text-slate-700">{status}</p>}
        {limitReached && <LimitReachedBanner />}
      </main>
    </>
  );
}
