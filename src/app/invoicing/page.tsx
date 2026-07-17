import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { InvoicingClient } from "./invoicing-client";

export const metadata: Metadata = { title: "Invoicing" };

export default async function InvoicingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <InvoicingClient />
    </>
  );
}
