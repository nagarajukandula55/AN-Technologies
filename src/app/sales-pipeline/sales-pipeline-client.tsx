"use client";

import { useEffect, useState } from "react";

type Stage = "NEW" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
type Deal = { id: string; title: string; clientName: string; value: number; stage: Stage };

const STAGES: Stage[] = ["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];
const STAGE_LABELS: Record<Stage, string> = {
  NEW: "New",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

const emptyForm = { title: "", clientName: "", value: 0, expectedCloseDate: "" };

export function SalesPipelineClient() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  function loadDeals() {
    fetch("/api/deals")
      .then((res) => res.json())
      .then(setDeals)
      .finally(() => setLoading(false));
  }

  useEffect(loadDeals, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setShowForm(false);
    loadDeals();
  }

  async function handleMove(deal: Deal, stage: Stage) {
    await fetch(`/api/deals/${deal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    loadDeals();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/deals/${id}`, { method: "DELETE" });
    loadDeals();
  }

  const totalValue = deals.filter((d) => d.stage !== "LOST").reduce((sum, d) => sum + d.value, 0);

  return (
    <main className="mx-auto max-w-6xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sales Pipeline</h1>
          <p className="mt-2 text-slate-600">Pipeline value: ${totalValue.toFixed(2)}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ Add Deal"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-lg border border-slate-200 p-6 sm:grid-cols-2">
          <input
            required
            placeholder="Deal title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
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
            type="number"
            placeholder="Deal value"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={form.expectedCloseDate}
            onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 sm:col-span-2">
            Add Deal
          </button>
        </form>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="mt-8 grid gap-3 overflow-x-auto sm:grid-cols-6">
          {STAGES.map((stage) => (
            <div key={stage} className="min-w-[160px] rounded-lg bg-slate-50 p-3">
              <h2 className="text-xs font-semibold uppercase text-slate-500">{STAGE_LABELS[stage]}</h2>
              <div className="mt-2 space-y-2">
                {deals
                  .filter((d) => d.stage === stage)
                  .map((deal) => (
                    <div key={deal.id} className="rounded-md border border-slate-200 bg-white p-3 text-sm">
                      <p className="font-medium">{deal.title}</p>
                      <p className="text-xs text-slate-500">{deal.clientName}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-700">${deal.value.toFixed(2)}</p>
                      <select
                        value={deal.stage}
                        onChange={(e) => handleMove(deal, e.target.value as Stage)}
                        className="mt-2 w-full rounded border border-slate-200 px-1 py-1 text-xs"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {STAGE_LABELS[s]}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDelete(deal.id)}
                        className="mt-2 text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
