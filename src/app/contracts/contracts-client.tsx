"use client";

import { useEffect, useState } from "react";

type Status = "DRAFT" | "ACTIVE" | "EXPIRED" | "TERMINATED";
type Contract = {
  id: string;
  title: string;
  counterparty: string;
  startDate: string;
  endDate: string | null;
  value: number;
  status: Status;
  notes: string | null;
};

const STATUS_COLORS: Record<Status, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  ACTIVE: "bg-green-100 text-green-800",
  EXPIRED: "bg-amber-100 text-amber-800",
  TERMINATED: "bg-red-100 text-red-800",
};

const emptyForm = {
  title: "",
  counterparty: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  value: 0,
  notes: "",
};

export function ContractsClient() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  function loadContracts() {
    fetch("/api/contracts")
      .then((res) => res.json())
      .then(setContracts)
      .finally(() => setLoading(false));
  }

  useEffect(loadContracts, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setShowForm(false);
    loadContracts();
  }

  async function handleStatusChange(id: string, status: Status) {
    await fetch(`/api/contracts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadContracts();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/contracts/${id}`, { method: "DELETE" });
    loadContracts();
  }

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Contract Management</h1>
          <p className="mt-2 text-slate-600">Track contracts and their status.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ Add Contract"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-lg border border-slate-200 p-6 sm:grid-cols-2">
          <input
            required
            placeholder="Contract title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Counterparty"
            value={form.counterparty}
            onChange={(e) => setForm({ ...form, counterparty: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <div>
            <label className="text-xs text-slate-500">Start date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">End date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <input
            type="number"
            placeholder="Contract value"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 sm:col-span-2">
            Add Contract
          </button>
        </form>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : contracts.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No contracts yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {contracts.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div>
                <p className="font-medium">{c.title} — {c.counterparty}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {new Date(c.startDate).toLocaleDateString()}
                  {c.endDate && ` → ${new Date(c.endDate).toLocaleDateString()}`}
                  {" · "}${c.value.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={c.status}
                  onChange={(e) => handleStatusChange(c.id, e.target.value as Status)}
                  className={`rounded-full border-none px-2 py-1 text-xs font-medium ${STATUS_COLORS[c.status]}`}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
                <button onClick={() => handleDelete(c.id)} className="text-sm text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
