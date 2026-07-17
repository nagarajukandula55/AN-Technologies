import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { SubscriptionsClient } from "./subscriptions-client";

export const metadata: Metadata = { title: "Subscription Plans" };

export default async function SubscriptionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <SubscriptionsClient />
    </>
  );
}
