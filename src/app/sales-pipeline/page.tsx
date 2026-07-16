import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { SalesPipelineClient } from "./sales-pipeline-client";

export const metadata: Metadata = { title: "Sales Pipeline" };

export default async function SalesPipelinePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <SalesPipelineClient />
    </>
  );
}
