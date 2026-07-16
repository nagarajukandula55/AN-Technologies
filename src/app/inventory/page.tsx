import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { InventoryClient } from "./inventory-client";

export const metadata: Metadata = {
  title: "Inventory",
};

export default async function InventoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <InventoryClient />
    </>
  );
}
