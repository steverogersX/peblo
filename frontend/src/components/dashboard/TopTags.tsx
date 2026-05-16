"use client";

import { useRouter } from "next/navigation";
import { Hash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/contexts/DashboardContext";
import { useNotes } from "@/contexts/NotesContext";
import { useTagColors } from "@/contexts/TagColorContext";

function TagRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Skeleton className="size-2 shrink-0 rounded-full" />
      <Skeleton className="h-3.5 w-20 rounded" />
      <Skeleton className="h-1 flex-1 rounded-full" />
      <Skeleton className="h-3.5 w-6 rounded" />
    </div>
  );
}

export function TopTags() {
  const router = useRouter();
  const { insights, status } = useDashboard();
  const { toggleFilterTag } = useNotes();
  const { getTagStyle } = useTagColors();
  const loading = status === "loading" || status === "idle";
  const tags = insights?.mostUsedTags ?? [];
  const maxCount = tags[0]?.count ?? 1;

  function openTag(tag: string) {
    toggleFilterTag(tag);
    router.push("/notes");
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4">
        <div className="flex size-7 items-center justify-center rounded-lg bg-accent/60">
          <Hash className="size-3.5 text-muted-foreground/60" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-foreground">Most-used tags</p>
          <p className="text-[11.5px] text-muted-foreground/45">By note count</p>
        </div>
      </div>

      <div className="h-px w-full bg-border/40" />

      <div className="px-2 py-2">
        {loading ? (
          <div className="space-y-0.5">
            {Array.from({ length: 5 }).map((_, i) => <TagRowSkeleton key={i} />)}
          </div>
        ) : tags.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-[13px] text-muted-foreground/50">No tags used yet.</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {tags.map((item) => {
              const pct = Math.round((item.count / maxCount) * 100);
              const style = getTagStyle(item.tag);
              return (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => openTag(item.tag)}
                  className="group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent/40"
                >
                  {/* Color dot */}
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: style.color }}
                  />

                  {/* Tag name */}
                  <span className="min-w-0 flex-1 truncate text-[13px] text-foreground/70 transition-colors group-hover:text-foreground">
                    {item.tag}
                  </span>

                  {/* Bar track */}
                  <div className="w-16 shrink-0">
                    <div className="relative h-[3px] overflow-hidden rounded-full bg-accent/70">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: style.color,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>

                  {/* Count */}
                  <span className="w-6 shrink-0 text-right text-[12px] tabular-nums text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/70">
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
