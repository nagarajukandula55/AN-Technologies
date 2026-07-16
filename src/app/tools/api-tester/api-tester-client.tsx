"use client";

import { useState } from "react";
import { Nav } from "@/components/nav";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export function ApiTesterClient() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<{ status: number; time: number; body: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSend() {
    setError(null);
    setResponse(null);
    setBusy(true);
    const start = performance.now();
    try {
      let parsedHeaders: Record<string, string> = {};
      if (headers.trim()) {
        parsedHeaders = JSON.parse(headers);
      }
      const res = await fetch(url, {
        method,
        headers: parsedHeaders,
        body: method !== "GET" && method !== "DELETE" && body ? body : undefined,
      });
      const text = await res.text();
      let formatted = text;
      try {
        formatted = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        // not JSON, leave as-is
      }
      setResponse({ status: res.status, time: Math.round(performance.now() - start), body: formatted });
    } catch (e) {
      setError(
        e instanceof SyntaxError
          ? "Invalid JSON in headers."
          : "Request failed — likely blocked by CORS (the target API doesn't allow browser requests from this origin), or the URL is unreachable."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">API Tester</h1>
        <p className="mt-2 text-slate-600">
          Send HTTP requests and inspect responses. Free and unlimited — requests go straight from your
          browser to the API, so they&apos;re subject to that API&apos;s CORS policy.
        </p>

        <div className="mt-6 flex gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={busy}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send"}
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Headers (JSON)</label>
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-md border border-slate-300 p-3 font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Body (for POST/PUT/PATCH)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-md border border-slate-300 p-3 font-mono text-sm"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {response && (
          <div className="mt-6">
            <p className="text-sm font-medium text-slate-700">
              Status: <span className={response.status < 400 ? "text-green-700" : "text-red-700"}>{response.status}</span>
              {" · "}
              {response.time}ms
            </p>
            <textarea
              value={response.body}
              readOnly
              rows={14}
              className="mt-2 w-full rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm"
            />
          </div>
        )}
      </main>
    </>
  );
}
