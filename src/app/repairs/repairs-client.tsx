"use client";

import { useEffect, useState } from "react";

type Status = "RECEIVED" | "IN_PROGRESS" | "COMPLETED" | "DELIVERED";
type Repair = {
  id: string;
  itemName: string;
  customerName: string;
  issue: string;
  cost: number;
  status: Status;
};

const STATUS_CYCLE: Status[] = ["RECEIVED", "IN_PROGRESS", "COMPLETED", "DELIVERED"];
const STATUS_COLORS: Record<Status, string> = {
  RECEIVED: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-green-100 text-green-800",
  DELIVERED: "bg-blue-100 text-blue-800",
};

const emptyForm = { itemName: "", customerName: "", issue: "", cost: 0 };

export function RepairsClient() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  function loadRepairs() {
    fetch("/api/repairs")
      .then((res) => res.json())
      .then(setRepairs)
      .finally(() => setLoading(false));
  }

  useEffect(loadRepairs, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/repairs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setShowForm(false);
    loadRepairs();
  }

  async function handleCycleStatus(r: Repair) {
    const nextStatus = STATUS_CYCLE[(STATUS_CYCLE.indexOf(r.status) + 1) % STATUS_CYCLE.length];
    await fetch(`/api/repairs/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    loadRepairs();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/repairs/${id}`, { method: "DELETE" });
    loadRepairs();
  }

  return (
    <main className="mx-auto max-w-4xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Repair Management</h1>
          <p className="mt-2 text-slate-600">Track items in for repair. Click status to advance it.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ New Repair"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-lg border border-slate-200 p-6 sm:grid-cols-2">
          <input
            required
            placeholder="Item name"
            value={form.itemName}
            onChange={(e) => setForm({ ...form, itemName: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Customer name"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <textarea
            required
            placeholder="Issue description"
            value={form.issue}
            onChange={(e) => setForm({ ...form, issue: e.target.value })}
            rows={2}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            type="number"
            placeholder="Estimated cost"
            value={form.cost}
            onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700">
            Create Repair Ticket
          </button>
        </form>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : repairs.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No repairs yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {repairs.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{r.itemName} — {r.customerName}</h3>
                  <p className="mt-1 text-sm text-slate-600">{r.issue}</p>
                  <p className="mt-1 text-xs text-slate-400">Cost: ${r.cost.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCycleStatus(r)}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status]}`}
                  >
                    {r.status.replace("_", " ")}
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="text-xs text-red-600 hover:underline">
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
