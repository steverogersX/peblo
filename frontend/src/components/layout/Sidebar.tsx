"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BarChart3,
  ScrollText,
  Globe,
  Archive,
  Settings2,
  PenLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/notes", label: "Notes", icon: ScrollText },
  { href: "/shared", label: "Shared", icon: Globe },
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/settings", label: "Settings", icon: Settings2 },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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
        {/* Workspace header */}
        <div
          className={cn(
            "flex h-[48px] shrink-0 items-center",
            collapsed ? "justify-center" : "px-3"
          )}
        >
          <button
            onClick={toggle}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-sidebar-accent",
              "text-foreground",
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
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-2 py-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);

            if (collapsed) {
              return (
                <Tooltip key={href}>
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
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-[5px] mb-px",
                  "text-[14px] font-medium transition-colors duration-100",
                  active
                    ? "bg-sidebar-accent text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                <Icon className="size-[17px] shrink-0" strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div
          className={cn(
            "shrink-0 border-t border-sidebar-border px-2 py-2",
            collapsed && "flex justify-center"
          )}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={toggle}
                    aria-label="Expand sidebar"
                    className="flex size-7 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-subtle transition-colors hover:bg-border-strong"
                  />
                }
              >
                JD
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <p className="font-medium">John Doe</p>
                <p className="opacity-60">Free plan · click to expand</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <button className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-sidebar-accent">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border-strong bg-accent text-[10px] font-semibold text-subtle">
                JD
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-[13px] font-medium text-foreground">John Doe</p>
                <p className="text-[11px] text-muted-foreground">Free plan</p>
              </div>
            </button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
