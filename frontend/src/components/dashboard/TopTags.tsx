"use client";

import { useRouter } from "next/navigation";
import { Tags } from "lucide-react";
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
        <Tags className="size-4 text-muted-foreground" strokeWidth={1.5} />
        <span className="text-[14px] font-semibold text-foreground">Top tags</span>
      </div>

      <div className="px-5 py-3">
        {loading ? (
          <div className="space-y-4 py-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-[5px] flex-1 rounded-full" />
                <Skeleton className="h-4 w-5 rounded" />
              </div>
            ))}
          </div>
        ) : insights?.mostUsedTags.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-muted-foreground">No tags used yet.</p>
        ) : (
          <div className="space-y-1">
            {insights?.mostUsedTags.map((item, idx) => {
              const pct = Math.round((item.count / maxCount) * 100);
              const tagStyle = getTagStyle(item.tag);
              return (
                <button
                  key={item.tag}
                  onClick={() => openTag(item.tag)}
                  className="group flex w-full items-center gap-3 rounded-md px-1 py-2.5 text-left transition-colors hover:bg-accent/60"
                >
                  <span className="w-4 shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground">
                    {idx + 1}
                  </span>
                  <span
                    className="w-[72px] shrink-0 truncate rounded-full px-2.5 py-0.5 text-[11px] font-medium text-left"
                    style={tagStyle}
                  >
                    {item.tag}
                  </span>
                  <div className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-accent">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%`, backgroundColor: tagStyle.color }}
                    />
                  </div>
                  <span className="w-5 shrink-0 text-right text-[12px] tabular-nums text-muted-foreground">
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
