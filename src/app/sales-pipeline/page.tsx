import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getUserTier } from "@/lib/entitlements";
import { Nav } from "@/components/nav";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { SalesPipelineClient } from "./sales-pipeline-client";

export const metadata: Metadata = { title: "Sales Pipeline" };

export default async function SalesPipelinePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tier = await getUserTier(session.user.id);
  if (tier === "FREE") {
    return (
      <>
        <Nav />
        <UpgradePrompt appName="Sales Pipeline" />
      </>
    );
  }

  return (
    <>
      <Nav />
      <SalesPipelineClient />
    </>
  );
}
