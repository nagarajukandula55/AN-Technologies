"use client";

import { useEffect, useState } from "react";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  joinDate: string;
  status: string;
};

const emptyForm = {
  name: "",
  email: "",
  role: "",
  department: "",
};

export function TeamClient() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  function loadMembers() {
    fetch("/api/team")
      .then((res) => res.json())
      .then(setMembers)
      .finally(() => setLoading(false));
  }

  useEffect(loadMembers, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm(emptyForm);
    setShowForm(false);
    loadMembers();
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch(`/api/team/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadMembers();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this team member?")) return;
    await fetch(`/api/team/${id}`, { method: "DELETE" });
    loadMembers();
  }

  const activeMembers = members.filter((m) => m.status === "ACTIVE");
  const inactiveMembers = members.filter((m) => m.status === "INACTIVE");
  const departments = [...new Set(members.map((m) => m.department).filter(Boolean) as string[])];

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Team Management</h1>
          <p className="mt-2 text-slate-600">Manage team members and roles</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowForm(!showForm);
          }}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ Add Member"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-slate-200 p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="email"
              required
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Department (optional)"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Add Team Member
          </button>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Members</p>
          <p className="text-2xl font-bold mt-1">{members.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Active</p>
          <p className="text-2xl font-bold mt-1">{activeMembers.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Departments</p>
          <p className="text-2xl font-bold mt-1">{departments.length}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-slate-500">No team members yet.</p>
      ) : (
        <div className="space-y-6">
          {activeMembers.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Active Members ({activeMembers.length})</h2>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Name</th>
                        <th className="px-4 py-2 text-left font-medium">Email</th>
                        <th className="px-4 py-2 text-left font-medium">Role</th>
                        <th className="px-4 py-2 text-left font-medium">Department</th>
                        <th className="px-4 py-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeMembers.map((member) => (
                        <tr key={member.id} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-2 font-medium">{member.name}</td>
                          <td className="px-4 py-2 text-slate-600">{member.email}</td>
                          <td className="px-4 py-2 text-slate-600">{member.role}</td>
                          <td className="px-4 py-2 text-slate-600">{member.department || "—"}</td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => handleStatusChange(member.id, "INACTIVE")}
                              className="text-xs text-blue-600 hover:underline mr-3"
                            >
                              Deactivate
                            </button>
                            <button
                              onClick={() => handleDelete(member.id)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {inactiveMembers.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-slate-600">Inactive ({inactiveMembers.length})</h2>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Name</th>
                        <th className="px-4 py-2 text-left font-medium">Email</th>
                        <th className="px-4 py-2 text-left font-medium">Role</th>
                        <th className="px-4 py-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inactiveMembers.map((member) => (
                        <tr key={member.id} className="border-b opacity-75">
                          <td className="px-4 py-2 font-medium">{member.name}</td>
                          <td className="px-4 py-2 text-slate-600">{member.email}</td>
                          <td className="px-4 py-2 text-slate-600">{member.role}</td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => handleStatusChange(member.id, "ACTIVE")}
                              className="text-xs text-blue-600 hover:underline mr-3"
                            >
                              Reactivate
                            </button>
                            <button
                              onClick={() => handleDelete(member.id)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
