import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { KnowledgeBaseClient } from "./knowledge-base-client";

export const metadata: Metadata = { title: "Knowledge Base" };

export default async function KnowledgeBasePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <KnowledgeBaseClient />
    </>
  );
}
