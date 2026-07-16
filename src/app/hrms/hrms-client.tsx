"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Status = "ACTIVE" | "INACTIVE";
type Employee = {
  id: string;
  name: string;
  email: string | null;
  designation: string | null;
  department: string | null;
  monthlySalary: number;
  joinDate: string;
  status: Status;
};

const emptyForm = {
  name: "",
  email: "",
  designation: "",
  department: "",
  monthlySalary: 0,
  joinDate: new Date().toISOString().slice(0, 10),
};

export function HrmsClient() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  function loadEmployees() {
    fetch("/api/hrms/employees")
      .then((res) => res.json())
      .then(setEmployees)
      .finally(() => setLoading(false));
  }

  useEffect(loadEmployees, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/hrms/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setShowForm(false);
    loadEmployees();
  }

  async function handleToggleStatus(emp: Employee) {
    await fetch(`/api/hrms/employees/${emp.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: emp.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }),
    });
    loadEmployees();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/hrms/employees/${id}`, { method: "DELETE" });
    loadEmployees();
  }

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">HRMS — Employees</h1>
          <p className="mt-2 text-slate-600">
            Manage employee records.{" "}
            <Link href="/attendance" className="underline">Attendance</Link> ·{" "}
            <Link href="/payroll" className="underline">Payroll</Link>
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ Add Employee"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-lg border border-slate-200 p-6 sm:grid-cols-2">
          <input
            required
            placeholder="Full name"
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
            placeholder="Designation"
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Monthly salary"
            value={form.monthlySalary}
            onChange={(e) => setForm({ ...form, monthlySalary: Number(e.target.value) })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={form.joinDate}
            onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 sm:col-span-2">
            Add Employee
          </button>
        </form>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : employees.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No employees yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Designation</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">Salary</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium">{emp.name}</td>
                  <td className="px-4 py-2 text-slate-600">{emp.designation || "—"}</td>
                  <td className="px-4 py-2 text-slate-600">{emp.department || "—"}</td>
                  <td className="px-4 py-2 text-slate-600">${emp.monthlySalary.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleToggleStatus(emp)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${emp.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"}`}
                    >
                      {emp.status}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:underline">
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
