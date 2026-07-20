"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Moon, Sun, User, X } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useLogoutMutation } from "@/redux/features/auth/authApi";
import { logout as logoutAction } from "@/redux/features/auth/authSlice";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/tours", label: "Tours" },
  { href: "/divisions", label: "Destinations" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, initialized } = useAppSelector((s) => s.auth);
  const [logoutMutation] = useLogoutMutation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the account dropdown on any outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close both menus on navigation. Adjusting state during render (rather than
  // in an effect) avoids the extra render pass with the menu still open.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
    setMenuOpen(false);
  }

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // The cookie clear is best-effort; the local session still ends.
    }
    dispatch(logoutAction());
    toast.success("Signed out");
    // replace, not push: signing out of a guarded page must not leave that page
    // in the history stack for the back button (or the next user) to return to.
    router.replace("/");
  };

  const dashboardHref =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
      ? "/admin"
      : user?.role === "GUIDE"
        ? "/guide"
        : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-muted",
                pathname.startsWith(link.href)
                  ? "text-primary"
                  : "text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {!initialized ? (
            <div className="h-10 w-24 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full border border-border p-1 pl-3 transition-shadow hover:shadow-md"
              >
                <Menu className="h-4 w-4" />
                {user.picture ? (
                  <Image
                    src={user.picture}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
                    <User className="h-4 w-4" />
                  </span>
                )}
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-card py-2 shadow-xl"
                >
                  <div className="border-b border-border px-4 pb-2">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    href={dashboardHref}
                    className="block px-4 py-2.5 text-sm hover:bg-muted"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/bookings"
                    className="block px-4 py-2.5 text-sm hover:bg-muted"
                  >
                    My bookings
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    className="block px-4 py-2.5 text-sm hover:bg-muted"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full border-t border-border px-4 py-2.5 text-left text-sm hover:bg-muted"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="rounded-full p-2 hover:bg-muted md:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <div className="mt-2 flex gap-2 border-t border-border pt-3">
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button className="w-full" size="sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // resolvedTheme is undefined during SSR and the first client render. Rather
  // than gate on a `mounted` flag (which needs a setState-in-effect), render
  // both icons and let the `dark` class on <html> pick one. That markup is
  // identical on server and client, so there's nothing to mismatch.
  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="rounded-full p-2.5 hover:bg-muted"
    >
      <Moon className="h-5 w-5 dark:hidden" />
      <Sun className="hidden h-5 w-5 dark:block" />
    </button>
  );
}
