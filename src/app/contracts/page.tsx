import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { ContractsClient } from "./contracts-client";

export const metadata: Metadata = { title: "Contract Management" };

export default async function ContractsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <ContractsClient />
    </>
  );
}
