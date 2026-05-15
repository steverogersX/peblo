"use client";

import { Hash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/contexts/DashboardContext";
import { getTagStyle } from "@/lib/tag-colors";

export function TopTags() {
  const { insights, status } = useDashboard();
  const loading = status === "loading" || status === "idle";
  const maxCount = insights?.mostUsedTags[0]?.count ?? 1;

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Hash className="size-4 text-muted-foreground" strokeWidth={1.5} />
        <span className="text-[14px] font-semibold text-foreground">
          Top tags
        </span>
      </div>

      <div>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-b-0">
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-1.5 flex-1 rounded-full" />
                <Skeleton className="h-3.5 w-4" />
              </div>
            ))
          : insights?.mostUsedTags.map((item, idx, arr) => {
              const pct = Math.round((item.count / maxCount) * 100);
              const tagStyle = getTagStyle(item.tag);
              return (
                <div
                  key={item.tag}
                  className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-accent/60 ${idx < arr.length - 1 ? "border-b border-border" : ""}`}
                >
                  <span
                    className="w-20 shrink-0 rounded px-2 py-0.5 text-[12px] font-medium truncate"
                    style={tagStyle}
                  >
                    {item.tag}
                  </span>
                  <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-accent">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%`, backgroundColor: tagStyle.color }}
                    />
                  </div>
                  <span className="w-5 text-right text-[12px] text-muted-foreground tabular-nums">
                    {item.count}
                  </span>
                </div>
              );
            })}
      </div>
    </div>
  );
}
