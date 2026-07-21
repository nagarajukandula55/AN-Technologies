import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getUserTier } from "@/lib/entitlements";
import { Nav } from "@/components/nav";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { WorkflowsClient } from "./workflows-client";

export const metadata: Metadata = { title: "Workflows" };

export default async function WorkflowsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tier = await getUserTier(session.user.id);
  if (tier === "FREE") {
    return (
      <>
        <Nav />
        <UpgradePrompt appName="Workflows" />
      </>
    );
  }

  return (
    <>
      <Nav />
      <WorkflowsClient />
    </>
  );
}
