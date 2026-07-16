import type { Metadata } from "next";
import { PasswordClient } from "./password-client";

export const metadata: Metadata = {
  title: "Free Secure Password Generator",
  description:
    "Generate strong, random passwords instantly using your browser's secure random number generator. Free and unlimited.",
};

export default function PasswordGeneratorPage() {
  return <PasswordClient />;
}
