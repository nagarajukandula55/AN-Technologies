import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { AppointmentsClient } from "./appointments-client";

export const metadata: Metadata = { title: "Appointment Booking" };

export default async function AppointmentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <AppointmentsClient />
    </>
  );
}
