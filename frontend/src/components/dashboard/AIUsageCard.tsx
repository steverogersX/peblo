"use client";

import { BrainCircuit, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/contexts/DashboardContext";

function UsageBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums text-foreground/70">
          {value}<span className="text-muted-foreground"> / {max}</span>
        </span>
      </div>
      <div className="relative h-[3px] overflow-hidden rounded-full bg-accent">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-blue transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function AIUsageCard() {
  const { insights, status } = useDashboard();
  const loading = status === "loading" || status === "idle";

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <BrainCircuit className="size-4 text-muted-foreground" strokeWidth={1.5} />
        <span className="text-[14px] font-semibold text-foreground">AI usage</span>
      </div>

      <div className="space-y-5 px-5 py-5">
        {loading ? (
          <>
            <div className="space-y-1.5">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-3.5 w-40" />
            </div>
            <Skeleton className="h-[3px] w-full rounded-full" />
            <Skeleton className="h-[3px] w-full rounded-full" />
          </>
        ) : (
          <>
            <div>
              <p className="text-[32px] font-bold tracking-[-0.04em] text-foreground tabular-nums leading-none">
                {insights?.aiUsage.totalRequests}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <TrendingUp className="size-3.5 text-blue" strokeWidth={1.5} />
                <span>
                  <span className="font-medium text-foreground">{insights?.aiUsage.thisWeek}</span> summaries this week
                </span>
              </div>
            </div>

            <UsageBar label="This week" value={insights?.aiUsage.thisWeek ?? 0} max={20} />
            <UsageBar label="This month" value={insights?.aiUsage.thisMonth ?? 0} max={100} />

            <div className="rounded-md bg-accent px-4 py-3">
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                AI summaries save ~3 min per note.{" "}
                <span className="font-medium text-blue cursor-pointer hover:underline">Upgrade for unlimited.</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
