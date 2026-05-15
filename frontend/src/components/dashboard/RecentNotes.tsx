"use client";

import { useRouter } from "next/navigation";
import { Clock, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-[14px] font-semibold text-foreground">Recently edited</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/notes")}
          className="h-6 gap-1 text-[13px] text-blue hover:text-blue"
        >
          View all
          <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
        </Button>
      </div>

      <div>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-b-0">
                <Skeleton className="h-3.5 w-1/2" />
                <Skeleton className="ml-auto h-3 w-10" />
              </div>
            ))
          : notes.length === 0
          ? (
            <div className="px-5 py-8 text-center">
              <p className="text-[13px] text-muted-foreground">No notes yet.</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/notes")}
                className="mt-2 text-[13px] text-blue hover:text-blue"
              >
                Create your first note
              </Button>
            </div>
          )
          : notes.map((note, idx) => (
              <button
                key={note.id}
                onClick={() => openNote(note.id)}
                className={`group flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-accent/60 ${idx < notes.length - 1 ? "border-b border-border" : ""}`}
              >
                <p className="flex-1 truncate text-[14px] text-foreground/80 group-hover:text-foreground transition-colors">
                  {note.title || "Untitled"}
                </p>
                <span className="shrink-0 text-[12px] text-muted-foreground">
                  {timeAgo(note.updatedAt)}
                </span>
                <ArrowUpRight
                  className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60"
                  strokeWidth={1.5}
                />
              </button>
            ))}
      </div>
    </div>
  );
}
