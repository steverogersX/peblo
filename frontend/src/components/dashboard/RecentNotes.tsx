"use client";

import { Clock, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/contexts/DashboardContext";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function RecentNotes() {
  const { insights, status } = useDashboard();
  const loading = status === "loading" || status === "idle";
  const notes = insights?.recentlyEditedNotes ?? [];

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1c1b1b]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a2a] px-5 py-4">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-[#444748]" strokeWidth={1.5} />
          <span className="text-[13px] font-semibold tracking-[-0.01em] text-[#e5e2e1]">
            Recently Edited
          </span>
        </div>
        <button className="flex items-center gap-1 text-[11px] text-[#508eff] hover:text-[#aec6ff] transition-colors">
          View all <ArrowUpRight className="size-3" strokeWidth={1.5} />
        </button>
      </div>

      {/* List */}
      <div>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-[#2a2a2a] last:border-b-0"
              >
                <Skeleton className="h-3.5 w-1/2 bg-[#2a2a2a]" />
                <Skeleton className="ml-auto h-3 w-10 bg-[#2a2a2a]" />
              </div>
            ))
          : notes.map((note, idx) => (
              <div
                key={note.id}
                className={`group flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#201f1f] ${idx < notes.length - 1 ? "border-b border-[#2a2a2a]" : ""}`}
              >
                <p className="flex-1 truncate text-[13px] font-medium text-[#c4c7c8] group-hover:text-[#e5e2e1] transition-colors">
                  {note.title}
                </p>
                <span className="shrink-0 font-mono text-[11px] text-[#444748]">
                  {timeAgo(note.updatedAt)}
                </span>
                <ArrowUpRight
                  className="size-3.5 shrink-0 text-[#444748] opacity-0 transition-opacity group-hover:opacity-100"
                  strokeWidth={1.5}
                />
              </div>
            ))}
      </div>
    </div>
  );
}
