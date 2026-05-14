"use client";

import { RotateCcw } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { refresh, status, lastRefreshed } = useDashboard();
  const loading = status === "loading";

  return (
    <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-[#2a2a2a] bg-[#141313] px-6">
      <h1 className="text-[15px] font-semibold tracking-[-0.02em] text-[#e5e2e1]">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        {lastRefreshed && (
          <span className="text-[11px] text-[#444748]">
            {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}

        <button
          onClick={refresh}
          disabled={loading}
          className="flex size-7 items-center justify-center rounded-md border border-[#2a2a2a] bg-transparent text-[#8e9192] transition-colors hover:border-[#353434] hover:bg-[#1c1b1b] hover:text-[#c4c7c8] disabled:opacity-40"
          aria-label="Refresh"
        >
          <RotateCcw
            className={`size-3.5 ${loading ? "animate-spin" : ""}`}
            strokeWidth={1.5}
          />
        </button>

        <div className="flex size-7 cursor-pointer items-center justify-center rounded-full border border-[#353434] bg-[#2a2a2a] text-[11px] font-semibold text-[#c4c7c8] transition-colors hover:bg-[#353434]">
          JD
        </div>
      </div>
    </header>
  );
}
