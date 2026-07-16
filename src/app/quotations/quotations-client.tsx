"use client";

import { useEffect, useState } from "react";
import { PrintableDocument } from "@/components/printable-document";

type Status = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED";
type LineItem = { description: string; quantity: number; unitPrice: number };
type Quotation = {
  id: string;
  quoteNumber: string;
  clientName: string;
  items: LineItem[];
  status: Status;
  createdAt: string;
};

const STATUS_COLORS: Record<Status, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SENT: "bg-amber-100 text-amber-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export function QuotationsClient() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState("QTE-001");
  const [clientName, setClientName] = useState("Client Name");
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [printing, setPrinting] = useState<Quotation | null>(null);

  function loadQuotations() {
    fetch("/api/quotations")
      .then((res) => res.json())
      .then(setQuotations)
      .finally(() => setLoading(false));
  }

  useEffect(loadQuotations, []);

  function updateItem(i: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteNumber, clientName, items }),
    });
    setQuoteNumber("QTE-001");
    setClientName("Client Name");
    setItems([{ description: "", quantity: 1, unitPrice: 0 }]);
    setShowForm(false);
    loadQuotations();
  }

  async function handleStatusChange(id: string, status: Status) {
    await fetch(`/api/quotations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadQuotations();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/quotations/${id}`, { method: "DELETE" });
    loadQuotations();
  }

  function handlePrint(q: Quotation) {
    setPrinting(q);
    setTimeout(() => window.print(), 100);
  }

  return (
    <main className="mx-auto max-w-4xl flex-1 px-6 py-16 no-print">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quotation Management</h1>
          <p className="mt-2 text-slate-600">Create, track, and print quotations for clients.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ New Quotation"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-slate-200 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Quote number"
              value={quoteNumber}
              onChange={(e) => setQuoteNumber(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Client name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4 space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(i, { description: e.target.value })}
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
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setItems([...items, { description: "", quantity: 1, unitPrice: 0 }])}
            className="mt-2 text-sm text-slate-700 underline"
          >
            + Add line item
          </button>

          <button type="submit" className="mt-4 block rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700">
            Save Quotation
          </button>
        </form>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : quotations.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No quotations yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {quotations.map((q) => {
            const total = q.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
            return (
              <div key={q.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="font-medium">{q.quoteNumber} — {q.clientName}</p>
                  <p className="mt-1 text-sm text-slate-600">${total.toFixed(2)} · {new Date(q.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={q.status}
                    onChange={(e) => handleStatusChange(q.id, e.target.value as Status)}
                    className={`rounded-full border-none px-2 py-1 text-xs font-medium ${STATUS_COLORS[q.status]}`}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                  <button onClick={() => handlePrint(q)} className="text-sm text-slate-700 hover:underline">
                    Print
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="text-sm text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {printing && (
        <div className="print-only fixed inset-0 z-50 hidden overflow-auto bg-white print:block">
          <PrintableDocument
            docType="Estimate"
            docNumber={printing.quoteNumber}
            fromName="Your Company"
            toName={printing.clientName}
            dateLabel={`Date: ${new Date(printing.createdAt).toLocaleDateString()}`}
            items={printing.items}
            notes=""
            logoDataUrl={null}
            showWatermark={false}
            showPrices={true}
          />
        </div>
      )}
    </main>
  );
}
