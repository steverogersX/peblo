"use client";

import { Hash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/contexts/DashboardContext";

export function TopTags() {
  const { insights, status } = useDashboard();
  const loading = status === "loading" || status === "idle";
  const maxCount = insights?.mostUsedTags[0]?.count ?? 1;

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1c1b1b]">
      <div className="flex items-center gap-2 border-b border-[#2a2a2a] px-5 py-4">
        <Hash className="size-4 text-[#444748]" strokeWidth={1.5} />
        <span className="text-[13px] font-semibold tracking-[-0.01em] text-[#e5e2e1]">
          Top Tags
        </span>
      </div>

      <div className="space-y-0">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-3 border-b border-[#2a2a2a] last:border-b-0"
              >
                <Skeleton className="h-5 w-16 rounded bg-[#2a2a2a]" />
                <Skeleton className="h-1 flex-1 rounded-full bg-[#2a2a2a]" />
                <Skeleton className="h-3.5 w-4 bg-[#2a2a2a]" />
              </div>
            ))
          : insights?.mostUsedTags.map((item, idx, arr) => {
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div
                  key={item.tag}
                  className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[#201f1f] ${idx < arr.length - 1 ? "border-b border-[#2a2a2a]" : ""}`}
                >
                  <span className="inline-flex h-5 w-16 shrink-0 items-center justify-center rounded border border-[#353434] bg-[#2a2a2a] text-[10px] font-medium uppercase tracking-[0.04em] text-[#8e9192]">
                    {item.tag}
                  </span>
                  <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-[#2a2a2a]">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-[#508eff] transition-all duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-4 text-right font-mono text-[11px] text-[#8e9192] tabular-nums">
                    {item.count}
                  </span>
                </div>
              );
            })}
      </div>
    </div>
  );
}
