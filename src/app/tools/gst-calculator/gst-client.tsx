"use client";

import { useMemo, useState } from "react";
import { Nav } from "@/components/nav";

const RATES = [5, 12, 18, 28];

export function GstCalculatorClient() {
  const [amount, setAmount] = useState(1000);
  const [rate, setRate] = useState(18);
  const [mode, setMode] = useState<"exclusive" | "inclusive">("exclusive");
  const [sameState, setSameState] = useState(true);

  const { base, total, cgst, sgst, igst } = useMemo(() => {
    let baseAmount: number;
    let totalAmount: number;
    if (mode === "exclusive") {
      baseAmount = amount;
      totalAmount = amount * (1 + rate / 100);
    } else {
      baseAmount = amount / (1 + rate / 100);
      totalAmount = amount;
    }
    const gstAmount = totalAmount - baseAmount;
    return {
      base: baseAmount,
      gst: gstAmount,
      total: totalAmount,
      cgst: sameState ? gstAmount / 2 : 0,
      sgst: sameState ? gstAmount / 2 : 0,
      igst: sameState ? 0 : gstAmount,
    };
  }, [amount, rate, mode, sameState]);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">GST Calculator</h1>
        <p className="mt-2 text-slate-600">
          Calculate GST-inclusive or exclusive amounts with CGST/SGST/IGST breakdown. Free and unlimited.
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">GST Rate</label>
            <div className="mt-1 flex gap-2">
              {RATES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRate(r)}
                  className={`rounded-md px-4 py-2 text-sm ${rate === r ? "bg-slate-900 text-white" : "border border-slate-300"}`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setMode("exclusive")}
              className={`rounded-md px-4 py-2 text-sm ${mode === "exclusive" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
            >
              Add GST (amount excludes GST)
            </button>
            <button
              onClick={() => setMode("inclusive")}
              className={`rounded-md px-4 py-2 text-sm ${mode === "inclusive" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
            >
              Remove GST (amount includes GST)
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={sameState} onChange={(e) => setSameState(e.target.checked)} />
            Same state (split as CGST + SGST instead of IGST)
          </label>
        </div>

        <div className="mt-8 rounded-lg border border-slate-200 p-6">
          <div className="flex justify-between text-sm">
            <span>Base amount</span>
            <span>₹{base.toFixed(2)}</span>
          </div>
          {sameState ? (
            <>
              <div className="mt-2 flex justify-between text-sm">
                <span>CGST ({rate / 2}%)</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span>SGST ({rate / 2}%)</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div className="mt-2 flex justify-between text-sm">
              <span>IGST ({rate}%)</span>
              <span>₹{igst.toFixed(2)}</span>
            </div>
          )}
          <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-lg font-semibold">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </main>
    </>
  );
}
