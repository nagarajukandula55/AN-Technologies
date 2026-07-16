"use client";

import { useEffect, useRef, useState } from "react";
import { Nav } from "@/components/nav";
import { FreeTierNotice, LimitReachedBanner } from "@/components/tool-banners";
import { useTier, checkAndRecordUsage } from "@/hooks/use-tier";

const FONTS = ["48px 'Brush Script MT', cursive", "48px Georgia, serif", "44px 'Segoe Script', cursive"];

export function SignatureClient() {
  const { tier, isPaid } = useTier();
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState("Your Name");
  const [limitReached, setLimitReached] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (mode === "type") {
      ctx.font = FONTS[0];
      ctx.fillStyle = "#111827";
      ctx.textBaseline = "middle";
      ctx.fillText(typedName, 20, canvas.height / 2);
    }
  }, [mode, typedName]);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const point = "touches" in e ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    if (mode !== "draw") return;
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current || mode !== "draw") return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = getPos(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDraw() {
    drawing.current = false;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  async function handleDownload() {
    const usage = await checkAndRecordUsage("signature");
    if (!usage.allowed) {
      setLimitReached(true);
      return;
    }
    setLimitReached(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!isPaid) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.font = "10px sans-serif";
        ctx.fillStyle = "rgba(150,150,150,0.7)";
        ctx.fillText("AN Technologies — Free Plan", 10, canvas.height - 8);
      }
    }

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "signature.png";
    a.click();
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">Signature Generator</h1>
        <p className="mt-2 text-slate-600">Draw or type a signature and export it as a transparent PNG.</p>

        <FreeTierNotice tier={tier} toolLabel="downloads" />

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setMode("draw")}
            className={`rounded-md px-4 py-2 text-sm ${mode === "draw" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
          >
            Draw
          </button>
          <button
            onClick={() => setMode("type")}
            className={`rounded-md px-4 py-2 text-sm ${mode === "type" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
          >
            Type
          </button>
        </div>

        {mode === "type" && (
          <input
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        )}

        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-[repeating-conic-gradient(#f1f5f9_0%_25%,white_0%_50%)] bg-[length:20px_20px] p-2">
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="w-full touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
        </div>

        <div className="mt-4 flex gap-4">
          {mode === "draw" && (
            <button onClick={clearCanvas} className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-50">
              Clear
            </button>
          )}
          <button onClick={handleDownload} className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">
            Download PNG
          </button>
        </div>

        {limitReached && <LimitReachedBanner />}
      </main>
    </>
  );
}
