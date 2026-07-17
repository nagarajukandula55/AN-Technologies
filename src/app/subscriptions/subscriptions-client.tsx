"use client";

import { useEffect, useState } from "react";

type Plan = {
  id: string;
  name: string;
  description?: string;
  price: number;
  interval: string;
  features: string[];
  isActive: boolean;
};

export function SubscriptionsClient() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    interval: "MONTHLY",
    features: "",
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/subscriptions")
      .then((res) => res.json())
      .then(setPlans)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const features = form.features
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        price: form.price,
        interval: form.interval,
        features,
      }),
    });

    setForm({ name: "", description: "", price: 0, interval: "MONTHLY", features: "" });
    setShowForm(false);
    const updated = await fetch("/api/subscriptions").then((r) => r.json());
    setPlans(updated);
  }

  async function handleToggle(id: string, active: boolean) {
    await fetch(`/api/subscriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !active }),
    });
    const updated = await fetch("/api/subscriptions").then((r) => r.json());
    setPlans(updated);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this plan?")) return;
    await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    const updated = await fetch("/api/subscriptions").then((r) => r.json());
    setPlans(updated);
  }

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Subscription Plans</h1>
          <p className="mt-2 text-slate-600">Create and manage subscription plans</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ New Plan"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-slate-200 p-6 space-y-4">
          <input
            required
            placeholder="Plan name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="number"
              step="0.01"
              required
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={form.interval}
              onChange={(e) => setForm({ ...form, interval: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
              <option value="ONCE">One-time</option>
            </select>
          </div>
          <textarea
            placeholder="Features (one per line)"
            value={form.features}
            onChange={(e) => setForm({ ...form, features: e.target.value })}
            rows={4}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Create Plan
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : plans.length === 0 ? (
        <p className="text-sm text-slate-500">No plans yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-lg border border-slate-200 p-6 flex flex-col">
              <h3 className="font-semibold text-lg">{plan.name}</h3>
              {plan.description && <p className="text-sm text-slate-600 mt-1">{plan.description}</p>}
              <p className="text-3xl font-bold mt-4">${plan.price.toFixed(2)}</p>
              <p className="text-xs text-slate-500">per {plan.interval.toLowerCase()}</p>
              <ul className="mt-4 space-y-2 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-slate-600">✓ {feature}</li>
                ))}
              </ul>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => handleToggle(plan.id, plan.isActive)}
                  className={`flex-1 text-sm py-2 rounded-md ${
                    plan.isActive
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {plan.isActive ? "Active" : "Inactive"}
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="text-sm text-red-600 hover:underline"
                >
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
