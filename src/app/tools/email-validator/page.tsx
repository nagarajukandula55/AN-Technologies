import type { Metadata } from "next";
import { EmailValidatorClient } from "./email-client";

export const metadata: Metadata = {
  title: "Free Bulk Email Validator Online",
  description: "Check email format validity in bulk, entirely in your browser. Free and unlimited.",
};

export default function EmailValidatorPage() {
  return <EmailValidatorClient />;
}
