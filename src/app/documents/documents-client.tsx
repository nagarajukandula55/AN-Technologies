"use client";

import { useEffect, useState } from "react";

type Document = {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  category?: string;
  tags: string[];
  uploadedAt: string;
  updatedAt: string;
};

const emptyForm = {
  title: "",
  fileName: "",
  fileSize: 0,
  fileType: "",
  category: "",
  tags: "",
};

const FILE_ICONS: Record<string, string> = {
  pdf: "📄",
  doc: "📝",
  docx: "📝",
  xls: "📊",
  xlsx: "📊",
  ppt: "📽️",
  pptx: "📽️",
  jpg: "🖼️",
  png: "🖼️",
  gif: "🖼️",
  zip: "📦",
  txt: "📋",
};

export function DocumentsClient() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");

  function loadDocuments() {
    fetch("/api/documents")
      .then((res) => res.json())
      .then(setDocuments)
      .finally(() => setLoading(false));
  }

  useEffect(loadDocuments, []);

  function getFileIcon(fileType: string): string {
    const ext = fileType.split("/").pop()?.split(".").pop()?.toLowerCase() || "";
    return FILE_ICONS[ext] || "📄";
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        fileName: form.fileName,
        fileSize: form.fileSize,
        fileType: form.fileType,
        category: form.category || undefined,
        tags,
      }),
    });

    setForm(emptyForm);
    setShowForm(false);
    loadDocuments();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    loadDocuments();
  }

  const categories = [...new Set(documents.map((d) => d.category).filter(Boolean) as string[])];
  const filteredDocuments = filterCategory
    ? documents.filter((d) => d.category === filterCategory)
    : documents;

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Document Management</h1>
          <p className="mt-2 text-slate-600">Organize and manage files</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowForm(!showForm);
          }}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ Upload Document"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-slate-200 p-6 space-y-4">
          <input
            required
            placeholder="Document title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="File name"
            value={form.fileName}
            onChange={(e) => setForm({ ...form, fileName: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              type="number"
              min="1"
              placeholder="File size (bytes)"
              value={form.fileSize}
              onChange={(e) => setForm({ ...form, fileSize: parseInt(e.target.value) })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="File type (e.g., application/pdf)"
              value={form.fileType}
              onChange={(e) => setForm({ ...form, fileType: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Upload Document
          </button>
        </form>
      )}

      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory("")}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filterCategory === ""
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({documents.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                filterCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat} ({documents.filter((d) => d.category === cat).length})
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : filteredDocuments.length === 0 ? (
        <p className="text-sm text-slate-500">
          {documents.length === 0 ? "No documents yet." : "No documents in this category."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="rounded-lg border border-slate-200 p-4 hover:border-slate-400 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getFileIcon(doc.fileType)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold line-clamp-1">{doc.title}</h3>
                      <p className="text-xs text-slate-500">{doc.fileName}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{formatFileSize(doc.fileSize)}</p>
                  {doc.category && (
                    <p className="mt-1 text-xs text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded">
                      {doc.category}
                    </p>
                  )}
                  {doc.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {doc.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-xs text-red-600 hover:underline ml-2"
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
