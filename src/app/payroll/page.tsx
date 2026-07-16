import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { PayrollClient } from "./payroll-client";

export const metadata: Metadata = { title: "Payroll" };

export default async function PayrollPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <PayrollClient />
    </>
  );
}
