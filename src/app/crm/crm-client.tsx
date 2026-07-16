"use client";

import { useEffect, useState } from "react";

type Status = "LEAD" | "CUSTOMER" | "INACTIVE";
type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: Status;
  notes: string | null;
};

const STATUS_COLORS: Record<Status, string> = {
  LEAD: "bg-amber-100 text-amber-800",
  CUSTOMER: "bg-green-100 text-green-800",
  INACTIVE: "bg-slate-100 text-slate-600",
};

const emptyForm = { name: "", email: "", phone: "", company: "", status: "LEAD" as Status, notes: "" };

export function CrmClient() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<Status | "ALL">("ALL");

  function loadContacts() {
    fetch("/api/crm/contacts")
      .then((res) => res.json())
      .then(setContacts)
      .finally(() => setLoading(false));
  }

  useEffect(loadContacts, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/crm/contacts/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    loadContacts();
  }

  function handleEdit(c: Contact) {
    setForm({
      name: c.name,
      email: c.email ?? "",
      phone: c.phone ?? "",
      company: c.company ?? "",
      status: c.status,
      notes: c.notes ?? "",
    });
    setEditingId(c.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/crm/contacts/${id}`, { method: "DELETE" });
    loadContacts();
  }

  const filtered = filter === "ALL" ? contacts : contacts.filter((c) => c.status === filter);

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">CRM</h1>
          <p className="mt-2 text-slate-600">Track leads and customers.</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ Add Contact"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-lg border border-slate-200 p-6 sm:grid-cols-2">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="LEAD">Lead</option>
            <option value="CUSTOMER">Customer</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 sm:col-span-2">
            {editingId ? "Save Changes" : "Add Contact"}
          </button>
        </form>
      )}

      <div className="mt-6 flex gap-2">
        {(["ALL", "LEAD", "CUSTOMER", "INACTIVE"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${filter === s ? "bg-slate-900 text-white" : "border border-slate-300"}`}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No contacts yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Company</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium">{c.name}</td>
                  <td className="px-4 py-2 text-slate-600">{c.company || "—"}</td>
                  <td className="px-4 py-2 text-slate-600">{c.email || "—"}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => handleEdit(c)} className="mr-3 text-slate-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
