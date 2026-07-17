import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { SurveysClient } from "./surveys-client";

export const metadata: Metadata = { title: "Surveys & Feedback" };

export default async function SurveysPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <SurveysClient />
    </>
  );
}
