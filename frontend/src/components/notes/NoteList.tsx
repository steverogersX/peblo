"use client";

import { useEffect, useRef } from "react";
import { Search, Plus, SlidersHorizontal, X, Check, Tag, Layers, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { NoteCard } from "@/components/notes/NoteCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotes, type SortBy } from "@/contexts/NotesContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "updatedAt", label: "Last edited" },
  { value: "createdAt", label: "Date created" },
  { value: "title", label: "Title A–Z" },
];

export function NoteList() {
  const router = useRouter();
  const {
    filteredNotes, allTags, allCategories, selectedId,
    search, filterTags, filterCategories, sortBy, loadStatus,
    hasMore, isFetchingMore,
    createNote, selectNote, setSearch, toggleFilterTag, toggleFilterCategory, setSortBy, loadMore,
  } = useNotes();

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll — fire loadMore when sentinel enters viewport
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  function handleSelectNote(id: string) {
    selectNote(id);
    router.push(`/notes/${id}`);
  }

  function handleCreateNote() {
    const id = createNote();
    router.push(`/notes/${id}`);
  }

  const loading = loadStatus === "idle" || loadStatus === "loading";
  const activeFilterCount = filterTags.length + filterCategories.length + (sortBy !== "updatedAt" ? 1 : 0);

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

          {/* Filter popover */}
          <Popover>
            <PopoverTrigger
              title="Filter & sort"
              className={cn(
                "relative flex size-6 items-center justify-center rounded transition-colors",
                activeFilterCount > 0
                  ? "text-[#508eff] hover:bg-accent"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <SlidersHorizontal className="size-3.5" strokeWidth={1.5} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-3 items-center justify-center rounded-full bg-[#508eff] text-[8px] font-bold text-white leading-none">
                  {activeFilterCount}
                </span>
              )}
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="start"
              sideOffset={8}
              className="w-52 p-0 gap-0 border-border bg-popover shadow-xl"
            >
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
                <span className="text-[12px] font-semibold text-foreground tracking-wide uppercase">
                  Filter & Sort
                </span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      filterTags.forEach((t) => toggleFilterTag(t));
                      filterCategories.forEach((c) => toggleFilterCategory(c));
                      setSortBy("updatedAt");
                    }}
                    className="text-[11px] text-[#508eff] hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="px-3 pt-2.5 pb-2">
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  <SlidersHorizontal className="size-3" strokeWidth={1.5} />
                  Sort by
                </div>
                <div className="space-y-0.5">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={cn(
                        "flex w-full items-center justify-between rounded px-2 py-1 text-[12px] transition-colors",
                        sortBy === opt.value
                          ? "bg-[#508eff]/10 text-[#508eff] font-medium"
                          : "text-foreground hover:bg-accent"
                      )}
                    >
                      {opt.label}
                      {sortBy === opt.value && <Check className="size-3" strokeWidth={2.5} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              {allCategories.length > 0 && (
                <>
                  <Separator className="bg-border" />
                  <div className="px-3 pt-2.5 pb-2">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      <Layers className="size-3" strokeWidth={1.5} />
                      Category
                    </div>
                    <div className="space-y-0.5">
                      {allCategories.map((cat) => {
                        const active = filterCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            onClick={() => toggleFilterCategory(cat)}
                            className={cn(
                              "flex w-full items-center justify-between rounded px-2 py-1 text-[12px] transition-colors",
                              active
                                ? "bg-[#508eff]/10 text-[#508eff] font-medium"
                                : "text-foreground hover:bg-accent"
                            )}
                          >
                            <span className="truncate">{cat}</span>
                            {active && <Check className="size-3 shrink-0" strokeWidth={2.5} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Tags */}
              {allTags.length > 0 && (
                <>
                  <Separator className="bg-border" />
                  <div className="px-3 pt-2.5 pb-3">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      <Tag className="size-3" strokeWidth={1.5} />
                      Tags
                    </div>
                    <ScrollArea className="max-h-[160px]">
                      <div className="space-y-0.5 pr-1">
                        {allTags.map((tag) => {
                          const active = filterTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              onClick={() => toggleFilterTag(tag)}
                              className={cn(
                                "flex w-full items-center justify-between rounded px-2 py-1 text-[12px] transition-colors",
                                active
                                  ? "bg-[#508eff]/10 text-[#508eff] font-medium"
                                  : "text-foreground hover:bg-accent"
                              )}
                            >
                              <span className="truncate">#{tag}</span>
                              {active && <Check className="size-3 shrink-0" strokeWidth={2.5} />}
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </>
              )}
            </PopoverContent>
          </Popover>

          <button
            onClick={handleCreateNote}
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

      {/* Active filter chips */}
      {(filterTags.length > 0 || filterCategories.length > 0) && (
        <div className="shrink-0 flex flex-wrap gap-1 px-3 pb-2">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleFilterCategory(cat)}
              className="flex items-center gap-0.5 rounded-full bg-[#508eff]/10 px-2 py-0.5 text-[11px] font-medium text-[#508eff] transition-colors hover:bg-[#508eff]/20"
            >
              {cat}
              <X className="size-2.5" strokeWidth={2.5} />
            </button>
          ))}
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleFilterTag(tag)}
              className="flex items-center gap-0.5 rounded-full bg-[#508eff]/10 px-2 py-0.5 text-[11px] font-medium text-[#508eff] transition-colors hover:bg-[#508eff]/20"
            >
              #{tag}
              <X className="size-2.5" strokeWidth={2.5} />
            </button>
          ))}
        </div>
      )}

      {/* Scrollable note list */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-px px-1.5 py-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-md px-3 py-2.5 space-y-1.5">
                <div className="flex justify-between gap-2">
                  <Skeleton className="h-3 w-3/5" />
                  <Skeleton className="h-3 w-6" />
                </div>
                <Skeleton className="h-2.5 w-full" />
                <Skeleton className="h-2.5 w-4/5" />
                <div className="flex gap-1.5 pt-0.5">
                  <Skeleton className="h-4 w-12 rounded" />
                  <Skeleton className="h-4 w-10 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12">
            <p className="text-center text-[13px] text-muted-foreground">
              {search || filterTags.length > 0 || filterCategories.length > 0
                ? "No matches"
                : "No notes yet"}
            </p>
            {!search && filterTags.length === 0 && filterCategories.length === 0 && (
              <button
                onClick={handleCreateNote}
                className="text-[13px] text-[#508eff] hover:underline"
              >
                Create first note
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-px px-1.5 py-1">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                selected={note.id === selectedId}
                onClick={() => handleSelectNote(note.id)}
              />
            ))}

            {/* Sentinel — entering viewport triggers loadMore() */}
            {hasMore && <div ref={sentinelRef} className="h-1" />}

            {/* Loading more indicator */}
            {isFetchingMore && (
              <div className="flex items-center justify-center gap-2 py-3">
                <Loader2 className="size-3.5 animate-spin text-muted-foreground/50" />
                <span className="text-[11px] text-muted-foreground/50">Loading more…</span>
              </div>
            )}

            {/* End of list hint */}
            {!hasMore && filteredNotes.length > 0 && (
              <p className="py-4 text-center text-[10.5px] text-muted-foreground/30">
                All notes loaded
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
