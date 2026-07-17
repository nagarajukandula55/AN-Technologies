import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { DocumentsClient } from "./documents-client";

export const metadata: Metadata = { title: "Document Management" };

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <DocumentsClient />
    </>
  );
}
