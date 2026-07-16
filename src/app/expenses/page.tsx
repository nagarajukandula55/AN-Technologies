import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { ExpensesClient } from "./expenses-client";

export const metadata: Metadata = {
  title: "Expense Tracker",
};

export default async function ExpensesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <ExpensesClient />
    </>
  );
}
