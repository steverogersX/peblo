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
    <div className="flex h-full w-[240px] shrink-0 flex-col border-r border-border bg-background">

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-2">
        <span className="text-[13px] font-semibold text-foreground">
          Notes
          {!loading && (
            <span className="ml-1.5 text-[12px] font-normal text-muted-foreground">
              {filteredNotes.length}
            </span>
          )}
        </span>
        <div className="flex items-center gap-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger
              title="Sort"
              className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <SlidersHorizontal className="size-3.5" strokeWidth={1.5} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-36 border-border bg-popover shadow-lg"
            >
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className="flex items-center justify-between text-[13px] text-foreground focus:bg-accent"
                >
                  <span className={sortBy === opt.value ? "text-blue font-medium" : ""}>{opt.label}</span>
                  {sortBy === opt.value && <Check className="size-3.5 text-blue" strokeWidth={2.5} />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={createNote}
            title="New note"
            className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Plus className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="shrink-0 px-3 pb-2">
        <div className="flex items-center gap-2 rounded-md bg-accent px-2.5 py-1.5 transition-colors focus-within:ring-1 focus-within:ring-border-strong">
          <Search className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          {search && (
            <button onClick={() => setSearch("")} className="shrink-0 text-muted-foreground hover:text-foreground">
              <X className="size-3" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="shrink-0 flex flex-wrap gap-1 px-3 pb-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleFilterTag(tag)}
              className={`rounded-full px-2 py-0.5 text-[11px] transition-colors ${
                filterTags.includes(tag)
                  ? "bg-blue/10 text-blue font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Note list */}
      <ScrollArea className="flex-1 px-1 pt-0.5">
        {loading ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-md p-3 space-y-2">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12">
            <p className="text-center text-[13px] text-muted-foreground">
              {search || filterTags.length > 0 ? "No matches" : "No notes yet"}
            </p>
            {!search && filterTags.length === 0 && (
              <button
                onClick={createNote}
                className="text-[13px] text-blue hover:underline"
              >
                Create first note
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
