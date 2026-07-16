import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { CrmClient } from "./crm-client";

export const metadata: Metadata = {
  title: "CRM — Contacts & Leads",
};

export default async function CrmPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <CrmClient />
    </>
  );
}
