import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { ComplaintsClient } from "./complaints-client";

export const metadata: Metadata = { title: "Complaint Management" };

export default async function ComplaintsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <ComplaintsClient />
    </>
  );
}
