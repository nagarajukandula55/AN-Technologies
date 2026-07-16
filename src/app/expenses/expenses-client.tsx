"use client";

import { useEffect, useMemo, useState } from "react";

type Expense = { id: string; description: string; category: string; amount: number; date: string };

const emptyForm = {
  description: "",
  category: "General",
  amount: 0,
  date: new Date().toISOString().slice(0, 10),
};

export function ExpensesClient() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  function loadExpenses() {
    fetch("/api/expenses")
      .then((res) => res.json())
      .then(setExpenses)
      .finally(() => setLoading(false));
  }

  useEffect(loadExpenses, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setShowForm(false);
    loadExpenses();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    loadExpenses();
  }

  const total = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  return (
    <main className="mx-auto max-w-4xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Expense Tracker</h1>
          <p className="mt-2 text-slate-600">Total: ${total.toFixed(2)}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ Add Expense"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-lg border border-slate-200 p-6 sm:grid-cols-2">
          <input
            required
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700">
            Add Expense
          </button>
        </form>
      )}

      {byCategory.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {byCategory.map(([cat, amt]) => (
            <span key={cat} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
              {cat}: ${amt.toFixed(2)}
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : expenses.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No expenses yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-600">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 font-medium">{e.description}</td>
                  <td className="px-4 py-2 text-slate-600">{e.category}</td>
                  <td className="px-4 py-2 text-right">${e.amount.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:underline">
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
