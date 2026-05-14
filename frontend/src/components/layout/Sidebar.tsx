"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ScrollText,
  Globe,
  Archive,
  Settings2,
  PenLine,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/notes", label: "Notes", icon: ScrollText },
  { href: "/shared", label: "Shared", icon: Globe },
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/settings", label: "Settings", icon: Settings2 },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-52 shrink-0 flex-col border-r border-[#2a2a2a] bg-[#0e0e0e]">
      {/* Logo */}
      <div className="flex h-[60px] items-center gap-2.5 border-b border-[#2a2a2a] px-4">
        <div className="flex size-7 items-center justify-center rounded-lg border border-[#353434] bg-[#1c1b1b]">
          <PenLine className="size-3.5 text-[#e5e2e1]" strokeWidth={1.5} />
        </div>
        <span className="text-sm font-semibold tracking-tight text-[#e5e2e1]">
          Peblo Notes
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-3">
        <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[#444748]">
          Workspace
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
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
                  active ? "text-[#aec6ff]" : "text-[#444748] group-hover:text-[#8e9192]"
                )}
                strokeWidth={1.5}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-[#2a2a2a] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#353434] bg-[#2a2a2a] text-[11px] font-semibold text-[#c4c7c8]">
            JD
          </div>
          <div>
            <p className="text-xs font-medium text-[#c4c7c8]">John Doe</p>
            <p className="text-[10px] text-[#444748]">Free plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
