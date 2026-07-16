"use client";

import { useEffect, useState } from "react";

type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type Priority = "LOW" | "MEDIUM" | "HIGH";
type Ticket = {
  id: string;
  subject: string;
  description: string | null;
  status: Status;
  priority: Priority;
  requesterName: string | null;
  requesterEmail: string | null;
};

const STATUS_CYCLE: Status[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const STATUS_COLORS: Record<Status, string> = {
  OPEN: "bg-red-100 text-red-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-slate-100 text-slate-600",
};
const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "text-slate-500",
  MEDIUM: "text-amber-600",
  HIGH: "text-red-600",
};

const emptyForm = {
  subject: "",
  description: "",
  priority: "MEDIUM" as Priority,
  requesterName: "",
  requesterEmail: "",
};

export function HelpdeskClient() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<Status | "ALL">("ALL");

  function loadTickets() {
    fetch("/api/helpdesk/tickets")
      .then((res) => res.json())
      .then(setTickets)
      .finally(() => setLoading(false));
  }

  useEffect(loadTickets, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/helpdesk/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setShowForm(false);
    loadTickets();
  }

  async function handleCycleStatus(t: Ticket) {
    const nextStatus = STATUS_CYCLE[(STATUS_CYCLE.indexOf(t.status) + 1) % STATUS_CYCLE.length];
    await fetch(`/api/helpdesk/tickets/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    loadTickets();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/helpdesk/tickets/${id}`, { method: "DELETE" });
    loadTickets();
  }

  const filtered = filter === "ALL" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Helpdesk</h1>
          <p className="mt-2 text-slate-600">Track support tickets. Click status to advance it.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ New Ticket"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-lg border border-slate-200 p-6 sm:grid-cols-2">
          <input
            required
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            placeholder="Requester name"
            value={form.requesterName}
            onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Requester email"
            value={form.requesterEmail}
            onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="LOW">Low priority</option>
            <option value="MEDIUM">Medium priority</option>
            <option value="HIGH">High priority</option>
          </select>
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700">
            Create Ticket
          </button>
        </form>
      )}

      <div className="mt-6 flex gap-2">
        {(["ALL", ...STATUS_CYCLE] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${filter === s ? "bg-slate-900 text-white" : "border border-slate-300"}`}
          >
            {s === "ALL" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No tickets.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((t) => (
            <div key={t.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{t.subject}</h3>
                  {t.description && <p className="mt-1 text-sm text-slate-600">{t.description}</p>}
                  {t.requesterName && (
                    <p className="mt-1 text-xs text-slate-400">
                      {t.requesterName} {t.requesterEmail && `· ${t.requesterEmail}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                  <button
                    onClick={() => handleCycleStatus(t)}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[t.status]}`}
                  >
                    {t.status.replace("_", " ")}
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="text-xs text-red-600 hover:underline">
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
