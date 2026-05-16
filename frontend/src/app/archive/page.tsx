"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Archive, RotateCcw, Trash2, FileText,
  ArrowUpRight, MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotes } from "@/contexts/NotesContext";
import { useTagColors } from "@/contexts/TagColorContext";
import type { Note } from "@/lib/schemas/note";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

/* ── Helpers ─────────────────────────────────────────────────────────── */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* ── Tag pill ────────────────────────────────────────────────────────── */

function TagPill({ tag }: { tag: string }) {
  const { getTagStyle } = useTagColors();
  return (
    <span
      className="inline-block rounded px-1.5 py-px text-[11px] font-medium leading-normal whitespace-nowrap"
      style={getTagStyle(tag)}
    >
      {tag}
    </span>
  );
}

/* ── Tags cell with overflow popover ─────────────────────────────────── */

const VISIBLE_TAGS = 2;

function TagsCell({ tags }: { tags: string[] }) {
  const visible = tags.slice(0, VISIBLE_TAGS);
  const overflow = tags.slice(VISIBLE_TAGS);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visible.map((t) => <TagPill key={t} tag={t} />)}
      {overflow.length > 0 && (
        <Popover>
          <PopoverTrigger className="inline-flex items-center rounded px-1.5 py-px text-[11px] font-medium text-muted-foreground bg-accent hover:bg-muted transition-colors leading-normal cursor-pointer">
            +{overflow.length}
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-auto max-w-56 p-2">
            <div className="flex flex-wrap gap-1">
              {overflow.map((t) => <TagPill key={t} tag={t} />)}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
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
  const router = useRouter();

  return (
    <TableRow className="group border-border hover:bg-accent/40">
      {/* Icon */}
      <TableCell className="w-8 pl-6 pr-0">
        <FileText className="size-4 text-muted-foreground/40" strokeWidth={1.5} />
      </TableCell>

      {/* Title */}
      <TableCell className="max-w-0 flex-1 px-3 py-3.5">
        <p className="truncate text-[14px] font-medium text-foreground">
          {note.title || "Untitled"}
        </p>
      </TableCell>

      {/* Category */}
      <TableCell className="w-36 px-3 py-3.5 hidden md:table-cell">
        {note.category ? (
          <Badge
            variant="secondary"
            className="gap-1.5 text-[12px] font-normal text-muted-foreground bg-transparent border border-border"
          >
            {note.category}
          </Badge>
        ) : (
          <span className="text-[12px] text-muted-foreground/40">—</span>
        )}
      </TableCell>

      {/* Tags */}
      <TableCell className="w-48 px-3 py-3.5 hidden sm:table-cell">
        <TagsCell tags={note.tags} />
      </TableCell>

      {/* Archived date */}
      <TableCell className="w-24 px-3 py-3.5 text-right text-[12px] text-muted-foreground tabular-nums">
        {timeAgo(note.updatedAt)}
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
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg text-muted-foreground",
                  "transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none"
                )}
              >
                <MoreHorizontal className="size-4" strokeWidth={1.5} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  className="gap-2.5 text-[13px]"
                  onClick={() => router.push(`/notes/${note.id}`)}
                >
                  <ArrowUpRight className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                  Open note
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="gap-2.5 text-[13px] text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="size-3.5" strokeWidth={1.5} />
                    Delete permanently
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                <AlertDialogDescription>
                  &ldquo;{note.title || "Untitled"}&rdquo; will be deleted and cannot be recovered.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={() => onDelete(note.id)}>
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

/* ── Loading skeleton rows ───────────────────────────────────────────── */

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i} className="border-border">
          <TableCell className="w-8 pl-6 pr-0">
            <Skeleton className="size-4 rounded" />
          </TableCell>
          <TableCell className="px-3 py-3.5">
            <Skeleton className="h-3.5 w-48" />
          </TableCell>
          <TableCell className="w-36 px-3 hidden md:table-cell">
            <Skeleton className="h-5 w-24 rounded-full" />
          </TableCell>
          <TableCell className="w-48 px-3 hidden sm:table-cell">
            <div className="flex gap-1">
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          </TableCell>
          <TableCell className="w-24 px-3">
            <Skeleton className="ml-auto h-3 w-10" />
          </TableCell>
          <TableCell className="w-36 pr-6" />
        </TableRow>
      ))}
    </>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────── */

function EmptyState() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-28 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-accent">
        <Archive className="size-6 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <p className="text-[15px] font-semibold text-foreground">No archived notes</p>
        <p className="text-[13px] text-muted-foreground max-w-xs">
          Archive a note from the editor to keep it out of your main list without deleting it.
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/notes")}
        className="mt-1 gap-1 text-blue hover:text-blue"
      >
        Go to notes
        <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
      </Button>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function ArchivePage() {
  const { notes, toggleArchive, deleteNote, loadStatus } = useNotes();
  const [search, setSearch] = useState("");

  const loading = loadStatus === "idle" || loadStatus === "loading";
  const allArchived = notes.filter((n) => n.isArchived);

  const archivedNotes = useMemo(() => {
    if (!search.trim()) return allArchived;
    const q = search.toLowerCase();
    return allArchived.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.includes(q)) ||
        (n.category?.toLowerCase().includes(q) ?? false)
    );
  }, [notes, search]); // eslint-disable-line

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header — matches shared page */}
      <div className="shrink-0 border-b border-border px-8 py-7">
        <div className="flex items-center gap-2.5 mb-1">
          <Archive className="size-[18px] text-foreground" strokeWidth={1.5} />
          <h1 className="text-[20px] font-bold tracking-[-0.025em] text-foreground">
            Archive
          </h1>
          {!loading && allArchived.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[11px]">
              {allArchived.length}
            </Badge>
          )}
        </div>
        <p className="text-[13px] text-muted-foreground">
          Notes you&apos;ve archived — restore them or delete permanently.
        </p>
      </div>

      {/* Table */}
      <ScrollArea className="flex-1">
        {loading ? (
          <Table>
            <TableBody><LoadingRows /></TableBody>
          </Table>
        ) : allArchived.length === 0 ? (
          <EmptyState />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-8 pl-6 pr-0" />
                <TableHead className="px-3 text-[12px] font-medium text-muted-foreground">Title</TableHead>
                <TableHead className="w-36 px-3 text-[12px] font-medium text-muted-foreground hidden md:table-cell">Category</TableHead>
                <TableHead className="w-48 px-3 text-[12px] font-medium text-muted-foreground hidden sm:table-cell">Tags</TableHead>
                <TableHead className="w-24 px-3 text-right text-[12px] font-medium text-muted-foreground">Archived</TableHead>
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
