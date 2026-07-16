"use client";

import { useEffect, useState } from "react";

type AssetStatus = "IN_USE" | "IN_STORAGE" | "RETIRED";
type Asset = {
  id: string;
  name: string;
  category: string | null;
  serialNumber: string | null;
  value: number;
  status: AssetStatus;
  assignedTo: { id: string; name: string } | null;
};
type Employee = { id: string; name: string };

const STATUS_COLORS: Record<AssetStatus, string> = {
  IN_USE: "bg-green-100 text-green-800",
  IN_STORAGE: "bg-slate-100 text-slate-600",
  RETIRED: "bg-red-100 text-red-800",
};

const emptyForm = { name: "", category: "", serialNumber: "", value: 0, purchaseDate: "", assignedToId: "" };

export function AssetsClient() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  function loadAssets() {
    fetch("/api/assets")
      .then((res) => res.json())
      .then(setAssets)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAssets();
    fetch("/api/hrms/employees")
      .then((res) => res.json())
      .then(setEmployees);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setShowForm(false);
    loadAssets();
  }

  async function handleStatusChange(id: string, status: AssetStatus) {
    await fetch(`/api/assets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadAssets();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/assets/${id}`, { method: "DELETE" });
    loadAssets();
  }

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Asset Management</h1>
          <p className="mt-2 text-slate-600">Track company assets and who they&apos;re assigned to.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ Add Asset"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-lg border border-slate-200 p-6 sm:grid-cols-2">
          <input
            required
            placeholder="Asset name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Serial number"
            value={form.serialNumber}
            onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Value"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={form.purchaseDate}
            onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={form.assignedToId}
            onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Unassigned</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 sm:col-span-2">
            Add Asset
          </button>
        </form>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : assets.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No assets yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Assigned To</th>
                <th className="px-4 py-2">Value</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium">{a.name}</td>
                  <td className="px-4 py-2 text-slate-600">{a.category || "—"}</td>
                  <td className="px-4 py-2 text-slate-600">{a.assignedTo?.name || "—"}</td>
                  <td className="px-4 py-2 text-slate-600">${a.value.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <select
                      value={a.status}
                      onChange={(e) => handleStatusChange(a.id, e.target.value as AssetStatus)}
                      className={`rounded-full border-none px-2 py-1 text-xs font-medium ${STATUS_COLORS[a.status]}`}
                    >
                      <option value="IN_USE">In Use</option>
                      <option value="IN_STORAGE">In Storage</option>
                      <option value="RETIRED">Retired</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:underline">
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
