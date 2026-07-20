import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { SITE_NAME } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Logo size="sm" />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Discover and book unforgettable tours across Bangladesh.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Explore</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/tours" className="hover:text-foreground">
                  All tours
                </Link>
              </li>
              <li>
                <Link href="/divisions" className="hover:text-foreground">
                  Destinations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-foreground">
                  Sign up
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
