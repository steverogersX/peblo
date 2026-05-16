"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BarChart3,
  ScrollText,
  Globe,
  Archive,
  Settings2,
  PenLine,
  ChevronRight,
  Plus,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/notes", label: "Notes", icon: ScrollText },
  { href: "/shared", label: "Shared", icon: Globe },
  { href: "/archive", label: "Archive", icon: Archive },
] as const;

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  collapsed: boolean;
}) {
  const itemCls = cn(
    "flex items-center rounded-md text-[13px] transition-colors duration-100 select-none",
    active
      ? "bg-sidebar-accent text-foreground font-medium"
      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground/90"
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Link href={href} className={cn(itemCls, "mb-px size-8 justify-center")} />
          }
        >
          <Icon className="size-[17px]" strokeWidth={1.5} />
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>{label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link href={href} className={cn(itemCls, "mb-px gap-2.5 px-2 py-[5px]")}>
      <Icon className="size-[17px] shrink-0" strokeWidth={1.5} />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const displayName = user?.name ?? "User";
  const email = user?.email ?? "";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <TooltipProvider delay={400}>
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col",
          "border-r border-sidebar-border bg-sidebar",
          "transition-[width] duration-200 ease-in-out",
          collapsed ? "w-[52px]" : "w-[220px]"
        )}
      >
        {/* ── Workspace header ── */}
        <div
          className={cn(
            "flex h-[52px] shrink-0 items-center",
            collapsed ? "justify-center px-1.5" : "justify-between px-2.5"
          )}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={toggle}
                    aria-label="Expand sidebar"
                    className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-sidebar-accent"
                  />
                }
              >
                <div className="flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-foreground shadow-sm">
                  <PenLine className="size-3 text-background" strokeWidth={2} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>Expand</TooltipContent>
            </Tooltip>
          ) : (
            <>
              <div className="flex min-w-0 items-center gap-2.5 px-1">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-foreground shadow-sm">
                  <PenLine className="size-3 text-background" strokeWidth={2} />
                </div>
                <span className="truncate text-[14px] font-semibold tracking-[-0.01em] text-foreground">
                  Peblo
                </span>
              </div>
              <button
                onClick={toggle}
                aria-label="Collapse sidebar"
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-foreground"
              >
                <ChevronRight className="size-3.5 rotate-180" />
              </button>
            </>
          )}
        </div>

        {/* ── New note ── */}
        <div className={cn("px-2 pb-1.5", collapsed && "flex justify-center px-1.5")}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={() => router.push("/notes")}
                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
                  />
                }
              >
                <Plus className="size-4" strokeWidth={1.75} />
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>New note</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => router.push("/notes")}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2 py-[5px]",
                "text-[13px] text-muted-foreground transition-colors duration-100",
                "hover:bg-sidebar-accent/60 hover:text-foreground/90"
              )}
            >
              <Plus className="size-[17px] shrink-0" strokeWidth={1.75} />
              New note
            </button>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-2 py-1">
          {!collapsed && (
            <p className="mb-1 px-2 text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground/40 select-none">
              Workspace
            </p>
          )}
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <NavItem
                key={href}
                href={href}
                label={label}
                icon={icon}
                active={active}
                collapsed={collapsed}
              />
            );
          })}
        </nav>

        {/* ── Footer: settings + user ── */}
        <div
          className={cn(
            "shrink-0 border-t border-sidebar-border px-2 py-2",
            collapsed && "flex flex-col items-center px-1.5"
          )}
        >
          {/* User row */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={toggle}
                    aria-label="Expand sidebar"
                    className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-sidebar-accent"
                  />
                }
              >
                <Avatar size="sm">
                  <AvatarFallback className="bg-accent text-[10px] font-semibold text-subtle">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <p className="font-medium">{displayName}</p>
                <p className="opacity-60">click to expand</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 outline-none transition-colors hover:bg-sidebar-accent">
                <Avatar size="sm" className="shrink-0">
                  <AvatarFallback className="bg-accent text-[10px] font-semibold text-subtle">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-[13px] font-medium text-foreground">{displayName}</p>
                </div>
                <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="mb-1 w-52">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <p className="truncate text-[13px] font-medium text-foreground">{displayName}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{email}</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                    className="cursor-pointer gap-2 text-[13px]"
                  >
                    <Settings2 className="size-3.5" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer gap-2 text-[13px] text-destructive focus:text-destructive"
                  >
                    <LogOut className="size-3.5" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
