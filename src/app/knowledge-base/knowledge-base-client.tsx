"use client";

import { useEffect, useState } from "react";

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  category?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const emptyForm = { title: "", slug: "", content: "", category: "" };

export function KnowledgeBaseClient() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  function loadArticles() {
    fetch("/api/knowledge-base")
      .then((res) => res.json())
      .then(setArticles)
      .finally(() => setLoading(false));
  }

  useEffect(loadArticles, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/knowledge-base", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setShowForm(false);
    loadArticles();
  }

  async function handleUpdate(e: React.FormEvent) {
    if (!selectedArticle) return;
    e.preventDefault();
    await fetch(`/api/knowledge-base/${selectedArticle.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        content: form.content,
        category: form.category,
      }),
    });
    setForm(emptyForm);
    setSelectedArticle(null);
    loadArticles();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/knowledge-base/${id}`, { method: "DELETE" });
    setSelectedArticle(null);
    loadArticles();
  }

  function handleEditClick(article: Article) {
    setForm({
      title: article.title,
      slug: article.slug,
      content: article.content,
      category: article.category || "",
    });
    setSelectedArticle(article);
    setShowForm(true);
  }

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.category && a.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Knowledge Base</h1>
          <p className="mt-2 text-slate-600">Create and manage articles and documentation</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setSelectedArticle(null);
            setShowForm(!showForm);
          }}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ New Article"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={selectedArticle ? handleUpdate : handleSubmit} className="mb-8 rounded-lg border border-slate-200 p-6 space-y-4">
          <input
            required
            placeholder="Article title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {!selectedArticle && (
            <input
              placeholder="URL slug (auto-generated if empty)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          )}
          <input
            placeholder="Category (optional)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <textarea
            required
            placeholder="Article content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={8}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono text-xs"
          />
          <div className="flex gap-2">
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700">
              {selectedArticle ? "Update Article" : "Create Article"}
            </button>
            {selectedArticle && (
              <button
                type="button"
                onClick={() => handleDelete(selectedArticle.id)}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : filteredArticles.length === 0 ? (
        <p className="text-sm text-slate-500">
          {articles.length === 0 ? "No articles yet." : "No articles match your search."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredArticles.map((article) => (
            <div key={article.id} className="rounded-lg border border-slate-200 p-4 hover:border-slate-400 transition cursor-pointer" onClick={() => handleEditClick(article)}>
              <h3 className="font-semibold">{article.title}</h3>
              {article.category && (
                <p className="mt-1 text-xs text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded">
                  {article.category}
                </p>
              )}
              <p className="mt-3 text-sm text-slate-600 line-clamp-2">{article.content}</p>
              <p className="mt-3 text-xs text-slate-400">
                {new Date(article.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
