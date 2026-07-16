import type { Metadata } from "next";
import { ResumeClient } from "./resume-client";

export const metadata: Metadata = {
  title: "Free Resume Builder — Create a PDF Resume Online",
  description: "Build a clean, professional PDF resume in minutes. Free, private, no upload required.",
};

export default function ResumePage() {
  return <ResumeClient />;
}
