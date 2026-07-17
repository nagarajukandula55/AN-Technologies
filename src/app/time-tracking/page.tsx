import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { TimeTrackingClient } from "./time-tracking-client";

export const metadata: Metadata = { title: "Time Tracking" };

export default async function TimeTrackingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <TimeTrackingClient />
    </>
  );
}
