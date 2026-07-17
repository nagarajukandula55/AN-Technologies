"use client";

import { useEffect, useState } from "react";

type Report = {
  id: string;
  title: string;
  type: string;
  data: Record<string, unknown>;
  status: string;
  generatedAt: string;
  createdAt: string;
};

const REPORT_TYPES = ["Sales", "Revenue", "Customer", "Employee", "Inventory", "Performance"];

export function ReportsClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("Sales");
  const [showForm, setShowForm] = useState(false);

  function loadReports() {
    fetch("/api/reports")
      .then((res) => res.json())
      .then(setReports)
      .finally(() => setLoading(false));
  }

  useEffect(loadReports, []);

  async function handleGenerateReport() {
    const dummyData = {
      totalRecords: Math.floor(Math.random() * 1000) + 100,
      average: Math.floor(Math.random() * 10000) + 1000,
      growth: (Math.random() * 50).toFixed(2),
      generatedDate: new Date().toISOString(),
    };

    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${selectedType} Report - ${new Date().toLocaleDateString()}`,
        type: selectedType,
        data: dummyData,
      }),
    });

    setShowForm(false);
    loadReports();
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch(`/api/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadReports();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this report?")) return;
    await fetch(`/api/reports/${id}`, { method: "DELETE" });
    loadReports();
  }

  const draftReports = reports.filter((r) => r.status === "DRAFT");
  const finalizedReports = reports.filter((r) => r.status === "FINALIZED");

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="mt-2 text-slate-600">Generate and manage business reports</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setSelectedType("Sales");
          }}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ Generate Report"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg border border-slate-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {REPORT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type} Report
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerateReport}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Generate Report
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-slate-500">No reports generated yet.</p>
      ) : (
        <div className="space-y-8">
          {draftReports.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Draft Reports ({draftReports.length})</h2>
              <div className="space-y-3">
                {draftReports.map((report) => (
                  <div key={report.id} className="rounded-lg border border-slate-200 p-4 hover:border-slate-400 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{report.title}</h3>
                        <p className="text-sm text-slate-600">{report.type} Report</p>
                        <p className="mt-2 text-xs text-slate-500">
                          Generated {new Date(report.generatedAt).toLocaleString()}
                        </p>
                        <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded rounded-md max-w-xs overflow-auto">
                          <pre>{JSON.stringify(report.data, null, 2)}</pre>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => handleStatusChange(report.id, "FINALIZED")}
                          className="rounded-full px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                        >
                          Finalize
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
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

          {finalizedReports.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Finalized Reports ({finalizedReports.length})</h2>
              <div className="space-y-3">
                {finalizedReports.map((report) => (
                  <div key={report.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{report.title}</h3>
                        <p className="text-sm text-slate-600">{report.type} Report</p>
                        <p className="mt-2 text-xs text-slate-500">
                          Generated {new Date(report.generatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-800">
                          Finalized
                        </span>
                        <button
                          onClick={() => handleDelete(report.id)}
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
        </div>
      )}
    </main>
  );
}
