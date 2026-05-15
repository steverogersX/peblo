"use client";

import { RotateCcw } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { refresh, status, lastRefreshed } = useDashboard();
  const loading = status === "loading";

  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <h1 className="text-[15px] font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-2">
        {lastRefreshed && (
          <span className="text-[12px] text-muted-foreground">
            Updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh"
        >
          <RotateCcw className={`size-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
        </Button>

        <Avatar size="sm">
          <AvatarFallback className="text-[11px] font-semibold bg-accent text-subtle">
            JD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
