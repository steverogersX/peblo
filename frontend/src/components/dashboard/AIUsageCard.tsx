"use client";

import { BrainCircuit, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/contexts/DashboardContext";

function UsageRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[#8e9192]">{label}</span>
        <span className="font-mono text-[#c4c7c8] tabular-nums">
          {value}
          <span className="text-[#444748]"> / {max}</span>
        </span>
      </div>
      <div className="relative h-[3px] overflow-hidden rounded-full bg-[#2a2a2a]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[#508eff] transition-all duration-700 ease-out"
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
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1c1b1b]">
      <div className="flex items-center gap-2 border-b border-[#2a2a2a] px-5 py-4">
        <BrainCircuit className="size-4 text-[#444748]" strokeWidth={1.5} />
        <span className="text-[13px] font-semibold tracking-[-0.01em] text-[#e5e2e1]">
          AI Usage
        </span>
      </div>

      <div className="px-5 py-5 space-y-5">
        {loading ? (
          <>
            <div className="space-y-1">
              <Skeleton className="h-8 w-12 bg-[#2a2a2a]" />
              <Skeleton className="h-3 w-36 bg-[#2a2a2a]" />
            </div>
            <Skeleton className="h-[3px] w-full rounded-full bg-[#2a2a2a]" />
            <Skeleton className="h-[3px] w-full rounded-full bg-[#2a2a2a]" />
          </>
        ) : (
          <>
            <div>
              <p className="text-3xl font-semibold tracking-[-0.04em] text-[#e5e2e1] tabular-nums">
                {insights?.aiUsage.totalRequests}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#8e9192]">
                <TrendingUp className="size-3 text-[#508eff]" strokeWidth={1.5} />
                <span>
                  <span className="text-[#aec6ff]">{insights?.aiUsage.thisWeek}</span> summaries this week
                </span>
              </div>
            </div>

            <UsageRow
              label="This week"
              value={insights?.aiUsage.thisWeek ?? 0}
              max={20}
            />
            <UsageRow
              label="This month"
              value={insights?.aiUsage.thisMonth ?? 0}
              max={100}
            />

            <div className="rounded-lg border border-[#2a2a2a] bg-[#141313] px-3.5 py-2.5">
              <p className="text-[11px] leading-relaxed text-[#8e9192]">
                AI summaries save ~3 min per note.{" "}
                <span className="text-[#aec6ff]">Upgrade for unlimited access.</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
