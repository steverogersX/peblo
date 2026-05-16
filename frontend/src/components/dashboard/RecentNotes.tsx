"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/contexts/DashboardContext";
import { useNotes } from "@/contexts/NotesContext";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function NoteRowSkeleton() {
  return (
    <div className="flex items-center gap-3.5 border-b border-border/30 px-5 py-3.5 last:border-b-0">
      <Skeleton className="size-7 shrink-0 rounded-lg" />
      <Skeleton className="h-3.5 flex-1" />
      <Skeleton className="h-3 w-10 shrink-0" />
    </div>
  );
}

export function RecentNotes() {
  const router = useRouter();
  const { insights, status } = useDashboard();
  const { selectNote } = useNotes();
  const loading = status === "loading" || status === "idle";
  const notes = insights?.recentlyEditedNotes ?? [];

  function openNote(id: string) {
    selectNote(id);
    router.push("/notes");
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-[14px] font-semibold text-foreground">Recently edited</p>
          <p className="text-[11.5px] text-muted-foreground/45">Jump back in</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/notes")}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-muted-foreground/50 transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          View all
          <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="h-px w-full bg-border/40" />

      {/* Rows */}
      <div>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <NoteRowSkeleton key={i} />)
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-5 py-10">
            <div className="flex size-10 items-center justify-center rounded-xl bg-accent/50">
              <FileText className="size-5 text-muted-foreground/40" strokeWidth={1.5} />
            </div>
            <p className="text-[13px] text-muted-foreground/60">No notes yet</p>
            <button
              type="button"
              onClick={() => router.push("/notes")}
              className="rounded-md px-3 py-1.5 text-[12.5px] font-medium text-blue transition-colors hover:bg-blue/8"
            >
              Create your first note
            </button>
          </div>
        ) : (
          notes.map((note, idx) => (
            <button
              key={note.id}
              type="button"
              onClick={() => openNote(note.id)}
              className="group flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors hover:bg-accent/40 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-border/30"
            >
              {/* Icon */}
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent/60 transition-colors group-hover:bg-accent">
                <FileText className="size-3.5 text-muted-foreground/50" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <p className="min-w-0 flex-1 truncate text-[13.5px] text-foreground/75 transition-colors group-hover:text-foreground">
                {note.title || "Untitled"}
              </p>

              {/* Time + arrow */}
              <span className="shrink-0 text-[11.5px] tabular-nums text-muted-foreground/40">
                {timeAgo(note.updatedAt)}
              </span>
              <ArrowUpRight
                className="size-3.5 shrink-0 text-muted-foreground/0 transition-all group-hover:text-muted-foreground/50"
                strokeWidth={1.5}
              />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
