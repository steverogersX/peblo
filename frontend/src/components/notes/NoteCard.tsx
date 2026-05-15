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
  return `${Math.floor(h / 24)}d`;
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
  const preview = stripMarkdown(note.content).slice(0, 80);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mx-1 mb-px w-[calc(100%-8px)] rounded-md px-3 py-2.5 text-left",
        selected ? "bg-accent" : "hover:bg-accent/60"
      )}
    >
      <p className={cn(
        "truncate text-[14px] font-medium leading-snug",
        selected ? "text-foreground" : "text-foreground/80"
      )}>
        {note.title || "Untitled"}
      </p>

      {preview && (
        <p className="mt-0.5 line-clamp-1 text-[13px] leading-relaxed text-muted-foreground">
          {preview}
        </p>
      )}

      {(note.tags.length > 0 || true) && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 gap-1 overflow-hidden">
            {note.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="inline-block rounded px-1.5 py-px text-[11px] font-medium leading-normal"
                style={getTagStyle(t)}
              >
                {t}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-[11px] text-muted-foreground">+{note.tags.length - 3}</span>
            )}
          </div>
          <span className="shrink-0 text-[11px] text-muted-foreground/70">
            {timeAgo(note.updatedAt)}
          </span>
        </div>
      )}
    </button>
  );
}
