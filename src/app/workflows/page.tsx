import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { WorkflowsClient } from "./workflows-client";

export const metadata: Metadata = { title: "Workflows" };

export default async function WorkflowsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <WorkflowsClient />
    </>
  );
}
