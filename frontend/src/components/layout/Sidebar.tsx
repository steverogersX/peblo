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
  ChevronsLeft,
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
    <TooltipProvider delay={200}>
      <aside
        className={cn(
          "group/sidebar relative flex h-full shrink-0 flex-col",
          "border-r border-[#2a2a2a] bg-[#0e0e0e]",
          "transition-[width] duration-200 ease-in-out",
          collapsed ? "w-[56px]" : "w-52"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-[60px] shrink-0 items-center border-b border-[#2a2a2a]",
            collapsed ? "justify-center px-0" : "justify-between pl-4 pr-2"
          )}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-[#353434] bg-[#1c1b1b]">
              <PenLine className="size-3.5 text-[#e5e2e1]" strokeWidth={1.5} />
            </div>
            <span
              className={cn(
                "whitespace-nowrap text-sm font-semibold tracking-tight text-[#e5e2e1]",
                "transition-[opacity,max-width] duration-200 ease-in-out",
                collapsed ? "max-w-0 opacity-0" : "max-w-[120px] opacity-100"
              )}
            >
              Peblo Notes
            </span>
          </div>

          {!collapsed && (
            <button
              onClick={toggle}
              aria-label="Collapse sidebar"
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-md",
                "text-[#444748] transition-all duration-150",
                "opacity-0 group-hover/sidebar:opacity-100",
                "hover:bg-[#1c1b1b] hover:text-[#8e9192]"
              )}
            >
              <ChevronsLeft className="size-3.5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-3">
          <div className={cn("flex flex-col", collapsed ? "items-center px-0" : "px-2")}>
            <p
              className={cn(
                "mb-2 text-[10px] font-medium uppercase tracking-[0.08em] text-[#444748]",
                "transition-[opacity,max-height] duration-200",
                collapsed
                  ? "max-h-0 overflow-hidden opacity-0"
                  : "max-h-8 px-3 opacity-100"
              )}
            >
              Workspace
            </p>

            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);

              if (collapsed) {
                return (
                  <Tooltip key={href}>
                    <TooltipTrigger
                      // base-ui v1: render prop merges event handlers onto the Link
                      render={
                        <Link
                          href={href}
                          className={cn(
                            "group/link relative mb-0.5 flex size-9 items-center justify-center",
                            "rounded-md transition-colors duration-150",
                            active
                              ? "bg-[#1c1b1b] text-[#e5e2e1]"
                              : "text-[#8e9192] hover:bg-[#1c1b1b] hover:text-[#c4c7c8]"
                          )}
                        />
                      }
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[#508eff]" />
                      )}
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active
                            ? "text-[#aec6ff]"
                            : "text-[#444748] group-hover/link:text-[#8e9192]"
                        )}
                        strokeWidth={1.5}
                      />
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
                    "group/link relative mb-0.5 flex items-center gap-2.5 rounded-md px-3 py-2",
                    "text-[13px] font-medium transition-colors duration-150",
                    active
                      ? "bg-[#1c1b1b] text-[#e5e2e1]"
                      : "text-[#8e9192] hover:bg-[#1c1b1b] hover:text-[#c4c7c8]"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[#508eff]" />
                  )}
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      active
                        ? "text-[#aec6ff]"
                        : "text-[#444748] group-hover/link:text-[#8e9192]"
                    )}
                    strokeWidth={1.5}
                  />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User footer */}
        <div
          className={cn(
            "shrink-0 border-t border-[#2a2a2a] py-3",
            collapsed ? "flex justify-center px-0" : "px-4"
          )}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={toggle}
                    aria-label="Expand sidebar"
                    className="flex size-7 items-center justify-center rounded-full border border-[#353434] bg-[#2a2a2a] text-[11px] font-semibold text-[#c4c7c8] transition-colors hover:border-[#508eff]/40 hover:bg-[#1c1b1b]"
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
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#353434] bg-[#2a2a2a] text-[11px] font-semibold text-[#c4c7c8]">
                JD
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-xs font-medium text-[#c4c7c8]">
                  John Doe
                </p>
                <p className="text-[10px] text-[#444748]">Free plan</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
