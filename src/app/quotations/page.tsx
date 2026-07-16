import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { QuotationsClient } from "./quotations-client";

export const metadata: Metadata = { title: "Quotation Management" };

export default async function QuotationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <QuotationsClient />
    </>
  );
}
