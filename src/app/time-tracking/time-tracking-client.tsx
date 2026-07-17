"use client";

import { useEffect, useState } from "react";

type TimeEntry = {
  id: string;
  projectName: string;
  taskName: string;
  hours: number;
  date: string;
  description?: string;
  billable: boolean;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
  createdAt: string;
};

const emptyForm = {
  projectName: "",
  taskName: "",
  hours: 0,
  date: new Date().toISOString().split("T")[0],
  description: "",
  billable: true,
};

export function TimeTrackingClient() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  function loadEntries() {
    fetch("/api/time-tracking")
      .then((res) => res.json())
      .then(setEntries)
      .finally(() => setLoading(false));
  }

  useEffect(loadEntries, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/time-tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setShowForm(false);
    loadEntries();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/time-tracking/${id}`, { method: "DELETE" });
    loadEntries();
  }

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
  const billableHours = entries.filter((e) => e.billable).reduce((sum, e) => sum + e.hours, 0);

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Time Tracking</h1>
          <p className="mt-2 text-slate-600">Log and track billable hours</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowForm(!showForm);
          }}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ Log Time"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-slate-200 p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Project name"
              value={form.projectName}
              onChange={(e) => setForm({ ...form, projectName: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Task name"
              value={form.taskName}
              onChange={(e) => setForm({ ...form, taskName: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="0"
              max="24"
              step="0.25"
              required
              placeholder="Hours"
              value={form.hours}
              onChange={(e) => setForm({ ...form, hours: parseFloat(e.target.value) })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.billable}
              onChange={(e) => setForm({ ...form, billable: e.target.checked })}
              className="rounded border-slate-300"
            />
            <span className="text-sm">Billable</span>
          </label>

          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Log Time Entry
          </button>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Hours</p>
          <p className="text-2xl font-bold mt-1">{totalHours.toFixed(1)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Billable Hours</p>
          <p className="text-2xl font-bold mt-1">{billableHours.toFixed(1)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Entries</p>
          <p className="text-2xl font-bold mt-1">{entries.length}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-slate-500">No time entries yet.</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{entry.projectName}</h3>
                  <p className="text-sm text-slate-600">{entry.taskName}</p>
                  {entry.description && (
                    <p className="mt-1 text-sm text-slate-500">{entry.description}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-end gap-4 text-right">
                  <div>
                    <p className="text-lg font-bold">{entry.hours.toFixed(2)}h</p>
                    <p className="text-xs text-slate-500">
                      {entry.billable ? "Billable" : "Non-billable"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
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
