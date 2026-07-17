import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { BookingsClient } from "./bookings-client";

export const metadata: Metadata = { title: "Booking System" };

export default async function BookingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <Nav />
      <BookingsClient />
    </>
  );
}
