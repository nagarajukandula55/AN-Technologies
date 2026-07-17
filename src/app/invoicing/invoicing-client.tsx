"use client";

import { useEffect, useState } from "react";

type Invoice = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  items: Array<{ id: string; description: string; quantity: number; unitPrice: number }>;
  subtotal: number;
  tax: number;
  total: number;
  dueDate?: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
  notes?: string;
  createdAt: string;
};

const STATUS_COLORS: Record<Invoice["status"], string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SENT: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  CANCELLED: "bg-slate-100 text-slate-600",
};

const emptyForm = {
  invoiceNumber: "",
  clientName: "",
  clientEmail: "",
  items: [] as Array<{ id: string; description: string; quantity: number; unitPrice: number }>,
  dueDate: "",
  notes: "",
};

export function InvoicingClient() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  function loadInvoices() {
    fetch("/api/invoicing")
      .then((res) => res.json())
      .then(setInvoices)
      .finally(() => setLoading(false));
  }

  useEffect(loadInvoices, []);

  function handleAddItem() {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0 },
      ],
    }));
  }

  function handleRemoveItem(index: number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  function handleItemChange(index: number, field: string, value: string | number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.items.length === 0) return;

    const subtotal = form.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    await fetch("/api/invoicing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        subtotal,
        tax,
        total,
        dueDate: form.dueDate || undefined,
      }),
    });

    setForm(emptyForm);
    setShowForm(false);
    loadInvoices();
  }

  async function handleStatusChange(invoice: Invoice, status: Invoice["status"]) {
    await fetch(`/api/invoicing/${invoice.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadInvoices();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this invoice?")) return;
    await fetch(`/api/invoicing/${id}`, { method: "DELETE" });
    loadInvoices();
  }

  const itemsSubtotal =
    form.items.length > 0
      ? form.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      : 0;
  const itemsTax = Math.round(itemsSubtotal * 0.1 * 100) / 100;
  const itemsTotal = Math.round((itemsSubtotal + itemsTax) * 100) / 100;

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Invoicing</h1>
          <p className="mt-2 text-slate-600">Create and manage invoices</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowForm(!showForm);
          }}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ New Invoice"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-slate-200 p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Invoice number"
              value={form.invoiceNumber}
              onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="date"
              placeholder="Due date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Client name"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="email"
              placeholder="Client email (optional)"
              value={form.clientEmail}
              onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Line Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="rounded-md bg-slate-100 px-3 py-1 text-sm hover:bg-slate-200"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {form.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                  <input
                    required
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                    className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", parseInt(e.target.value))}
                    className="w-20 rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(idx, "unitPrice", parseFloat(e.target.value))}
                    className="w-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                  <span className="w-20 text-right font-medium text-sm">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />

          <div className="rounded-lg bg-slate-50 p-4">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-medium">${itemsSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (10%):</span>
                <span className="font-medium">${itemsTax.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="text-lg font-bold">${itemsTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={form.items.length === 0}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:bg-slate-400"
          >
            Create Invoice
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : invoices.length === 0 ? (
        <p className="text-sm text-slate-500">No invoices yet.</p>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">
                    {inv.invoiceNumber} — {inv.clientName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{inv.items.length} items</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-end gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold">${(inv.total as number).toFixed(2)}</p>
                    <select
                      value={inv.status}
                      onChange={(e) =>
                        handleStatusChange(inv, e.target.value as Invoice["status"])
                      }
                      onClick={(e) => e.stopPropagation()}
                      className={`mt-2 rounded-full px-2 py-0.5 text-xs font-medium border-0 cursor-pointer ${STATUS_COLORS[inv.status]}`}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="SENT">Sent</option>
                      <option value="PAID">Paid</option>
                      <option value="OVERDUE">Overdue</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(inv.id);
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
