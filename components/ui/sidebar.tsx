"use client";

import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_ICON = "3.25rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const MOBILE_BREAKPOINT = 1024;

/**
 * A self-contained port of the shadcn Sidebar (no Radix / Base UI). Supports a
 * collapsible icon rail on desktop and an off-canvas drawer on mobile, toggled
 * by SidebarTrigger / SidebarRail or Ctrl/Cmd+B.
 */

type SidebarContextValue = {
  open: boolean;
  setOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  openMobile: boolean;
  setOpenMobile: (v: boolean | ((p: boolean) => boolean)) => void;
  isMobile: boolean;
  state: "expanded" | "collapsed";
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider.");
  return ctx;
}

// matchMedia via useSyncExternalStore — SSR-safe and no setState-in-effect.
function useIsMobile() {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false,
  );
}

export function SidebarProvider({
  children,
  defaultOpen = true,
  className,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(defaultOpen);
  const [openMobile, setOpenMobile] = useState(false);

  const toggleSidebar = useCallback(() => {
    if (isMobile) setOpenMobile((o) => !o);
    else setOpen((o) => !o);
  }, [isMobile]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (e.metaKey || e.ctrlKey)
      ) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleSidebar]);

  const state: "expanded" | "collapsed" = open ? "expanded" : "collapsed";

  const value = useMemo<SidebarContextValue>(
    () => ({
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      state,
      toggleSidebar,
    }),
    [open, openMobile, isMobile, state, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          } as React.CSSProperties
        }
        className={cn("flex min-h-svh w-full", className)}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <>
        {openMobile && (
          <button
            aria-label="Close sidebar"
            onClick={() => setOpenMobile(false)}
            className="fixed inset-0 z-40 bg-black/50"
          />
        )}
        <div
          style={{ width: SIDEBAR_WIDTH_MOBILE }}
          className={cn(
            "fixed inset-y-0 left-0 z-50 max-w-[85vw] transition-transform duration-200 ease-in-out",
            openMobile ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-full w-full flex-col border-r border-border bg-card">
            {children}
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className="group peer hidden text-foreground lg:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? "icon" : ""}
    >
      {/* In-flow spacer that reserves the sidebar's width and pushes the inset. */}
      <div className="relative h-svh w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear group-data-[collapsible=icon]:w-(--sidebar-width-icon)" />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex h-svh w-(--sidebar-width) transition-[width] duration-200 ease-linear group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
          className,
        )}
      >
        <div className="flex h-full w-full flex-col border-r border-border bg-card">
          {children}
        </div>
      </div>
    </div>
  );
}

export function SidebarInset({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-muted/30",
        className,
      )}
    >
      {children}
    </main>
  );
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      onClick={toggleSidebar}
      className={cn("rounded-lg p-2 hover:bg-muted", className)}
    >
      <PanelLeft className="h-5 w-5" />
    </button>
  );
}

export function SidebarRail() {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle sidebar (Ctrl/⌘ B)"
      className="absolute inset-y-0 right-0 z-20 hidden w-3 cursor-pointer transition-colors hover:bg-border/60 lg:block"
    />
  );
}

export function SidebarHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2 border-b border-border p-3", className)}>
      {children}
    </div>
  );
}

export function SidebarContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2 group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SidebarFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2 border-t border-border p-2", className)}>
      {children}
    </div>
  );
}

export function SidebarGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative flex w-full min-w-0 flex-col p-1", className)}>
      {children}
    </div>
  );
}

export function SidebarGroupLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-8 shrink-0 items-center px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SidebarMenu({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ul className={cn("flex w-full min-w-0 flex-col gap-1", className)}>
      {children}
    </ul>
  );
}

export function SidebarMenuItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <li className={cn("relative", className)}>{children}</li>;
}

const menuButtonClass = (isActive?: boolean) =>
  cn(
    "flex h-9 w-full items-center gap-2.5 overflow-hidden rounded-lg px-2.5 text-sm font-medium outline-none transition-colors",
    "focus-visible:ring-2 focus-visible:ring-ring [&>svg]:size-4 [&>svg]:shrink-0",
    "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!px-0",
    isActive
      ? "bg-primary/10 text-primary"
      : "text-foreground hover:bg-muted",
  );

type MenuButtonProps = {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function SidebarMenuButton({
  asChild,
  isActive,
  tooltip,
  className,
  onClick,
  children,
  ...props
}: MenuButtonProps) {
  const { isMobile, setOpenMobile } = useSidebar();

  // Tapping a menu item on mobile dismisses the drawer.
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isMobile) setOpenMobile(false);
    onClick?.(e);
  };

  const classes = cn(menuButtonClass(isActive), className);

  if (asChild && isValidElement(children)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const child = children as React.ReactElement<any>;
    return cloneElement(child, {
      className: cn(classes, child.props.className),
      title: tooltip,
      "data-active": isActive || undefined,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isMobile) setOpenMobile(false);
        child.props.onClick?.(e);
      },
    });
  }

  return (
    <button
      type="button"
      title={tooltip}
      data-active={isActive || undefined}
      onClick={handleClick}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}
