"use client";

import { useEffect, useState } from "react";

type Survey = {
  id: string;
  title: string;
  description?: string;
  questions: Array<{ id: string; text: string; type: string; options?: string[] }>;
  status: string;
  responseCount: number;
  createdAt: string;
};

const emptyForm = {
  title: "",
  description: "",
};

export function SurveysClient() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [questions, setQuestions] = useState<Array<{ id: string; text: string; type: string; options?: string[] }>>([]);

  function loadSurveys() {
    fetch("/api/surveys")
      .then((res) => res.json())
      .then(setSurveys)
      .finally(() => setLoading(false));
  }

  useEffect(loadSurveys, []);

  function handleAddQuestion() {
    setQuestions((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: "", type: "text", options: [] },
    ]);
  }

  function handleRemoveQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function handleQuestionChange(index: number, field: string, value: string | string[]) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (questions.length === 0) return;

    await fetch("/api/surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description || undefined,
        questions,
      }),
    });

    setForm(emptyForm);
    setQuestions([]);
    setShowForm(false);
    loadSurveys();
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch(`/api/surveys/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadSurveys();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this survey?")) return;
    await fetch(`/api/surveys/${id}`, { method: "DELETE" });
    loadSurveys();
  }

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Surveys & Feedback</h1>
          <p className="mt-2 text-slate-600">Create and analyze customer surveys</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setQuestions([]);
            setShowForm(!showForm);
          }}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ New Survey"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-slate-200 p-6 space-y-4">
          <input
            required
            placeholder="Survey title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Questions</h3>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="rounded-md bg-slate-100 px-3 py-1 text-sm hover:bg-slate-200"
              >
                + Add Question
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="rounded-lg border border-slate-100 p-4">
                  <div className="space-y-2 mb-2">
                    <input
                      required
                      placeholder="Question text"
                      value={q.text}
                      onChange={(e) => handleQuestionChange(idx, "text", e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                    <select
                      value={q.type}
                      onChange={(e) => handleQuestionChange(idx, "type", e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="text">Short Text</option>
                      <option value="textarea">Long Text</option>
                      <option value="multiple">Multiple Choice</option>
                      <option value="rating">Rating Scale</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={questions.length === 0}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:bg-slate-400"
          >
            Create Survey
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : surveys.length === 0 ? (
        <p className="text-sm text-slate-500">No surveys yet.</p>
      ) : (
        <div className="space-y-3">
          {surveys.map((survey) => (
            <div key={survey.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{survey.title}</h3>
                  {survey.description && (
                    <p className="mt-1 text-sm text-slate-600">{survey.description}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    {survey.questions.length} question{survey.questions.length !== 1 ? "s" : ""} •{" "}
                    {survey.responseCount} response{survey.responseCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <select
                    value={survey.status}
                    onChange={(e) => handleStatusChange(survey.id, e.target.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border-0 cursor-pointer ${
                      survey.status === "OPEN"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                  <button
                    onClick={() => handleDelete(survey.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
