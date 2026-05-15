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
  ChevronLeft,
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/notes", label: "Notes", icon: ScrollText },
  { href: "/shared", label: "Shared", icon: Globe },
  { href: "/archive", label: "Archive", icon: Archive },
] as const;

function NavLink({
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
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href={href}
              className={cn(
                "mb-px flex size-8 items-center justify-center rounded-md transition-colors",
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            />
          }
        >
          <Icon className="size-[17px]" strokeWidth={1.5} />
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-2 rounded-md px-2 py-[5px] mb-px",
        "text-[13px] font-medium transition-colors duration-100",
        active
          ? "bg-sidebar-accent text-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-blue" />
      )}
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

  const settingsActive = pathname.startsWith("/settings");

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
        {/* Workspace header */}
        <div
          className={cn(
            "flex h-[48px] shrink-0 items-center",
            collapsed ? "justify-center px-1.5" : "justify-between px-3"
          )}
        >
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-sidebar-accent",
              collapsed && "size-8 justify-center p-0"
            )}
          >
            <div className="flex size-5 shrink-0 items-center justify-center rounded bg-foreground">
              <PenLine className="size-3 text-background" strokeWidth={2} />
            </div>
            {!collapsed && (
              <span className="text-[14px] font-semibold tracking-[-0.01em] text-foreground">
                Peblo
              </span>
            )}
          </Link>

          {!collapsed && (
            <button
              onClick={toggle}
              aria-label="Collapse sidebar"
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <ChevronLeft className="size-3.5" />
            </button>
          )}
        </div>

        {/* New Note CTA */}
        <div className={cn("px-2 pb-2", collapsed && "flex justify-center px-1.5")}>
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
                <Plus className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                New note
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/notes")}
              className="w-full justify-start gap-2 border-sidebar-border bg-transparent text-[13px] font-medium text-muted-foreground shadow-none hover:bg-sidebar-accent hover:text-foreground"
            >
              <Plus className="size-3.5" />
              New note
            </Button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-2 py-1">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <NavLink
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

        {/* Settings + User footer */}
        <div className={cn("shrink-0 px-2 pb-2", collapsed && "flex flex-col items-center px-1.5")}>
          <Separator className="mb-2 bg-sidebar-border" />

          {/* Settings */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href="/settings"
                    className={cn(
                      "mb-1 flex size-8 items-center justify-center rounded-md transition-colors",
                      settingsActive
                        ? "bg-sidebar-accent text-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                    )}
                  />
                }
              >
                <Settings2 className="size-[17px]" strokeWidth={1.5} />
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Settings
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/settings"
              className={cn(
                "relative flex items-center gap-2 rounded-md px-2 py-[5px] mb-1",
                "text-[13px] font-medium transition-colors duration-100",
                settingsActive
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              {settingsActive && (
                <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-blue" />
              )}
              <Settings2 className="size-[17px] shrink-0" strokeWidth={1.5} />
              Settings
            </Link>
          )}

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
                <p className="opacity-60">Free plan · click to expand</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-sidebar-accent group outline-none">
                <Avatar size="sm" className="shrink-0 border border-border-strong">
                  <AvatarFallback className="bg-accent text-[10px] font-semibold text-subtle">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-[13px] font-medium text-foreground">{displayName}</p>
                  <p className="text-[11px] text-muted-foreground">Free plan</p>
                </div>
                <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-52 mb-1">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-[13px] font-medium text-foreground truncate">{displayName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{email}</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-[13px] text-destructive focus:text-destructive gap-2 cursor-pointer"
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
