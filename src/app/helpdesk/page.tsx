import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { HelpdeskClient } from "./helpdesk-client";

export const metadata: Metadata = { title: "Helpdesk" };

export default async function HelpdeskPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <HelpdeskClient />
    </>
  );
}
