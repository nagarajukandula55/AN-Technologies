"use client";

import { useEffect, useState } from "react";

type Status = "OPEN" | "INVESTIGATING" | "RESOLVED";
type Complaint = {
  id: string;
  complainantName: string;
  subject: string;
  description: string | null;
  status: Status;
  resolutionNotes: string | null;
};

const STATUS_CYCLE: Status[] = ["OPEN", "INVESTIGATING", "RESOLVED"];
const STATUS_COLORS: Record<Status, string> = {
  OPEN: "bg-red-100 text-red-800",
  INVESTIGATING: "bg-amber-100 text-amber-800",
  RESOLVED: "bg-green-100 text-green-800",
};

const emptyForm = { complainantName: "", subject: "", description: "" };

export function ComplaintsClient() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  function loadComplaints() {
    fetch("/api/complaints")
      .then((res) => res.json())
      .then(setComplaints)
      .finally(() => setLoading(false));
  }

  useEffect(loadComplaints, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setShowForm(false);
    loadComplaints();
  }

  async function handleCycleStatus(c: Complaint) {
    const nextStatus = STATUS_CYCLE[(STATUS_CYCLE.indexOf(c.status) + 1) % STATUS_CYCLE.length];
    await fetch(`/api/complaints/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    loadComplaints();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/complaints/${id}`, { method: "DELETE" });
    loadComplaints();
  }

  return (
    <main className="mx-auto max-w-4xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Complaint Management</h1>
          <p className="mt-2 text-slate-600">Log and resolve customer complaints. Click status to advance it.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ Log Complaint"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-lg border border-slate-200 p-6 sm:grid-cols-2">
          <input
            required
            placeholder="Complainant name"
            value={form.complainantName}
            onChange={(e) => setForm({ ...form, complainantName: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 sm:col-span-2">
            Log Complaint
          </button>
        </form>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : complaints.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No complaints logged.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {complaints.map((c) => (
            <div key={c.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{c.subject}</h3>
                  <p className="mt-1 text-xs text-slate-400">From: {c.complainantName}</p>
                  {c.description && <p className="mt-1 text-sm text-slate-600">{c.description}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCycleStatus(c)}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status]}`}
                  >
                    {c.status}
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-xs text-red-600 hover:underline">
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
