import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { AssetsClient } from "./assets-client";

export const metadata: Metadata = { title: "Asset Management" };

export default async function AssetsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <AssetsClient />
    </>
  );
}
