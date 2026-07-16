import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { VendorsClient } from "./vendors-client";

export const metadata: Metadata = { title: "Vendor Portal" };

export default async function VendorsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <VendorsClient />
    </>
  );
}
