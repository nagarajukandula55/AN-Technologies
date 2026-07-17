import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { CampaignsClient } from "./campaigns-client";

export const metadata: Metadata = { title: "Email Campaigns" };

export default async function CampaignsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <CampaignsClient />
    </>
  );
}
