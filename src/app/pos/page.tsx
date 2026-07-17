import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { PosClient } from "./pos-client";

export const metadata: Metadata = { title: "Point of Sale" };

export default async function PosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <PosClient />
    </>
  );
}
