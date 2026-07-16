import type { Metadata } from "next";
import { SignatureClient } from "./signature-client";

export const metadata: Metadata = {
  title: "Free Signature Generator — Draw or Type Your Signature",
  description: "Draw or type a signature and export it as a transparent PNG. Free, private, no upload required.",
};

export default function SignaturePage() {
  return <SignatureClient />;
}
