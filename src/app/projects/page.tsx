import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { ProjectsClient } from "./projects-client";

export const metadata: Metadata = {
  title: "Projects & Tasks",
};

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <ProjectsClient />
    </>
  );
}
