"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Status = "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE" | null;
type Row = { id: string; name: string; status: Status };

const STATUS_OPTIONS: Exclude<Status, null>[] = ["PRESENT", "ABSENT", "HALF_DAY", "LEAVE"];
const STATUS_COLORS: Record<Exclude<Status, null>, string> = {
  PRESENT: "bg-green-100 text-green-800",
  ABSENT: "bg-red-100 text-red-800",
  HALF_DAY: "bg-amber-100 text-amber-800",
  LEAVE: "bg-slate-100 text-slate-600",
};

export function AttendanceClient() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  function loadAttendance() {
    fetch(`/api/attendance?date=${date}`)
      .then((res) => res.json())
      .then(setRows)
      .finally(() => setLoading(false));
  }

  useEffect(loadAttendance, [date]);

  async function markStatus(employeeId: string, status: Exclude<Status, null>) {
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, date, status }),
    });
    loadAttendance();
  }

  return (
    <main className="mx-auto max-w-4xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-semibold">Attendance</h1>
      <p className="mt-2 text-slate-600">
        Mark daily attendance. Manage employees in <Link href="/hrms" className="underline">HRMS</Link>.
      </p>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="mt-6 rounded-md border border-slate-300 px-3 py-2 text-sm"
      />

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          No active employees. Add some in <Link href="/hrms" className="underline">HRMS</Link>.
        </p>
      ) : (
        <div className="mt-6 space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <span className="font-medium">{row.name}</span>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => markStatus(row.id, s)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${row.status === s ? STATUS_COLORS[s] : "border border-slate-300 text-slate-500"}`}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
