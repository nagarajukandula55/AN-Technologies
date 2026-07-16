"use client";

import { useState } from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { useTier, checkAndRecordUsage } from "@/hooks/use-tier";

async function addWatermark(doc: PDFDocument) {
  const pages = doc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText("AN Technologies — Free Plan", {
      x: width / 2 - 140,
      y: height / 2,
      size: 24,
      rotate: degrees(45),
      color: rgb(0.8, 0.8, 0.8),
      opacity: 0.5,
    });
  }
}

function download(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function PdfToolClient() {
  const { tier, isPaid } = useTier();
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [busy, setBusy] = useState(false);

  async function gate(): Promise<boolean> {
    const usage = await checkAndRecordUsage("pdf");
    if (!usage.allowed) {
      setLimitReached(true);
      return false;
    }
    return true;
  }

  async function handleMerge() {
    if (files.length < 2) {
      setStatus("Select at least 2 PDF files to merge.");
      return;
    }
    if (!(await gate())) return;
    setBusy(true);
    setStatus(null);
    try {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const src = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      if (!isPaid) await addWatermark(merged);
      const out = await merged.save();
      download(out, "merged.pdf");
      setStatus("Merged successfully.");
    } catch {
      setStatus("Something went wrong merging those files.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSplit() {
    if (files.length !== 1) {
      setStatus("Select exactly 1 PDF file to split (each page becomes its own file).");
      return;
    }
    if (!(await gate())) return;
    setBusy(true);
    setStatus(null);
    try {
      const bytes = await files[0].arrayBuffer();
      const src = await PDFDocument.load(bytes);
      const pageCount = src.getPageCount();
      for (let i = 0; i < pageCount; i++) {
        const doc = await PDFDocument.create();
        const [page] = await doc.copyPages(src, [i]);
        doc.addPage(page);
        if (!isPaid) await addWatermark(doc);
        const out = await doc.save();
        download(out, `page-${i + 1}.pdf`);
      }
      setStatus(`Split into ${pageCount} files.`);
    } catch {
      setStatus("Something went wrong splitting that file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">PDF Toolkit</h1>
        <p className="mt-2 text-slate-600">
          Merge or split PDFs entirely in your browser — files never leave your device.
        </p>

        {tier !== "ANON" && tier === "FREE" && (
          <p className="mt-2 text-sm text-amber-600">
            Free plan: 3 operations/day, watermarked output.{" "}
            <Link href="/pricing" className="underline">Upgrade for unlimited, watermark-free PDFs</Link>.
          </p>
        )}

        <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="mx-auto"
          />
          {files.length > 0 && (
            <p className="mt-3 text-sm text-slate-600">{files.length} file(s) selected</p>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleMerge}
            disabled={busy}
            className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
          >
            Merge PDFs
          </button>
          <button
            onClick={handleSplit}
            disabled={busy}
            className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-50 disabled:opacity-50"
          >
            Split PDF (per page)
          </button>
        </div>

        {status && <p className="mt-4 text-sm text-slate-700">{status}</p>}

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
