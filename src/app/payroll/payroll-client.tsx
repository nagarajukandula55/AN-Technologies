"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Payslip = { id: string; basicSalary: number; deductions: number; netPay: number };
type Row = { id: string; name: string; monthlySalary: number; payslip: Payslip | null };

export function PayrollClient() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [deductions, setDeductions] = useState<Record<string, number>>({});

  function loadPayroll() {
    fetch(`/api/payroll?month=${month}`)
      .then((res) => res.json())
      .then(setRows)
      .finally(() => setLoading(false));
  }

  useEffect(loadPayroll, [month]);

  async function handleGenerate(employeeId: string) {
    await fetch("/api/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, month, deductions: deductions[employeeId] ?? 0 }),
    });
    loadPayroll();
  }

  const totalPayout = rows.reduce((sum, r) => sum + (r.payslip?.netPay ?? 0), 0);

  return (
    <main className="mx-auto max-w-4xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-semibold">Payroll</h1>
      <p className="mt-2 text-slate-600">
        Generate monthly payslips. Manage employees in <Link href="/hrms" className="underline">HRMS</Link>.
      </p>

      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="mt-6 rounded-md border border-slate-300 px-3 py-2 text-sm"
      />

      <p className="mt-4 text-sm text-slate-600">Total payout this month: ${totalPayout.toFixed(2)}</p>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          No active employees. Add some in <Link href="/hrms" className="underline">HRMS</Link>.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-sm text-slate-600">Base: ${row.monthlySalary.toFixed(2)}</p>
                </div>
                {row.payslip ? (
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Deductions: ${row.payslip.deductions.toFixed(2)}</p>
                    <p className="font-semibold">Net Pay: ${row.payslip.netPay.toFixed(2)}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Deductions"
                      value={deductions[row.id] ?? ""}
                      onChange={(e) => setDeductions({ ...deductions, [row.id]: Number(e.target.value) })}
                      className="w-28 rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => handleGenerate(row.id)}
                      className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
                    >
                      Generate Payslip
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
