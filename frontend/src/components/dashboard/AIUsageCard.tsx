"use client";

import { Sparkles, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";

const WEEKLY_LIMIT  = 20;
const MONTHLY_LIMIT = 100;

const BLUE   = "#508eff";
const VIOLET = "#a78bfa";

function UsageBar({
  label,
  value,
  limit,
  color,
}: {
  label: string;
  value: number;
  limit: number;
  color: string;
}) {
  const pct = limit > 0 ? Math.min((value / limit) * 100, 100) : 0;
  const isHigh = pct >= 80;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground/60">{label}</span>
        <span className="text-[12px] tabular-nums">
          <span className="font-semibold text-foreground">{value}</span>
          <span className="text-muted-foreground/40"> / {limit}</span>
        </span>
      </div>
      <div className="relative h-[6px] overflow-hidden rounded-full bg-accent/60">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: isHigh
              ? `linear-gradient(90deg, ${color}, #f59e0b)`
              : `linear-gradient(90deg, ${color}99, ${color})`,
          }}
        />
      </div>
    </div>
  );
}

export function AIUsageCard() {
  const { insights, status } = useDashboard();
  const loading = status === "loading" || status === "idle";

  const total     = insights?.aiUsage.totalRequests ?? 0;
  const thisWeek  = insights?.aiUsage.thisWeek      ?? 0;
  const thisMonth = insights?.aiUsage.thisMonth     ?? 0;
  const remaining = MONTHLY_LIMIT - thisMonth;
  const monthPct  = Math.min(Math.round((thisMonth / MONTHLY_LIMIT) * 100), 100);

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4">
        <div className="flex size-7 items-center justify-center rounded-lg" style={{ background: `${BLUE}1a` }}>
          <Sparkles className="size-3.5" style={{ color: BLUE }} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-foreground">AI usage</p>
          <p className="text-[11.5px] text-muted-foreground/45">Summarize requests</p>
        </div>
      </div>

      <div className="h-px w-full bg-border/40" />

      <div className="px-5 py-4">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <Skeleton className="h-10 w-14" />
              <Skeleton className="mb-1 h-4 w-28" />
            </div>
            <Skeleton className="h-6 w-full rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-[6px] w-full rounded-full" />
              <Skeleton className="h-[6px] w-full rounded-full" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Big total + this week callout */}
            <div className="flex items-end gap-3">
              <p
                className="text-[38px] font-bold leading-none tracking-[-0.045em] tabular-nums"
                style={{ color: BLUE }}
              >
                {total}
              </p>
              <p className="mb-1 text-[13px] text-muted-foreground/55">
                {total === 0 ? "requests total" : (
                  <>
                    total ·{" "}
                    <span className="font-medium text-foreground/70">{thisWeek}</span> this week
                  </>
                )}
              </p>
            </div>

            {/* Monthly arc-style indicator */}
            <div className="relative overflow-hidden rounded-lg bg-accent/40 px-3.5 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-foreground/60">Monthly</span>
                <span className="text-[12px] tabular-nums">
                  <span className="font-semibold text-foreground">{thisMonth}</span>
                  <span className="text-muted-foreground/40"> / {MONTHLY_LIMIT}</span>
                </span>
              </div>
              <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-accent">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${monthPct}%`,
                    background: monthPct >= 80
                      ? "linear-gradient(90deg, #508eff, #f59e0b)"
                      : `linear-gradient(90deg, ${BLUE}88, ${BLUE})`,
                  }}
                />
              </div>
            </div>

            {/* Weekly bar */}
            <UsageBar label="This week" value={thisWeek} limit={WEEKLY_LIMIT} color={VIOLET} />

            {/* Remaining */}
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-3",
                remaining <= 10 ? "bg-amber-500/8" : "bg-accent/40"
              )}
            >
              <Zap
                className="size-3.5 shrink-0"
                style={{ color: remaining <= 10 ? "#f59e0b" : BLUE }}
                strokeWidth={1.5}
              />
              <p className={cn(
                "text-[12px]",
                remaining <= 10 ? "text-amber-400/80" : "text-muted-foreground/55"
              )}>
                {remaining} requests left this month
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
