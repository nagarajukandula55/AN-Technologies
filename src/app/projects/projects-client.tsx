"use client";

import { useEffect, useState } from "react";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type Task = { id: string; title: string; status: TaskStatus; dueDate: string | null };
type ProjectStatus = "ACTIVE" | "ON_HOLD" | "COMPLETED";
type Project = { id: string; name: string; status: ProjectStatus; tasks: Task[] };

const STATUS_CYCLE: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  DONE: "bg-green-100 text-green-800",
};

export function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState<Record<string, string>>({});

  function loadProjects() {
    fetch("/api/projects")
      .then((res) => res.json())
      .then(setProjects)
      .finally(() => setLoading(false));
  }

  useEffect(loadProjects, []);

  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newProjectName }),
    });
    setNewProjectName("");
    loadProjects();
  }

  async function handleDeleteProject(id: string) {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    loadProjects();
  }

  async function handleAddTask(projectId: string) {
    const title = newTaskTitle[projectId];
    if (!title?.trim()) return;
    await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setNewTaskTitle({ ...newTaskTitle, [projectId]: "" });
    loadProjects();
  }

  async function handleCycleStatus(task: Task) {
    const nextStatus = STATUS_CYCLE[(STATUS_CYCLE.indexOf(task.status) + 1) % STATUS_CYCLE.length];
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    loadProjects();
  }

  async function handleDeleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    loadProjects();
  }

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-semibold">Projects &amp; Tasks</h1>
      <p className="mt-2 text-slate-600">Track projects and their tasks. Click a task&apos;s status to advance it.</p>

      <form onSubmit={handleAddProject} className="mt-6 flex gap-2">
        <input
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="New project name"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700">
          + Add Project
        </button>
      </form>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : projects.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No projects yet.</p>
      ) : (
        <div className="mt-8 space-y-6">
          {projects.map((project) => (
            <div key={project.id} className="rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{project.name}</h2>
                <button onClick={() => handleDeleteProject(project.id)} className="text-sm text-red-600 hover:underline">
                  Delete Project
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {project.tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2">
                    <span className="text-sm">{task.title}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleCycleStatus(task)}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[task.status]}`}
                      >
                        {task.status.replace("_", " ")}
                      </button>
                      <button onClick={() => handleDeleteTask(task.id)} className="text-xs text-red-600 hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {project.tasks.length === 0 && <p className="text-sm text-slate-400">No tasks yet.</p>}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  value={newTaskTitle[project.id] ?? ""}
                  onChange={(e) => setNewTaskTitle({ ...newTaskTitle, [project.id]: e.target.value })}
                  placeholder="New task"
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  onClick={() => handleAddTask(project.id)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                >
                  + Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
