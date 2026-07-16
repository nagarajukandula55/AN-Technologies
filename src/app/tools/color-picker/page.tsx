import type { Metadata } from "next";
import { ColorPickerClient } from "./color-client";

export const metadata: Metadata = {
  title: "Free Color Picker & Palette Generator",
  description: "Pick a color and get HEX/RGB/HSL values plus a shade palette. Free and unlimited.",
};

export default function ColorPickerPage() {
  return <ColorPickerClient />;
}
