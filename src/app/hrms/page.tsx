import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { HrmsClient } from "./hrms-client";

export const metadata: Metadata = { title: "HRMS — Employees" };

export default async function HrmsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <HrmsClient />
    </>
  );
}
