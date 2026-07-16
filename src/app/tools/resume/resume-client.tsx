"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { Nav } from "@/components/nav";
import { FreeTierNotice, LimitReachedBanner } from "@/components/tool-banners";
import { useTier, checkAndRecordUsage } from "@/hooks/use-tier";

type Experience = { title: string; company: string; period: string; details: string };

function download(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      lines.push(current.trim());
      current = word;
    } else {
      current += " " + word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

export function ResumeClient() {
  const { tier, isPaid } = useTier();
  const [name, setName] = useState("Jane Doe");
  const [contact, setContact] = useState("jane@example.com · +1 555 000 1234");
  const [summary, setSummary] = useState("Product-focused engineer with 5 years of experience shipping web applications.");
  const [skills, setSkills] = useState("TypeScript, React, Node.js, SQL");
  const [experience, setExperience] = useState<Experience[]>([
    { title: "Senior Engineer", company: "Acme Corp", period: "2022 – Present", details: "Led development of the core platform." },
  ]);
  const [status, setStatus] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [busy, setBusy] = useState(false);

  function updateExp(i: number, patch: Partial<Experience>) {
    setExperience((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  }

  function addExp() {
    setExperience((prev) => [...prev, { title: "", company: "", period: "", details: "" }]);
  }

  function removeExp(i: number) {
    setExperience((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleGenerate() {
    const usage = await checkAndRecordUsage("resume");
    if (!usage.allowed) {
      setLimitReached(true);
      return;
    }
    setLimitReached(false);
    setStatus(null);
    setBusy(true);
    try {
      const doc = await PDFDocument.create();
      const page = doc.addPage([595, 842]);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const bold = await doc.embedFont(StandardFonts.HelveticaBold);
      const { height } = page.getSize();
      let y = height - 60;

      page.drawText(name, { x: 50, y, size: 22, font: bold });
      y -= 22;
      page.drawText(contact, { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
      y -= 30;

      page.drawText("Summary", { x: 50, y, size: 13, font: bold });
      y -= 18;
      for (const line of wrapText(summary, 95)) {
        page.drawText(line, { x: 50, y, size: 10, font });
        y -= 14;
      }
      y -= 16;

      page.drawText("Experience", { x: 50, y, size: 13, font: bold });
      y -= 18;
      for (const exp of experience) {
        page.drawText(`${exp.title} — ${exp.company}`, { x: 50, y, size: 11, font: bold });
        page.drawText(exp.period, { x: 420, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
        y -= 14;
        for (const line of wrapText(exp.details, 95)) {
          page.drawText(line, { x: 50, y, size: 10, font });
          y -= 14;
        }
        y -= 10;
      }

      y -= 6;
      page.drawText("Skills", { x: 50, y, size: 13, font: bold });
      y -= 18;
      for (const line of wrapText(skills, 95)) {
        page.drawText(line, { x: 50, y, size: 10, font });
        y -= 14;
      }

      if (!isPaid) {
        page.drawText("Generated with AN Technologies — Free Plan", {
          x: 150,
          y: height / 2,
          size: 20,
          rotate: degrees(45),
          color: rgb(0.85, 0.85, 0.85),
          opacity: 0.6,
        });
      }

      const bytes = await doc.save();
      download(bytes, `${name.replace(/\s+/g, "-").toLowerCase() || "resume"}.pdf`);
      setStatus("Resume generated.");
    } catch {
      setStatus("Something went wrong generating the resume.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">Resume Builder</h1>
        <p className="mt-2 text-slate-600">Build a clean, professional PDF resume in minutes.</p>

        <FreeTierNotice tier={tier} toolLabel="resumes" />

        <div className="mt-8 grid gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Contact Info</label>
            <input value={contact} onChange={(e) => setContact(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Summary</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>
        </div>

        <h2 className="mt-8 text-lg font-semibold">Experience</h2>
        <div className="mt-4 space-y-4">
          {experience.map((exp, i) => (
            <div key={i} className="rounded-md border border-slate-200 p-4">
              <div className="grid gap-2 sm:grid-cols-3">
                <input placeholder="Title" value={exp.title} onChange={(e) => updateExp(i, { title: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input placeholder="Company" value={exp.company} onChange={(e) => updateExp(i, { company: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input placeholder="Period" value={exp.period} onChange={(e) => updateExp(i, { period: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <textarea placeholder="Details" value={exp.details} onChange={(e) => updateExp(i, { details: e.target.value })} rows={2} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <button onClick={() => removeExp(i)} className="mt-2 text-sm text-red-600 hover:underline">Remove</button>
            </div>
          ))}
        </div>
        <button onClick={addExp} className="mt-3 text-sm text-slate-700 underline">+ Add experience</button>

        <div className="mt-8">
          <label className="text-sm font-medium text-slate-700">Skills (comma-separated)</label>
          <input value={skills} onChange={(e) => setSkills(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
        </div>

        <button
          onClick={handleGenerate}
          disabled={busy}
          className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Generate PDF Resume
        </button>

        {status && <p className="mt-4 text-sm text-slate-700">{status}</p>}
        {limitReached && <LimitReachedBanner />}
      </main>
    </>
  );
}
