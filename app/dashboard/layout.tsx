"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * Customers keep the public chrome — unlike /admin, which swaps in a sidebar
 * shell. A traveller checking their bookings is still browsing the site.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allow={["USER", "GUIDE", "ADMIN", "SUPER_ADMIN"]}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </RoleGuard>
  );
}
