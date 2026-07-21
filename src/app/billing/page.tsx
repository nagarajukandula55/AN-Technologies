import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { BillingClient } from "./billing-client";

export const metadata: Metadata = { title: "Billing & Account" };

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <BillingClient />
    </>
  );
}
