"use client";

import { useState, useMemo } from "react";
import { Archive, Search, RotateCcw, Trash2, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotes } from "@/contexts/NotesContext";
import { useTagColors } from "@/contexts/TagColorContext";
import type { Note } from "@/lib/schemas/note";

import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

/* ── Helpers ─────────────────────────────────────────────────────────── */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: new Date(iso).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
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

/* ── Tag pill ────────────────────────────────────────────────────────── */

function TagPill({ tag }: { tag: string }) {
  const { getTagStyle } = useTagColors();
  return (
    <span
      className="inline-block rounded px-1.5 py-px text-[11px] font-medium leading-normal"
      style={getTagStyle(tag)}
    >
      {tag}
    </span>
  );
}

/* ── Archive row ─────────────────────────────────────────────────────── */

function ArchiveRow({
  note,
  onRestore,
  onDelete,
}: {
  note: Note;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const preview = stripMarkdown(note.content).slice(0, 90);

  return (
    <TableRow className="group border-border hover:bg-accent/40 align-top">
      <TableCell className="w-8 pl-6 pr-0 pt-4">
        <FileText className="size-4 text-muted-foreground/40" strokeWidth={1.5} />
      </TableCell>

      {/* Title + preview */}
      <TableCell className="px-4 py-3.5">
        <p className="text-[14px] font-medium text-foreground leading-snug">
          {note.title || "Untitled"}
        </p>
        {preview && (
          <p className="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground">
            {preview}
          </p>
        )}
      </TableCell>

      {/* Category */}
      <TableCell className="w-32 px-3 py-3.5 hidden md:table-cell">
        {note.category ? (
          <Badge variant="secondary" className="text-[11px] font-normal">
            {note.category}
          </Badge>
        ) : (
          <span className="text-[12px] text-muted-foreground/40">—</span>
        )}
      </TableCell>

      {/* Tags */}
      <TableCell className="w-44 px-3 py-3.5 hidden lg:table-cell">
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((t) => <TagPill key={t} tag={t} />)}
          {note.tags.length > 3 && (
            <span className="text-[11px] text-muted-foreground">+{note.tags.length - 3}</span>
          )}
        </div>
      </TableCell>

      {/* Archived date */}
      <TableCell className="w-28 px-3 py-3.5 text-right text-[12px] text-muted-foreground whitespace-nowrap">
        {formatDate(note.updatedAt)}
      </TableCell>

      {/* Actions */}
      <TableCell className="w-36 pr-6 py-3.5">
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRestore(note.id)}
            className="h-7 gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" strokeWidth={1.75} />
            Restore
          </Button>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                />
              }
            >
              <Trash2 className="size-3.5" strokeWidth={1.75} />
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                <AlertDialogDescription>
                  &ldquo;{note.title || "Untitled"}&rdquo; will be deleted and cannot be recovered.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => onDelete(note.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

/* ── Loading skeleton ────────────────────────────────────────────────── */

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i} className="border-border">
          <TableCell className="w-8 pl-6 pr-0">
            <Skeleton className="size-4 rounded" />
          </TableCell>
          <TableCell className="px-4 py-3.5 space-y-1.5">
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-3 w-72" />
          </TableCell>
          <TableCell className="w-32 px-3 hidden md:table-cell">
            <Skeleton className="h-5 w-20 rounded-full" />
          </TableCell>
          <TableCell className="w-44 px-3 hidden lg:table-cell">
            <div className="flex gap-1">
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-4 w-14 rounded" />
            </div>
          </TableCell>
          <TableCell className="w-28 px-3">
            <Skeleton className="ml-auto h-3 w-16" />
          </TableCell>
          <TableCell className="w-36 pr-6" />
        </TableRow>
      ))}
    </>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────── */

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-accent">
        <Archive className="size-5 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-[14px] font-medium text-foreground">
          {filtered ? "No matching notes" : "Archive is empty"}
        </p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {filtered
            ? "Try a different search term."
            : "Archived notes will appear here. Archive a note from the editor."}
        </p>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function ArchivePage() {
  const { notes, toggleArchive, deleteNote, loadStatus } = useNotes();
  const [search, setSearch] = useState("");

  const loading = loadStatus === "idle" || loadStatus === "loading";

  const archivedNotes = useMemo(() => {
    const archived = notes.filter((n) => n.isArchived);
    if (!search.trim()) return archived;
    const q = search.toLowerCase();
    return archived.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.includes(q)) ||
        (n.category?.toLowerCase().includes(q) ?? false)
    );
  }, [notes, search]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-8 py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Archive className="size-[18px] text-foreground" strokeWidth={1.5} />
            <h1 className="text-[20px] font-bold tracking-[-0.025em] text-foreground">
              Archive
            </h1>
            {!loading && notes.filter((n) => n.isArchived).length > 0 && (
              <Badge variant="secondary" className="text-[12px] font-normal tabular-nums">
                {notes.filter((n) => n.isArchived).length}
              </Badge>
            )}
          </div>

          {/* Search */}
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search archive…"
              className={cn(
                "h-8 pl-8 text-[13px]",
                search && "pr-7"
              )}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        <p className="mt-1 text-[14px] text-muted-foreground">
          Notes you&apos;ve archived. Restore them to bring them back, or delete permanently.
        </p>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {loading ? (
          <Table>
            <TableBody><LoadingRows /></TableBody>
          </Table>
        ) : archivedNotes.length === 0 ? (
          <EmptyState filtered={search.trim().length > 0} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-8 pl-6 pr-0" />
                <TableHead className="px-4 text-[12px] font-medium text-muted-foreground">
                  Title
                </TableHead>
                <TableHead className="w-32 px-3 text-[12px] font-medium text-muted-foreground hidden md:table-cell">
                  Category
                </TableHead>
                <TableHead className="w-44 px-3 text-[12px] font-medium text-muted-foreground hidden lg:table-cell">
                  Tags
                </TableHead>
                <TableHead className="w-28 px-3 text-right text-[12px] font-medium text-muted-foreground">
                  Archived
                </TableHead>
                <TableHead className="w-36 pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {archivedNotes.map((note) => (
                <ArchiveRow
                  key={note.id}
                  note={note}
                  onRestore={(id) => toggleArchive(id)}
                  onDelete={(id) => deleteNote(id)}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </ScrollArea>
    </div>
  );
}
