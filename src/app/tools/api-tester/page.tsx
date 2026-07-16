import type { Metadata } from "next";
import { ApiTesterClient } from "./api-tester-client";

export const metadata: Metadata = {
  title: "Free API Tester — Send HTTP Requests Online",
  description: "Send HTTP requests and inspect responses directly from your browser. Free and unlimited.",
};

export default function ApiTesterPage() {
  return <ApiTesterClient />;
}
