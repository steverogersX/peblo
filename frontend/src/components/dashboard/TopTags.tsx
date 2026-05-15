"use client";

import { useRouter } from "next/navigation";
import { Hash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/contexts/DashboardContext";
import { useNotes } from "@/contexts/NotesContext";
import { useTagColors } from "@/contexts/TagColorContext";

export function TopTags() {
  const router = useRouter();
  const { insights, status } = useDashboard();
  const { toggleFilterTag } = useNotes();
  const { getTagStyle } = useTagColors();
  const loading = status === "loading" || status === "idle";
  const maxCount = insights?.mostUsedTags[0]?.count ?? 1;

  function openTag(tag: string) {
    toggleFilterTag(tag);
    router.push("/notes");
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Hash className="size-4 text-muted-foreground" strokeWidth={1.5} />
        <span className="text-[14px] font-semibold text-foreground">Top tags</span>
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
          : insights?.mostUsedTags.length === 0
          ? (
            <p className="px-5 py-6 text-center text-[13px] text-muted-foreground">
              No tags used yet.
            </p>
          )
          : insights?.mostUsedTags.map((item, idx, arr) => {
              const pct = Math.round((item.count / maxCount) * 100);
              const tagStyle = getTagStyle(item.tag);
              return (
                <button
                  key={item.tag}
                  onClick={() => openTag(item.tag)}
                  className={`group flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-accent/60 ${idx < arr.length - 1 ? "border-b border-border" : ""}`}
                >
                  <span
                    className="w-20 shrink-0 rounded px-2 py-0.5 text-[12px] font-medium truncate text-left"
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
                </button>
              );
            })}
      </div>
    </div>
  );
}
