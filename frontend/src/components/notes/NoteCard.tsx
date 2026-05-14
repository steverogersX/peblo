"use client";

import { type Note } from "@/lib/schemas/note";
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
  const preview = stripMarkdown(note.content).slice(0, 90);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full border-b border-[#2a2a2a] px-4 py-3.5 text-left transition-colors last:border-b-0",
        selected ? "bg-[#1c1b1b]" : "bg-transparent hover:bg-[#1a1919]"
      )}
    >
      {selected && (
        <span className="absolute left-0 top-0 h-full w-[2px] rounded-r-sm bg-[#508eff]" />
      )}

      <p className={cn(
        "truncate text-[13px] font-medium leading-snug",
        selected ? "text-[#e5e2e1]" : "text-[#c4c7c8]"
      )}>
        {note.title || "Untitled"}
      </p>

      {preview && (
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-[#444748]">
          {preview}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 gap-1 overflow-hidden">
          {note.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded border border-[#2a2a2a] bg-[#201f1f] px-1.5 py-px font-mono text-[9.5px] text-[#444748]"
            >
              {t}
            </span>
          ))}
          {note.tags.length > 2 && (
            <span className="font-mono text-[9.5px] text-[#444748]">
              +{note.tags.length - 2}
            </span>
          )}
        </div>
        <span className="shrink-0 font-mono text-[10px] text-[#444748]">
          {timeAgo(note.updatedAt)}
        </span>
      </div>
    </button>
  );
}
