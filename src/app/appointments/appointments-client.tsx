"use client";

import { useEffect, useState } from "react";

type Status = "SCHEDULED" | "COMPLETED" | "CANCELLED";
type Appointment = {
  id: string;
  title: string;
  clientName: string;
  startTime: string;
  durationMinutes: number;
  status: Status;
  notes: string | null;
};

const STATUS_COLORS: Record<Status, string> = {
  SCHEDULED: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-slate-100 text-slate-500 line-through",
};

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const emptyForm = {
  title: "Consultation",
  clientName: "",
  startTime: toLocalInputValue(new Date(Date.now() + 3600_000)),
  durationMinutes: 30,
  notes: "",
};

export function AppointmentsClient() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  function loadAppointments() {
    fetch("/api/appointments")
      .then((res) => res.json())
      .then(setAppointments)
      .finally(() => setLoading(false));
  }

  useEffect(loadAppointments, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setShowForm(false);
    loadAppointments();
  }

  async function handleStatusChange(id: string, status: Status) {
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadAppointments();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    loadAppointments();
  }

  return (
    <main className="mx-auto max-w-4xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Appointment Booking</h1>
          <p className="mt-2 text-slate-600">Schedule and track appointments.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ Book Appointment"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-lg border border-slate-200 p-6 sm:grid-cols-2">
          <input
            required
            placeholder="Title"
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
            type="datetime-local"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
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
            Book Appointment
          </button>
        </form>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : appointments.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No appointments yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {appointments.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div>
                <p className="font-medium">{a.title} — {a.clientName}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {new Date(a.startTime).toLocaleString()} · {a.durationMinutes} min
                </p>
                {a.notes && <p className="mt-1 text-xs text-slate-400">{a.notes}</p>}
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={a.status}
                  onChange={(e) => handleStatusChange(a.id, e.target.value as Status)}
                  className={`rounded-full border-none px-2 py-1 text-xs font-medium ${STATUS_COLORS[a.status]}`}
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <button onClick={() => handleDelete(a.id)} className="text-sm text-red-600 hover:underline">
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
