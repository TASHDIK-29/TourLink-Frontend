"use client";

// Must be a client layout: AdminShell receives lucide icon components in its
// nav config, which cannot cross the RSC boundary as serialised props.

import { RoleGuard } from "@/components/auth/RoleGuard";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allow={["ADMIN", "SUPER_ADMIN"]}>
      <AdminShell>{children}</AdminShell>
    </RoleGuard>
  );
}
