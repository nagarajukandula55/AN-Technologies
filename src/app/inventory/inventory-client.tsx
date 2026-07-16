"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  lowStockAt: number;
};

const emptyForm = { name: "", sku: "", price: 0, stock: 0, lowStockAt: 5 };

export function InventoryClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  function loadProducts() {
    fetch("/api/inventory/products")
      .then((res) => res.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }

  useEffect(loadProducts, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/inventory/products/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/inventory/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    loadProducts();
  }

  function handleEdit(p: Product) {
    setForm({ name: p.name, sku: p.sku ?? "", price: p.price, stock: p.stock, lowStockAt: p.lowStockAt });
    setEditingId(p.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/inventory/products/${id}`, { method: "DELETE" });
    loadProducts();
  }

  const lowStockCount = products.filter((p) => p.stock <= p.lowStockAt).length;

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventory</h1>
          <p className="mt-2 text-slate-600">
            Track stock levels.{" "}
            {lowStockCount > 0 && <span className="text-amber-600">{lowStockCount} item(s) low on stock.</span>}
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-lg border border-slate-200 p-6 sm:grid-cols-2">
          <input
            required
            placeholder="Product name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Stock quantity"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <div>
            <label className="text-xs text-slate-500">Low stock alert threshold</label>
            <input
              type="number"
              value={form.lowStockAt}
              onChange={(e) => setForm({ ...form, lowStockAt: Number(e.target.value) })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className="self-end rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700">
            {editingId ? "Save Changes" : "Add Product"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : products.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No products yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">SKU</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Stock</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium">{p.name}</td>
                  <td className="px-4 py-2 text-slate-600">{p.sku || "—"}</td>
                  <td className="px-4 py-2 text-slate-600">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <span className={p.stock <= p.lowStockAt ? "font-medium text-amber-600" : "text-slate-600"}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => handleEdit(p)} className="mr-3 text-slate-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">
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
