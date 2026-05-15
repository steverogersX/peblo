"use client";

import { Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/contexts/DashboardContext";

const WEEKLY_LIMIT = 20;
const MONTHLY_LIMIT = 100;

function UsageRow({ label, value, limit }: { label: string; value: number; limit: number }) {
  const pct = limit > 0 ? Math.min(Math.round((value / limit) * 100), 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground">{label}</span>
        <span className="text-[12px] tabular-nums text-foreground">
          {value}
          <span className="text-muted-foreground"> / {limit}</span>
        </span>
      </div>
      <div className="relative h-[5px] overflow-hidden rounded-full bg-accent">
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
  const total = insights?.aiUsage.totalRequests ?? 0;
  const thisWeek = insights?.aiUsage.thisWeek ?? 0;
  const thisMonth = insights?.aiUsage.thisMonth ?? 0;

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Bot className="size-4 text-muted-foreground" strokeWidth={1.5} />
        <span className="text-[14px] font-semibold text-foreground">AI usage</span>
      </div>

      <div className="px-5 py-5">
        {loading ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Skeleton className="h-8 w-14" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-[5px] w-full rounded-full" />
              <Skeleton className="h-[5px] w-full rounded-full" />
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-[32px] font-bold tracking-[-0.04em] text-foreground tabular-nums leading-none">
                {total}
              </p>
              <p className="mt-1.5 text-[13px] text-muted-foreground">
                {total === 0 ? (
                  "No AI requests yet"
                ) : (
                  <>
                    <span className="font-medium text-foreground">{thisWeek}</span> this week
                  </>
                )}
              </p>
            </div>

            <div className="space-y-3.5">
              <UsageRow label="Weekly" value={thisWeek} limit={WEEKLY_LIMIT} />
              <UsageRow label="Monthly" value={thisMonth} limit={MONTHLY_LIMIT} />
            </div>

            <div className="flex items-center justify-between rounded-md bg-accent px-3.5 py-3">
              <p className="text-[12px] text-muted-foreground">
                {MONTHLY_LIMIT - thisMonth} requests left this month
              </p>
              <button className="shrink-0 rounded px-2 py-1 text-[11px] font-semibold text-blue transition-colors hover:bg-blue/10">
                Upgrade
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
