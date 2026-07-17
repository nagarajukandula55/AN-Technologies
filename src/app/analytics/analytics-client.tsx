"use client";

import { useEffect, useState } from "react";

type Metric = {
  id: string;
  metric: string;
  value: number;
  date: string;
  source?: string;
};

const emptyForm = {
  metric: "",
  value: 0,
  source: "",
};

export function AnalyticsClient() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  function loadMetrics() {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then(setMetrics)
      .finally(() => setLoading(false));
  }

  useEffect(loadMetrics, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metric: form.metric,
        value: form.value,
        source: form.source || undefined,
      }),
    });

    setForm(emptyForm);
    setShowForm(false);
    loadMetrics();
  }

  const metricGroups = metrics.reduce((acc, m) => {
    if (!acc[m.metric]) {
      acc[m.metric] = [];
    }
    acc[m.metric].push(m);
    return acc;
  }, {} as Record<string, Metric[]>);

  const metricSummary = Object.entries(metricGroups).map(([name, data]) => ({
    name,
    count: data.length,
    latest: data[0]?.value || 0,
    average: data.reduce((sum, m) => sum + m.value, 0) / data.length,
    total: data.reduce((sum, m) => sum + m.value, 0),
  }));

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
          <p className="mt-2 text-slate-600">Track key business metrics</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowForm(!showForm);
          }}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ Add Metric"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-slate-200 p-6 space-y-4">
          <input
            required
            placeholder="Metric name (e.g., Revenue, Users, Traffic)"
            value={form.metric}
            onChange={(e) => setForm({ ...form, metric: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            step="0.01"
            required
            placeholder="Metric value"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Source (optional)"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Record Metric
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : metricSummary.length === 0 ? (
        <p className="text-sm text-slate-500">No metrics recorded yet.</p>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metricSummary.map((metric) => (
              <div key={metric.name} className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-600 truncate">{metric.name}</p>
                <p className="text-2xl font-bold mt-2">{metric.latest.toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Latest • {metric.count} entry{metric.count !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Avg: {metric.average.toFixed(2)} • Total: {metric.total.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Recent Metrics</h2>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Metric</th>
                      <th className="px-4 py-2 text-left font-medium">Value</th>
                      <th className="px-4 py-2 text-left font-medium">Date</th>
                      <th className="px-4 py-2 text-left font-medium">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.slice(0, 20).map((metric) => (
                      <tr key={metric.id} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-2 font-medium">{metric.metric}</td>
                        <td className="px-4 py-2">{metric.value.toFixed(2)}</td>
                        <td className="px-4 py-2 text-slate-600">
                          {new Date(metric.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-slate-600">{metric.source || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
