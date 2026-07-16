"use client";

import { useMemo, useState } from "react";
import { Nav } from "@/components/nav";

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function shade(hex: string, percent: number) {
  const { r, g, b } = hexToRgb(hex);
  const adjust = (v: number) => Math.max(0, Math.min(255, Math.round(v + (percent / 100) * 255)));
  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`;
}

export function ColorPickerClient() {
  const [color, setColor] = useState("#4f46e5");

  const { r, g, b } = useMemo(() => hexToRgb(color), [color]);
  const { h, s, l } = useMemo(() => rgbToHsl(r, g, b), [r, g, b]);
  const palette = useMemo(
    () => [-40, -20, -10, 0, 10, 20, 40].map((p) => shade(color, p)),
    [color]
  );

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold">Color Picker &amp; Palette Generator</h1>
        <p className="mt-2 text-slate-600">
          Pick a color and get HEX/RGB/HSL values plus a shade palette. Free and unlimited.
        </p>

        <div className="mt-8 flex items-center gap-6">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-24 w-24 cursor-pointer rounded-lg border border-slate-300"
          />
          <div className="space-y-2 text-sm">
            <button onClick={() => copy(color)} className="block font-mono hover:underline">
              HEX: {color}
            </button>
            <button onClick={() => copy(`rgb(${r}, ${g}, ${b})`)} className="block font-mono hover:underline">
              RGB: rgb({r}, {g}, {b})
            </button>
            <button onClick={() => copy(`hsl(${h}, ${s}%, ${l}%)`)} className="block font-mono hover:underline">
              HSL: hsl({h}, {s}%, {l}%)
            </button>
          </div>
        </div>

        <h2 className="mt-10 text-lg font-semibold">Shades</h2>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {palette.map((c) => (
            <button
              key={c}
              onClick={() => copy(c)}
              className="group flex h-16 flex-col items-center justify-end rounded-md border border-slate-200 pb-1"
              style={{ backgroundColor: c }}
              title={`Copy ${c}`}
            >
              <span className="rounded bg-white/80 px-1 text-[10px] font-mono opacity-0 group-hover:opacity-100">
                {c}
              </span>
            </button>
          ))}
        </div>
      </main>
    </>
  );
}
