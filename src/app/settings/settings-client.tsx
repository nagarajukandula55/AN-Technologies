"use client";

import { useEffect, useState } from "react";

type Settings = {
  id: string;
  theme: string;
  timezone: string;
  language: string;
  notificationsEmail: boolean;
  notificationsSms: boolean;
  twoFactorEnabled: boolean;
};

const TIMEZONES = [
  "UTC",
  "EST",
  "CST",
  "MST",
  "PST",
  "GMT",
  "IST",
  "JST",
  "AEST",
];

const LANGUAGES = ["EN", "ES", "FR", "DE", "IT", "PT", "JA", "ZH"];

const THEMES = ["LIGHT", "DARK"];

export function SettingsClient() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  function loadSettings() {
    fetch("/api/settings")
      .then((res) => res.json())
      .then(setSettings)
      .finally(() => setLoading(false));
  }

  useEffect(loadSettings, []);

  async function handleSave(field: string, value: string | boolean) {
    if (!settings) return;

    const updated = { ...settings, [field]: value };
    setSettings(updated);

    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="mx-auto max-w-2xl flex-1 px-6 py-16">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-2 text-slate-600">Manage your account preferences</p>
      </div>

      {saved && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-800">✓ Settings saved successfully</p>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : !settings ? (
        <p className="text-sm text-slate-500">Unable to load settings</p>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleSave("theme", e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm w-full max-w-xs"
              >
                {THEMES.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme === "LIGHT" ? "Light" : "Dark"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => handleSave("timezone", e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm w-full max-w-xs"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={settings.language}
                onChange={(e) => handleSave("language", e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm w-full max-w-xs"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Notifications</h2>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.notificationsEmail}
                onChange={(e) => handleSave("notificationsEmail", e.target.checked)}
                className="rounded border-slate-300 w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-medium">Email Notifications</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.notificationsSms}
                onChange={(e) => handleSave("notificationsSms", e.target.checked)}
                className="rounded border-slate-300 w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-medium">SMS Notifications</span>
            </label>
          </div>

          <div className="rounded-lg border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Security</h2>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.twoFactorEnabled}
                onChange={(e) => handleSave("twoFactorEnabled", e.target.checked)}
                className="rounded border-slate-300 w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-medium">Two-Factor Authentication</span>
            </label>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
            <button className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 text-sm">
              Delete Account
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
