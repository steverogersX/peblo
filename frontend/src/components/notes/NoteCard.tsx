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
  const maxTags = note.category ? 2 : 3;
  const visibleTags = note.tags.slice(0, maxTags);
  const overflow = note.tags.length - visibleTags.length;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mx-1 mb-px w-[calc(100%-8px)] rounded-md px-3 py-2.5 text-left",
        selected ? "bg-accent" : "hover:bg-accent/60"
      )}
    >
      {/* Title */}
      <p className={cn(
        "truncate text-[13.5px] font-medium leading-snug",
        selected ? "text-foreground" : "text-foreground/90"
      )}>
        {note.title || "Untitled"}
      </p>

      {/* Preview */}
      {preview && (
        <p className="mt-0.5 line-clamp-1 text-[12px] leading-relaxed text-muted-foreground/70">
          {preview}
        </p>
      )}

      {/* Metadata row */}
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1 overflow-hidden">
          {/* Category as plain text */}
          {note.category && (
            <>
              <span className="shrink-0 truncate text-[11px] text-muted-foreground/50">
                {note.category}
              </span>
              {visibleTags.length > 0 && (
                <span className="shrink-0 text-[11px] text-muted-foreground/25">·</span>
              )}
            </>
          )}

          {/* Tags as small colored chips */}
          {visibleTags.map((t) => (
            <span
              key={t}
              className="shrink-0 rounded px-1.5 py-px text-[10.5px] font-medium leading-normal"
              style={getTagStyle(t)}
            >
              {t}
            </span>
          ))}

          {overflow > 0 && (
            <span className="shrink-0 text-[11px] text-muted-foreground/40">
              +{overflow}
            </span>
          )}
        </div>

        <span className="shrink-0 text-[11px] text-muted-foreground/40">
          {timeAgo(note.updatedAt)}
        </span>
      </div>
    </button>
  );
}
