"use client";

import { useRef, useState } from "react";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { useTier, checkAndRecordUsage } from "@/hooks/use-tier";

export function QrToolClient() {
  const { tier, isPaid } = useTier();
  const [mode, setMode] = useState<"qr" | "barcode">("qr");
  const [text, setText] = useState("https://example.com");
  const [status, setStatus] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function handleGenerate() {
    if (!text.trim()) {
      setStatus("Enter some text or a URL first.");
      return;
    }
    const usage = await checkAndRecordUsage("qr");
    if (!usage.allowed) {
      setLimitReached(true);
      return;
    }
    setLimitReached(false);
    setStatus(null);

    const canvas = canvasRef.current;
    if (!canvas) return;

    if (mode === "qr") {
      await QRCode.toCanvas(canvas, text, { width: 320, margin: 2 });
    } else {
      JsBarcode(canvas, text, { format: "CODE128", width: 2, height: 100 });
    }

    if (!isPaid) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.font = "14px sans-serif";
        ctx.fillStyle = "rgba(150,150,150,0.7)";
        ctx.fillText("AN Technologies — Free Plan", 10, canvas.height - 10);
      }
    }
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${mode}.png`;
    a.click();
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">QR & Barcode Generator</h1>
        <p className="mt-2 text-slate-600">Generate QR codes and barcodes instantly.</p>

        {tier !== "ANON" && tier === "FREE" && (
          <p className="mt-2 text-sm text-amber-600">
            Free plan: 3 generations/day, small watermark.{" "}
            <Link href="/pricing" className="underline">Upgrade for unlimited, watermark-free codes</Link>.
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setMode("qr")}
            className={`rounded-md px-4 py-2 text-sm ${mode === "qr" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
          >
            QR Code
          </button>
          <button
            onClick={() => setMode("barcode")}
            className={`rounded-md px-4 py-2 text-sm ${mode === "barcode" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
          >
            Barcode
          </button>
        </div>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter URL or text"
          className="mt-6 w-full rounded-md border border-slate-300 px-3 py-2"
        />

        <div className="mt-4 flex gap-4">
          <button
            onClick={handleGenerate}
            className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Generate
          </button>
          <button
            onClick={handleDownload}
            className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-50"
          >
            Download PNG
          </button>
        </div>

        {status && <p className="mt-4 text-sm text-slate-700">{status}</p>}

        <div className="mt-8 flex justify-center rounded-lg border border-slate-200 p-8">
          <canvas ref={canvasRef} />
        </div>

        {limitReached && (
          <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              You&apos;ve hit today&apos;s free limit for this tool.{" "}
              <Link href="/pricing" className="font-medium underline">Upgrade to Pro</Link> for unlimited access.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
