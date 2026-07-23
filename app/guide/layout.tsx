"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * Guides keep the public chrome, like the customer dashboard — the marketing
 * navbar routes GUIDE accounts here (see Navbar `dashboardHref`).
 */
export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allow={["GUIDE"]}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </RoleGuard>
  );
}
