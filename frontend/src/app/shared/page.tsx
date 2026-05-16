"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Globe, Link2, Check, MoreHorizontal,
  FileText, ArrowUpRight, Eye, Pencil, Ban, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotes } from "@/contexts/NotesContext";
import { useTagColors } from "@/contexts/TagColorContext";
import type { Note } from "@/lib/schemas/note";
import type { ShareLinkPermission } from "@peblo/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

/* ── Permission metadata ─────────────────────────────────────────────── */

const PERM_META: Record<ShareLinkPermission, { label: string; Icon: React.ElementType; desc: string }> = {
  none: { label: "No access", Icon: Ban,    desc: "Link sharing disabled" },
  view: { label: "View only", Icon: Eye,    desc: "Anyone with the link can view" },
  edit: { label: "Can edit",  Icon: Pencil, desc: "Anyone with the link can edit" },
};

/* ── Inline permission picker ────────────────────────────────────────── */

function AccessPicker({
  value,
  onChange,
}: {
  value: ShareLinkPermission;
  onChange: (v: ShareLinkPermission) => void;
}) {
  const { Icon, label } = PERM_META[value];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[12px] font-medium transition-colors",
            "hover:bg-accent/60 focus-visible:outline-none",
            value === "none"
              ? "border-border text-muted-foreground bg-transparent"
              : "border-border text-muted-foreground bg-transparent"
          )}
        >
          <Icon className="size-3 shrink-0" strokeWidth={1.5} />
          {label}
          <ChevronDown className="size-2.5 opacity-40" strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={4} className="w-[148px] p-1">
        {(["view", "edit", "none"] as ShareLinkPermission[]).map((opt) => {
          const { label: optLabel, Icon: OptIcon } = PERM_META[opt];
          return (
            <DropdownMenuItem
              key={opt}
              onClick={() => onChange(opt)}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px]"
            >
              <OptIcon className="size-3.5 shrink-0 text-muted-foreground/60" strokeWidth={1.5} />
              <span className="flex-1">{optLabel}</span>
              {value === opt && <Check className="size-3 text-blue" strokeWidth={2.5} />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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

/* ── Table row ───────────────────────────────────────────────────────── */

function SharedNoteRow({
  note,
  onChangePermission,
}: {
  note: Note;
  onChangePermission: (id: string, perm: ShareLinkPermission) => void;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  function copyLink() {
    if (!note.shareToken) return;
    const url = `${window.location.origin}/view/${note.shareToken}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <TableRow className="group border-border hover:bg-accent/40">
      {/* Icon */}
      <TableCell className="w-8 pl-6 pr-0">
        <FileText className="size-4 text-muted-foreground/40" strokeWidth={1.5} />
      </TableCell>

      {/* Title */}
      <TableCell className="max-w-0 flex-1 px-3 py-3.5">
        <button
          onClick={() => router.push(`/notes/${note.id}`)}
          className="block truncate text-[14px] font-medium text-foreground transition-colors hover:text-blue text-left w-full"
        >
          {note.title || "Untitled"}
        </button>
      </TableCell>

      {/* Access — inline picker */}
      <TableCell className="w-36 px-3 py-3.5">
        <AccessPicker
          value={note.shareLinkPermission ?? "none"}
          onChange={(perm) => onChangePermission(note.id, perm)}
        />
      </TableCell>

      {/* Tags */}
      <TableCell className="w-48 px-3 py-3.5 hidden sm:table-cell">
        <TagsCell tags={note.tags} />
      </TableCell>

      {/* Edited */}
      <TableCell className="w-24 px-3 py-3.5 text-right text-[12px] text-muted-foreground tabular-nums">
        {timeAgo(note.updatedAt)}
      </TableCell>

      {/* Actions */}
      <TableCell className="w-36 pr-6 py-3.5">
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyLink}
            className={cn(
              "h-7 gap-1.5 text-[12px]",
              copied ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {copied
              ? <><Check className="size-3.5" strokeWidth={2.5} />Copied</>
              : <><Link2 className="size-3.5" strokeWidth={1.75} />Copy link</>
            }
          </Button>

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
              <DropdownMenuItem
                className="gap-2.5 text-[13px] text-destructive focus:text-destructive"
                onClick={() => onChangePermission(note.id, "none")}
              >
                <Ban className="size-3.5" strokeWidth={1.5} />
                Stop sharing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          <TableCell className="w-36 px-3">
            <Skeleton className="h-6 w-24 rounded-md" />
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
        <Globe className="size-6 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <p className="text-[15px] font-semibold text-foreground">No shared notes yet</p>
        <p className="text-[13px] text-muted-foreground max-w-xs">
          Open any note, set its visibility to public, and it will appear here with a shareable link.
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

export default function SharedPage() {
  const { notes, updateNote, loadStatus } = useNotes();
  const loading = loadStatus === "idle" || loadStatus === "loading";
  const publicNotes = notes.filter((n) => n.shareLinkPermission !== "none" && !n.isArchived);

  function handleChangePermission(id: string, perm: ShareLinkPermission) {
    updateNote(id, { shareLinkPermission: perm });
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-8 py-7">
        <div className="flex items-center gap-2.5 mb-1">
          <Globe className="size-[18px] text-foreground" strokeWidth={1.5} />
          <h1 className="text-[20px] font-bold tracking-[-0.025em] text-foreground">
            Shared by me
          </h1>
          {!loading && publicNotes.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[11px]">
              {publicNotes.length}
            </Badge>
          )}
        </div>
        <p className="text-[13px] text-muted-foreground">
          Notes you&apos;ve made public — change access or copy the link anytime.
        </p>
      </div>

      {/* Table */}
      <ScrollArea className="flex-1">
        {loading ? (
          <Table>
            <TableBody><LoadingRows /></TableBody>
          </Table>
        ) : publicNotes.length === 0 ? (
          <EmptyState />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-8 pl-6 pr-0" />
                <TableHead className="px-3 text-[12px] font-medium text-muted-foreground">Title</TableHead>
                <TableHead className="w-36 px-3 text-[12px] font-medium text-muted-foreground">Access</TableHead>
                <TableHead className="w-48 px-3 text-[12px] font-medium text-muted-foreground hidden sm:table-cell">Tags</TableHead>
                <TableHead className="w-24 px-3 text-right text-[12px] font-medium text-muted-foreground">Edited</TableHead>
                <TableHead className="w-36 pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {publicNotes.map((note) => (
                <SharedNoteRow
                  key={note.id}
                  note={note}
                  onChangePermission={handleChangePermission}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </ScrollArea>
    </div>
  );
}
