"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { Nav } from "@/components/nav";
import { FreeTierNotice, LimitReachedBanner } from "@/components/tool-banners";
import { PrintableDocument, type DocType } from "@/components/printable-document";
import { useTier, checkAndRecordUsage } from "@/hooks/use-tier";

type LineItem = { description: string; quantity: number; unitPrice: number };

const DOC_TYPES: DocType[] = ["Invoice", "Estimate", "Receipt", "Purchase Order", "Delivery Note"];

const PARTY_LABEL: Record<DocType, string> = {
  Invoice: "Bill to",
  Estimate: "Prepared for",
  Receipt: "Received from",
  "Purchase Order": "Vendor",
  "Delivery Note": "Deliver to",
};

function download(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function InvoiceClient() {
  const { tier, isPaid } = useTier();
  const [docType, setDocType] = useState<DocType>("Invoice");
  const [fromName, setFromName] = useState("Your Company");
  const [toName, setToName] = useState("Client Name");
  const [docNumber, setDocNumber] = useState("INV-001");
  const [notes, setNotes] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [items, setItems] = useState<LineItem[]>([{ description: "Service", quantity: 1, unitPrice: 100 }]);
  const [status, setStatus] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [busy, setBusy] = useState(false);

  const showPrices = docType !== "Delivery Note";

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleLogoUpload(file: File | null) {
    if (!file) {
      setLogoDataUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  function handlePrint() {
    window.print();
  }

  async function handleDownloadPdf() {
    const usage = await checkAndRecordUsage("invoice");
    if (!usage.allowed) {
      setLimitReached(true);
      return;
    }
    setLimitReached(false);
    setStatus(null);
    setBusy(true);
    try {
      const doc = await PDFDocument.create();
      const page = doc.addPage([595, 842]);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const bold = await doc.embedFont(StandardFonts.HelveticaBold);
      const { height } = page.getSize();
      let y = height - 60;

      page.drawText(docType.toUpperCase(), { x: 50, y, size: 22, font: bold });
      y -= 40;
      page.drawText(`${docType} #: ${docNumber}`, { x: 50, y, size: 11, font });
      y -= 16;
      page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 50, y, size: 11, font });
      y -= 30;
      page.drawText(`From: ${fromName}`, { x: 50, y, size: 12, font: bold });
      y -= 16;
      page.drawText(`${PARTY_LABEL[docType]}: ${toName}`, { x: 50, y, size: 12, font: bold });
      y -= 30;

      page.drawText("Description", { x: 50, y, size: 11, font: bold });
      page.drawText("Qty", { x: 330, y, size: 11, font: bold });
      if (showPrices) {
        page.drawText("Unit Price", { x: 390, y, size: 11, font: bold });
        page.drawText("Amount", { x: 480, y, size: 11, font: bold });
      }
      y -= 10;
      page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
      y -= 20;

      for (const item of items) {
        page.drawText(item.description || "-", { x: 50, y, size: 10, font });
        page.drawText(String(item.quantity), { x: 330, y, size: 10, font });
        if (showPrices) {
          page.drawText(`$${item.unitPrice.toFixed(2)}`, { x: 390, y, size: 10, font });
          page.drawText(`$${(item.quantity * item.unitPrice).toFixed(2)}`, { x: 480, y, size: 10, font });
        }
        y -= 22;
      }

      if (showPrices) {
        y -= 10;
        page.drawLine({ start: { x: 350, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
        y -= 20;
        page.drawText("Total:", { x: 390, y, size: 12, font: bold });
        page.drawText(`$${total.toFixed(2)}`, { x: 480, y, size: 12, font: bold });
        y -= 20;
      }

      if (notes) {
        y -= 10;
        page.drawText("Notes:", { x: 50, y, size: 10, font: bold });
        y -= 14;
        page.drawText(notes, { x: 50, y, size: 10, font, maxWidth: 495 });
      }

      if (!isPaid) {
        page.drawText("Generated with AN Technologies — Free Plan", {
          x: 150,
          y: height / 2,
          size: 20,
          rotate: degrees(45),
          color: rgb(0.85, 0.85, 0.85),
          opacity: 0.6,
        });
      }

      const bytes = await doc.save();
      download(bytes, `${docNumber || docType.toLowerCase().replace(/\s+/g, "-")}.pdf`);
      setStatus(`${docType} PDF downloaded.`);
    } catch {
      setStatus(`Something went wrong generating the ${docType.toLowerCase()}.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl flex-1 px-6 py-16 no-print">
        <h1 className="text-2xl font-semibold">Business Document Generator</h1>
        <p className="mt-2 text-slate-600">
          Invoices, estimates, receipts, purchase orders, and delivery notes — fill in the details,
          then print directly from your browser. No file is created unless you choose to download a PDF.
        </p>

        <FreeTierNotice tier={tier} toolLabel="PDF downloads" />

        <div className="mt-6 flex flex-wrap gap-3">
          {DOC_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setDocType(type)}
              className={`rounded-md px-4 py-2 text-sm ${docType === type ? "bg-slate-900 text-white" : "border border-slate-300"}`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">From</label>
            <input
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">{PARTY_LABEL[docType]}</label>
            <input
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">{docType} Number</label>
            <input
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Logo (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoUpload(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm"
            />
          </div>
        </div>

        <h2 className="mt-8 text-lg font-semibold">Line Items</h2>
        <div className="mt-4 space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={item.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                placeholder="Description"
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                className="w-20 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              {showPrices && (
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(i, { unitPrice: Number(e.target.value) })}
                  className="w-28 rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              )}
              <button onClick={() => removeItem(i)} className="text-sm text-red-600 hover:underline">
                Remove
              </button>
            </div>
          ))}
        </div>
        <button onClick={addItem} className="mt-3 text-sm text-slate-700 underline">
          + Add line item
        </button>

        <div className="mt-6">
          <label className="text-sm font-medium text-slate-700">Notes (placeholder for terms, payment instructions, etc.)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {showPrices && <p className="mt-6 text-lg font-semibold">Total: ${total.toFixed(2)}</p>}

        <div className="mt-4 flex gap-4">
          <button
            onClick={handlePrint}
            className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Print {docType}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={busy}
            className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-50 disabled:opacity-50"
          >
            Download PDF
          </button>
        </div>

        {status && <p className="mt-4 text-sm text-slate-700">{status}</p>}
        {limitReached && <LimitReachedBanner />}

        <h2 className="mt-10 text-lg font-semibold">Preview</h2>
        <p className="mb-4 text-sm text-slate-500">This is exactly what prints.</p>
      </main>

      <div className="pb-16">
        <PrintableDocument
          docType={docType}
          docNumber={docNumber}
          fromName={fromName}
          toName={toName}
          dateLabel={`Date: ${new Date().toLocaleDateString()}`}
          items={items}
          notes={notes}
          logoDataUrl={logoDataUrl}
          showWatermark={!isPaid}
          showPrices={showPrices}
        />
      </div>
    </>
  );
}
