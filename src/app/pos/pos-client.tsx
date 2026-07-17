"use client";

import { useEffect, useState } from "react";

type Transaction = {
  id: string;
  customerName?: string;
  items: Array<{ id: string; name: string; quantity: number; price: number }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt: string;
};

const TAX_RATE = 0.1;

export function PosClient() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Array<{ id: string; name: string; quantity: number; price: number }>>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [showHistory, setShowHistory] = useState(false);

  function loadTransactions() {
    fetch("/api/pos")
      .then((res) => res.json())
      .then(setTransactions)
      .finally(() => setLoading(false));
  }

  useEffect(loadTransactions, []);

  function handleAddItem(name: string, price: number) {
    setCart((prev) => {
      const existing = prev.find((item) => item.name === name && item.price === price);
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: crypto.randomUUID(), name, quantity: 1, price }];
    });
  }

  function handleRemoveItem(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  function handleQuantityChange(index: number, quantity: number) {
    setCart((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, quantity) } : item))
    );
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) return;

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    await fetch("/api/pos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: customerName || undefined,
        items: cart,
        subtotal,
        tax,
        total,
        paymentMethod,
      }),
    });

    setCart([]);
    setCustomerName("");
    setPaymentMethod("CASH");
    loadTransactions();
  }

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartTax = Math.round(cartSubtotal * TAX_RATE * 100) / 100;
  const cartTotal = Math.round((cartSubtotal + cartTax) * 100) / 100;

  return (
    <main className="mx-auto max-w-6xl flex-1 px-6 py-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Point of Sale</h1>
              <p className="mt-2 text-slate-600">Process transactions and manage sales</p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
            >
              {showHistory ? "New Sale" : "History"}
            </button>
          </div>

          {!showHistory ? (
            <div className="space-y-6">
              <form onSubmit={handleCheckout} className="rounded-lg border border-slate-200 p-6">
                <div className="grid gap-4 sm:grid-cols-2 mb-6">
                  <input
                    type="text"
                    placeholder="Customer name (optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="CHECK">Check</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="mb-6 space-y-3">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { name: "Item A", price: 10 },
                      { name: "Item B", price: 15 },
                      { name: "Item C", price: 20 },
                      { name: "Item D", price: 25 },
                      { name: "Item E", price: 30 },
                      { name: "Item F", price: 35 },
                      { name: "Item G", price: 40 },
                      { name: "Item H", price: 45 },
                    ].map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleAddItem(item.name, item.price)}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-medium hover:bg-slate-100"
                      >
                        {item.name}
                        <br />
                        ${item.price}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-4 mb-6">
                  <h3 className="font-semibold mb-3">Cart ({cart.length} items)</h3>
                  {cart.length === 0 ? (
                    <p className="text-sm text-slate-500">No items added</p>
                  ) : (
                    <div className="space-y-2">
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex-1">
                            <span className="font-medium">{item.name}</span> × {item.quantity} @ ${item.price}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value))}
                              className="w-12 rounded border border-slate-300 px-2 py-1 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-slate-50 p-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="font-medium">${cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tax (10%):</span>
                      <span className="font-medium">${cartTax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between">
                      <span className="font-semibold">Total:</span>
                      <span className="text-lg font-bold">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cart.length === 0}
                  className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:bg-slate-400"
                >
                  Complete Sale
                </button>
              </form>
            </div>
          ) : (
            <div>
              {loading ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : transactions.length === 0 ? (
                <p className="text-sm text-slate-500">No transactions yet.</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((t) => (
                    <div key={t.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{t.customerName || "Walk-in Customer"}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(t.createdAt).toLocaleString()}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            {t.items.length} item{t.items.length !== 1 ? "s" : ""} • {t.paymentMethod}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">${(t.total as number).toFixed(2)}</p>
                          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            t.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 p-6">
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Total Transactions</p>
              <p className="text-2xl font-bold">{transactions.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold">
                ${transactions.reduce((sum, t) => sum + (t.total as number), 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Avg Transaction</p>
              <p className="text-2xl font-bold">
                ${transactions.length > 0
                  ? (transactions.reduce((sum, t) => sum + (t.total as number), 0) / transactions.length).toFixed(2)
                  : "0.00"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
