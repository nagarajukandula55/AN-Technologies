import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { AnalyticsClient } from "./analytics-client";

export const metadata: Metadata = { title: "Analytics Dashboard" };

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <AnalyticsClient />
    </>
  );
}
