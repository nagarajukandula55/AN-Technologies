"use client";

import { useEffect, useState } from "react";

type Workflow = {
  id: string;
  name: string;
  trigger: string;
  actions: Array<{ type: string; config: Record<string, unknown> }>;
  isActive: boolean;
};

const TRIGGERS = ["Email", "Schedule", "Manual", "Webhook", "Form"];
const ACTIONS = ["Send Email", "Create Record", "Update Record", "Delete Record", "Notify"];

export function WorkflowsClient() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    trigger: "Manual",
    actions: [{ type: "Send Email", config: {} }],
  });

  useEffect(() => {
    fetch("/api/workflows")
      .then((res) => res.json())
      .then(setWorkflows)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", trigger: "Manual", actions: [{ type: "Send Email", config: {} }] });
    setShowForm(false);
    const updated = await fetch("/api/workflows").then((r) => r.json());
    setWorkflows(updated);
  }

  async function toggleWorkflow(id: string, active: boolean) {
    await fetch(`/api/workflows/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !active }),
    });
    const updated = await fetch("/api/workflows").then((r) => r.json());
    setWorkflows(updated);
  }

  async function deleteWorkflow(id: string) {
    if (!confirm("Delete this workflow?")) return;
    await fetch(`/api/workflows/${id}`, { method: "DELETE" });
    const updated = await fetch("/api/workflows").then((r) => r.json());
    setWorkflows(updated);
  }

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Workflows & Automation</h1>
          <p className="mt-2 text-slate-600">Automate business processes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ New Workflow"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-slate-200 p-6 space-y-4">
          <input
            required
            placeholder="Workflow name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <div>
            <label className="block text-sm font-medium mb-2">Trigger</label>
            <select
              value={form.trigger}
              onChange={(e) => setForm({ ...form, trigger: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {TRIGGERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Actions</label>
            {form.actions.map((action, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select
                  value={action.type}
                  onChange={(e) => {
                    const newActions = [...form.actions];
                    newActions[idx].type = e.target.value;
                    setForm({ ...form, actions: newActions });
                  }}
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  {ACTIONS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Create Workflow
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : workflows.length === 0 ? (
        <p className="text-sm text-slate-500">No workflows yet.</p>
      ) : (
        <div className="space-y-3">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="rounded-lg border border-slate-200 p-4 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{workflow.name}</h3>
                <p className="text-sm text-slate-600">Trigger: {workflow.trigger} • {workflow.actions.length} action(s)</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleWorkflow(workflow.id, workflow.isActive)}
                  className={`text-sm px-3 py-1 rounded-md ${
                    workflow.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {workflow.isActive ? "Active" : "Inactive"}
                </button>
                <button
                  onClick={() => deleteWorkflow(workflow.id)}
                  className="text-xs text-red-600 hover:underline"
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
