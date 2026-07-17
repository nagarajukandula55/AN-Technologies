"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  serviceType: string;
  date: string;
  duration: number;
  location?: string;
  notes?: string;
  status: string;
  createdAt: string;
};

const emptyForm = {
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  serviceType: "",
  date: "",
  duration: 60,
  location: "",
  notes: "",
};

export function BookingsClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  function loadBookings() {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then(setBookings)
      .finally(() => setLoading(false));
  }

  useEffect(loadBookings, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm(emptyForm);
    setShowForm(false);
    loadBookings();
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadBookings();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this booking?")) return;
    await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    loadBookings();
  }

  const upcomingBookings = bookings
    .filter((b) => new Date(b.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastBookings = bookings
    .filter((b) => new Date(b.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Booking System</h1>
          <p className="mt-2 text-slate-600">Manage service and appointment bookings</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowForm(!showForm);
          }}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ New Booking"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-slate-200 p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Client name"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="email"
              placeholder="Client email"
              value={form.clientEmail}
              onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Client phone"
              value={form.clientPhone}
              onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Service type"
              value={form.serviceType}
              onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="datetime-local"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="15"
              step="15"
              required
              placeholder="Duration (minutes)"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <input
            placeholder="Location (optional)"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />

          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />

          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Create Booking
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-slate-500">No bookings yet.</p>
      ) : (
        <div className="space-y-8">
          {upcomingBookings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Upcoming ({upcomingBookings.length})</h2>
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="rounded-lg border border-slate-200 p-4 hover:border-slate-400">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{booking.serviceType}</h3>
                        <p className="mt-1 text-sm text-slate-600">{booking.clientName}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(booking.date).toLocaleString()} • {booking.duration} min
                        </p>
                        {booking.location && (
                          <p className="mt-1 text-xs text-slate-500">📍 {booking.location}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          className="rounded-full px-2 py-0.5 text-xs font-medium border-0 cursor-pointer bg-blue-100 text-blue-800"
                        >
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastBookings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-slate-600">Past ({pastBookings.length})</h2>
              <div className="space-y-3">
                {pastBookings.map((booking) => (
                  <div key={booking.id} className="rounded-lg border border-slate-200 p-4 opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{booking.serviceType}</h3>
                        <p className="mt-1 text-sm text-slate-600">{booking.clientName}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(booking.date).toLocaleString()} • {booking.duration} min
                        </p>
                      </div>
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
