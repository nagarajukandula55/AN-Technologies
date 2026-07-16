"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { Nav } from "@/components/nav";
import { FreeTierNotice, LimitReachedBanner } from "@/components/tool-banners";
import { useTier, checkAndRecordUsage } from "@/hooks/use-tier";

type LineItem = { description: string; quantity: number; unitPrice: number };

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
  const [fromName, setFromName] = useState("Your Company");
  const [toName, setToName] = useState("Client Name");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [items, setItems] = useState<LineItem[]>([{ description: "Service", quantity: 1, unitPrice: 100 }]);
  const [status, setStatus] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [busy, setBusy] = useState(false);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  async function handleGenerate() {
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

      page.drawText("INVOICE", { x: 50, y, size: 24, font: bold });
      y -= 40;
      page.drawText(`Invoice #: ${invoiceNumber}`, { x: 50, y, size: 11, font });
      y -= 16;
      page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 50, y, size: 11, font });
      y -= 30;
      page.drawText(`From: ${fromName}`, { x: 50, y, size: 12, font: bold });
      y -= 16;
      page.drawText(`To: ${toName}`, { x: 50, y, size: 12, font: bold });
      y -= 30;

      page.drawText("Description", { x: 50, y, size: 11, font: bold });
      page.drawText("Qty", { x: 330, y, size: 11, font: bold });
      page.drawText("Unit Price", { x: 390, y, size: 11, font: bold });
      page.drawText("Amount", { x: 480, y, size: 11, font: bold });
      y -= 10;
      page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
      y -= 20;

      for (const item of items) {
        page.drawText(item.description || "-", { x: 50, y, size: 10, font });
        page.drawText(String(item.quantity), { x: 330, y, size: 10, font });
        page.drawText(`$${item.unitPrice.toFixed(2)}`, { x: 390, y, size: 10, font });
        page.drawText(`$${(item.quantity * item.unitPrice).toFixed(2)}`, { x: 480, y, size: 10, font });
        y -= 22;
      }

      y -= 10;
      page.drawLine({ start: { x: 350, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
      y -= 20;
      page.drawText("Total:", { x: 390, y, size: 12, font: bold });
      page.drawText(`$${total.toFixed(2)}`, { x: 480, y, size: 12, font: bold });

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
      download(bytes, `${invoiceNumber || "invoice"}.pdf`);
      setStatus("Invoice generated.");
    } catch {
      setStatus("Something went wrong generating the invoice.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">Invoice Generator</h1>
        <p className="mt-2 text-slate-600">Create a professional PDF invoice in seconds.</p>

        <FreeTierNotice tier={tier} toolLabel="invoices" />

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
            <label className="text-sm font-medium text-slate-700">To</label>
            <input
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Invoice Number</label>
            <input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
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
              <input
                type="number"
                value={item.unitPrice}
                onChange={(e) => updateItem(i, { unitPrice: Number(e.target.value) })}
                className="w-28 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <button onClick={() => removeItem(i)} className="text-sm text-red-600 hover:underline">
                Remove
              </button>
            </div>
          ))}
        </div>
        <button onClick={addItem} className="mt-3 text-sm text-slate-700 underline">
          + Add line item
        </button>

        <p className="mt-6 text-lg font-semibold">Total: ${total.toFixed(2)}</p>

        <button
          onClick={handleGenerate}
          disabled={busy}
          className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Generate PDF Invoice
        </button>

        {status && <p className="mt-4 text-sm text-slate-700">{status}</p>}
        {limitReached && <LimitReachedBanner />}
      </main>
    </>
  );
}
