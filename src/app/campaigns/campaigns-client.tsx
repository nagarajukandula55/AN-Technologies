"use client";

import { useEffect, useState } from "react";

type Campaign = {
  id: string;
  name: string;
  subject: string;
  recipients: string[];
  status: string;
  sentAt?: string;
  openCount: number;
  clickCount: number;
  createdAt: string;
};

const emptyForm = {
  name: "",
  subject: "",
  recipients: "",
};

export function CampaignsClient() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  function loadCampaigns() {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then(setCampaigns)
      .finally(() => setLoading(false));
  }

  useEffect(loadCampaigns, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const recipients = form.recipients
      .split("\n")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (recipients.length === 0) return;

    await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        subject: form.subject,
        recipients,
      }),
    });

    setForm(emptyForm);
    setShowForm(false);
    loadCampaigns();
  }

  async function handleSend(id: string) {
    if (!confirm("Send this campaign?")) return;
    await fetch(`/api/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SENT" }),
    });
    loadCampaigns();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this campaign?")) return;
    await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
    loadCampaigns();
  }

  const totalRecipients = campaigns.reduce((sum, c) => sum + (c.recipients?.length || 0), 0);
  const sentCampaigns = campaigns.filter((c) => c.status === "SENT").length;

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Email Campaigns</h1>
          <p className="mt-2 text-slate-600">Create and manage email campaigns</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowForm(!showForm);
          }}
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          {showForm ? "Cancel" : "+ New Campaign"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-slate-200 p-6 space-y-4">
          <input
            required
            placeholder="Campaign name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Email subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <textarea
            required
            placeholder="Recipient emails (one per line)"
            value={form.recipients}
            onChange={(e) => setForm({ ...form, recipients: e.target.value })}
            rows={6}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono text-xs"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Create Campaign
          </button>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Campaigns</p>
          <p className="text-2xl font-bold mt-1">{campaigns.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Sent</p>
          <p className="text-2xl font-bold mt-1">{sentCampaigns}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Recipients</p>
          <p className="text-2xl font-bold mt-1">{totalRecipients}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : campaigns.length === 0 ? (
        <p className="text-sm text-slate-500">No campaigns yet.</p>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{campaign.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{campaign.subject}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {campaign.recipients?.length || 0} recipient
                    {campaign.recipients?.length !== 1 ? "s" : ""}
                  </p>
                  {campaign.sentAt && (
                    <p className="mt-1 text-xs text-slate-500">
                      Sent {new Date(campaign.sentAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    campaign.status === "SENT"
                      ? "bg-green-100 text-green-800"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {campaign.status}
                  </span>
                  {campaign.status === "SENT" && (
                    <p className="text-xs text-slate-600">
                      {campaign.openCount} opens, {campaign.clickCount} clicks
                    </p>
                  )}
                  <div className="flex gap-2 text-xs">
                    {campaign.status !== "SENT" && (
                      <button
                        onClick={() => handleSend(campaign.id)}
                        className="text-blue-600 hover:underline"
                      >
                        Send
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(campaign.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
