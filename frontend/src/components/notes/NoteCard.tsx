"use client";

import { type Note } from "@/lib/schemas/note";
import { useTagColors } from "@/contexts/TagColorContext";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: Note;
  selected: boolean;
  onClick: () => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  if (d < 30) return `${Math.floor(d / 7)}w`;
  return `${Math.floor(d / 30)}mo`;
}

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim();
}

export function NoteCard({ note, selected, onClick }: NoteCardProps) {
  const { getTagStyle } = useTagColors();
  const preview = stripMarkdown(note.content).slice(0, 120);
  const hasMeta = note.category || note.tags.length > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-md px-3 py-2.5 text-left transition-colors duration-100",
        selected
          ? "bg-sidebar-accent"
          : "hover:bg-sidebar-accent/50"
      )}
    >
      {/* Title + timestamp */}
      <div className="flex items-baseline justify-between gap-2">
        <p className={cn(
          "min-w-0 flex-1 truncate text-[13px] leading-snug tracking-[-0.01em]",
          selected ? "font-medium text-foreground" : "font-[450] text-foreground/85"
        )}>
          {note.title || "Untitled"}
        </p>
        <span className="shrink-0 text-[10.5px] tabular-nums text-muted-foreground/35">
          {timeAgo(note.updatedAt)}
        </span>
      </div>

      {/* Preview */}
      {preview && (
        <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-[1.5] text-muted-foreground/50">
          {preview}
        </p>
      )}

      {/* Category + tags */}
      {hasMeta && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {note.category && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30">
              {note.category}
            </span>
          )}
          {note.tags.map((t) => (
            <span
              key={t}
              className="rounded px-1.5 py-px text-[10px] font-medium leading-normal"
              style={getTagStyle(t)}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
