"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Luggage,
  Map,
  MapPin,
  Tags,
  UserCheck,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/layout/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useLogoutMutation } from "@/redux/features/auth/authApi";
import { logout as logoutAction } from "@/redux/features/auth/authSlice";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Bookings", icon: Luggage },
  { href: "/admin/tours", label: "Tours", icon: Map },
  { href: "/admin/divisions", label: "Divisions", icon: MapPin },
  { href: "/admin/tour-types", label: "Tour Types", icon: Tags },
  { href: "/admin/guides", label: "Guides", icon: UserCheck },
];

/**
 * The admin chrome is deliberately a different shape from the public site: a
 * persistent, collapsible sidebar (shadcn Sidebar) and a dense, utilitarian
 * layout rather than the marketing navbar.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Best-effort cookie clear; the local session ends regardless.
    }
    dispatch(logoutAction());
    toast.success("Signed out");
    router.push("/");
  };

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between gap-2">
            <Logo
              href="/admin"
              size="sm"
              className="min-w-0 group-data-[collapsible=icon]:hidden"
            />
            <SidebarTrigger />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Manage</SidebarGroupLabel>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="View public site">
                <Link href="/">
                  <ExternalLink />
                  <span className="group-data-[collapsible=icon]:hidden">
                    View public site
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Sign out">
                <LogOut />
                <span className="group-data-[collapsible=icon]:hidden">
                  Sign out
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <div className="rounded-lg bg-muted/60 px-3 py-2.5 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
            </p>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-card px-4 lg:hidden">
          <SidebarTrigger />
          <span className="font-semibold">Admin</span>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
