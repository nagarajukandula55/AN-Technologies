import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { TeamClient } from "./team-client";

export const metadata: Metadata = { title: "Team Management" };

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <TeamClient />
    </>
  );
}
