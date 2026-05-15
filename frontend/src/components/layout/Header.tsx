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
    <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <h1 className="text-[15px] font-semibold text-foreground">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        {lastRefreshed && (
          <span className="text-[12px] text-muted-foreground">
            {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        <button
          onClick={refresh}
          disabled={loading}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
          aria-label="Refresh"
        >
          <RotateCcw className={`size-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
        </button>
        <div className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-subtle transition-colors hover:bg-border-strong">
          JD
        </div>
      </div>
    </header>
  );
}
