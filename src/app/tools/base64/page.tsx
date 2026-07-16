import type { Metadata } from "next";
import { Base64Client } from "./base64-client";

export const metadata: Metadata = {
  title: "Free Base64 Encoder & Decoder Online",
  description: "Encode or decode Base64 text instantly in your browser. Free, private, no upload required.",
};

export default function Base64Page() {
  return <Base64Client />;
}
