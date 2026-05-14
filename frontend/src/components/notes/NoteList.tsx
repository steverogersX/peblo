"use client";

import { Search, Plus, SlidersHorizontal, X, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NoteCard } from "@/components/notes/NoteCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotes, type SortBy } from "@/contexts/NotesContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "updatedAt", label: "Last edited" },
  { value: "createdAt", label: "Date created" },
  { value: "title", label: "Title A–Z" },
];

export function NoteList() {
  const {
    filteredNotes, allTags, selectedId,
    search, filterTags, sortBy, loadStatus,
    createNote, selectNote, setSearch, toggleFilterTag, setSortBy,
  } = useNotes();

  const loading = loadStatus === "idle" || loadStatus === "loading";

  return (
    <div className="flex h-full w-[260px] shrink-0 flex-col border-r border-[#2a2a2a] bg-[#141313]">

      {/* ── Header ─────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#2a2a2a] px-4 py-3.5">
        <span className="text-[13px] font-semibold tracking-[-0.01em] text-[#e5e2e1]">
          Notes
          {!loading && (
            <span className="ml-2 font-mono text-[11px] text-[#444748]">
              {filteredNotes.length}
            </span>
          )}
        </span>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              title="Sort"
              className="flex size-6 items-center justify-center rounded text-[#444748] transition-colors hover:bg-[#1c1b1b] hover:text-[#8e9192]"
            >
              <SlidersHorizontal className="size-3.5" strokeWidth={1.5} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-36 border-[#2a2a2a] bg-[#1c1b1b] shadow-xl shadow-black/50"
            >
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className="flex items-center justify-between text-[11px] text-[#8e9192] focus:bg-[#2a2a2a] focus:text-[#c4c7c8] data-[highlighted]:bg-[#2a2a2a]"
                >
                  <span className={sortBy === opt.value ? "text-[#aec6ff]" : ""}>{opt.label}</span>
                  {sortBy === opt.value && <Check className="size-3 text-[#508eff]" strokeWidth={2.5} />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={createNote}
            title="New note"
            className="flex size-6 items-center justify-center rounded border border-[#353434] bg-[#2a2a2a] text-[#c4c7c8] transition-colors hover:bg-[#353434]"
          >
            <Plus className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── Search ─────────────────────────────────── */}
      <div className="shrink-0 border-b border-[#2a2a2a] px-3 py-2.5">
        <div className="flex items-center gap-2 rounded-md border border-[#2a2a2a] bg-[#1c1b1b] px-2.5 py-1.5 transition-colors focus-within:border-[#353434]">
          <Search className="size-3.5 shrink-0 text-[#444748]" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="min-w-0 flex-1 bg-transparent text-[12px] text-[#c4c7c8] outline-none placeholder:text-[#444748]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="shrink-0 text-[#444748] hover:text-[#8e9192]">
              <X className="size-3" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* ── Tag filters ────────────────────────────── */}
      {allTags.length > 0 && (
        <div className="shrink-0 flex flex-wrap gap-1.5 border-b border-[#2a2a2a] px-3 py-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleFilterTag(tag)}
              className={`rounded border px-2 py-0.5 font-mono text-[10px] transition-colors ${
                filterTags.includes(tag)
                  ? "border-[#508eff]/60 bg-[#508eff]/10 text-[#aec6ff]"
                  : "border-[#2a2a2a] text-[#444748] hover:border-[#353434] hover:text-[#8e9192]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* ── Note list ──────────────────────────────── */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-b border-[#2a2a2a] px-4 py-3.5 space-y-2">
                <Skeleton className="h-3.5 w-3/4 bg-[#2a2a2a]" />
                <Skeleton className="h-3 w-full bg-[#2a2a2a]" />
                <Skeleton className="h-3 w-1/2 bg-[#2a2a2a]" />
              </div>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12">
            <p className="text-center text-[12px] text-[#444748]">
              {search || filterTags.length > 0 ? "No matches" : "No notes yet"}
            </p>
            {!search && filterTags.length === 0 && (
              <button
                onClick={createNote}
                className="text-[12px] text-[#508eff] hover:text-[#aec6ff] transition-colors"
              >
                Create first note →
              </button>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              selected={note.id === selectedId}
              onClick={() => selectNote(note.id)}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}
