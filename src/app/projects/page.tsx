import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getUserTier } from "@/lib/entitlements";
import { Nav } from "@/components/nav";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { ProjectsClient } from "./projects-client";

export const metadata: Metadata = {
  title: "Projects & Tasks",
};

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tier = await getUserTier(session.user.id);
  if (tier === "FREE") {
    return (
      <>
        <Nav />
        <UpgradePrompt appName="Projects & Tasks" />
      </>
    );
  }

  return (
    <>
      <Nav />
      <ProjectsClient />
    </>
  );
}
