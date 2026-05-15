"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Globe, Link2, Check, MoreHorizontal,
  FileText, Users, EyeOff, ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotes } from "@/contexts/NotesContext";
import { useTagColors } from "@/contexts/TagColorContext";
import type { Note } from "@/lib/schemas/note";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

/* ── Types ───────────────────────────────────────────────────────────── */

interface SharedEntry {
  id: string;
  title: string;
  preview: string;
  sharedBy: { name: string; initials: string; colorIdx: number };
  tags: string[];
  updatedAt: string;
}

/* ── Mock "shared with me" ───────────────────────────────────────────── */

const SHARED_WITH_ME: SharedEntry[] = [
  {
    id: "sw-1",
    title: "Q3 Product Roadmap",
    preview: "Major features planned for Q3 including AI integration, team workspaces, and the mobile app.",
    sharedBy: { name: "Alex Chen", initials: "AC", colorIdx: 5 },
    tags: ["product", "roadmap"],
    updatedAt: "2026-05-13T14:00:00Z",
  },
  {
    id: "sw-2",
    title: "Design System Guidelines",
    preview: "Component library documentation covering typography, spacing, color tokens, and usage patterns.",
    sharedBy: { name: "Maya Patel", initials: "MP", colorIdx: 7 },
    tags: ["design", "docs"],
    updatedAt: "2026-05-09T16:30:00Z",
  },
  {
    id: "sw-3",
    title: "Engineering Interview Rubric",
    preview: "Scoring criteria for software engineering interviews across levels L3–L6, with worked examples.",
    sharedBy: { name: "Jordan Kim", initials: "JK", colorIdx: 4 },
    tags: ["hiring", "engineering"],
    updatedAt: "2026-05-05T08:00:00Z",
  },
  {
    id: "sw-4",
    title: "Post-mortem: May 8 Outage",
    preview: "Root cause was an uncaught null ref in the auth middleware. Timeline, impact, and action items.",
    sharedBy: { name: "Sam Rivera", initials: "SR", colorIdx: 2 },
    tags: ["incident", "engineering"],
    updatedAt: "2026-05-08T22:00:00Z",
  },
];

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
      className="inline-block rounded px-1.5 py-px text-[11px] font-medium leading-normal"
      style={getTagStyle(tag)}
    >
      {tag}
    </span>
  );
}

/* ── "Shared by me" row ──────────────────────────────────────────────── */

function SharedByMeRow({ note, onStopSharing }: { note: Note; onStopSharing: (id: string) => void }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(`https://peblo.app/note/${note.id}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <TableRow className="group border-border hover:bg-accent/40">
      <TableCell className="w-8 pl-6 pr-0">
        <FileText className="size-4 text-muted-foreground/40" strokeWidth={1.5} />
      </TableCell>

      <TableCell className="max-w-0 flex-1 px-3 py-3.5">
        <button
          onClick={() => router.push("/notes")}
          className="block truncate text-[14px] font-medium text-foreground transition-colors hover:text-blue text-left"
        >
          {note.title || "Untitled"}
        </button>
      </TableCell>

      <TableCell className="w-44 px-3 py-3.5">
        <Badge
          variant="secondary"
          className="gap-1.5 text-[12px] font-normal text-muted-foreground bg-transparent border border-border"
        >
          <Globe className="size-3 shrink-0" strokeWidth={1.5} />
          Anyone with link
        </Badge>
      </TableCell>

      <TableCell className="w-40 px-3 py-3.5 hidden sm:table-cell">
        <div className="flex items-center gap-1">
          {note.tags.slice(0, 2).map((t) => <TagPill key={t} tag={t} />)}
          {note.tags.length > 2 && (
            <span className="text-[11px] text-muted-foreground">+{note.tags.length - 2}</span>
          )}
        </div>
      </TableCell>

      <TableCell className="w-24 px-3 py-3.5 text-right text-[12px] text-muted-foreground">
        {timeAgo(note.updatedAt)}
      </TableCell>

      <TableCell className="w-32 pr-6 py-3.5">
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
                "transition-colors hover:bg-muted hover:text-foreground",
                "focus-visible:outline-none"
              )}
            >
              <MoreHorizontal className="size-4" strokeWidth={1.5} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                className="gap-2.5 text-[13px]"
                onClick={() => router.push("/notes")}
              >
                <ArrowUpRight className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                Open note
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2.5 text-[13px]"
                onClick={() => onStopSharing(note.id)}
              >
                <EyeOff className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                Stop sharing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

/* ── "Shared with me" row ────────────────────────────────────────────── */

function SharedWithMeRow({ entry }: { entry: SharedEntry }) {
  return (
    <TableRow className="group border-border hover:bg-accent/40">
      <TableCell className="w-8 pl-6 pr-2 py-3">
        <Avatar size="sm">
          <AvatarFallback
            className="text-[11px] font-semibold"
            style={{
              backgroundColor: `var(--tag-${entry.sharedBy.colorIdx}-bg)`,
              color: `var(--tag-${entry.sharedBy.colorIdx}-text)`,
            }}
          >
            {entry.sharedBy.initials}
          </AvatarFallback>
        </Avatar>
      </TableCell>

      <TableCell className="px-3 py-3.5">
        <p className="text-[14px] font-medium text-foreground leading-snug">
          {entry.title}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-muted-foreground max-w-sm">
          {entry.preview}
        </p>
      </TableCell>

      <TableCell className="w-40 px-3 py-3.5 hidden sm:table-cell">
        <div className="flex items-center gap-1">
          {entry.tags.slice(0, 2).map((t) => <TagPill key={t} tag={t} />)}
        </div>
      </TableCell>

      <TableCell className="w-36 px-3 py-3.5 text-right">
        <p className="text-[12px] text-muted-foreground">{entry.sharedBy.name}</p>
        <p className="text-[11px] text-muted-foreground/60">{timeAgo(entry.updatedAt)}</p>
      </TableCell>

      <TableCell className="w-20 pr-6 py-3.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-[12px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        >
          Open
          <ArrowUpRight className="size-3" strokeWidth={1.75} />
        </Button>
      </TableCell>
    </TableRow>
  );
}

/* ── Loading rows ────────────────────────────────────────────────────── */

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i} className="border-border">
          <TableCell className="w-8 pl-6 pr-0">
            <Skeleton className="size-4 rounded" />
          </TableCell>
          <TableCell className="px-3 py-3.5">
            <Skeleton className="h-3.5 w-48" />
          </TableCell>
          <TableCell className="w-44 px-3">
            <Skeleton className="h-5 w-32 rounded-full" />
          </TableCell>
          <TableCell className="w-40 px-3 hidden sm:table-cell">
            <div className="flex gap-1">
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-4 w-14 rounded" />
            </div>
          </TableCell>
          <TableCell className="w-24 px-3">
            <Skeleton className="ml-auto h-3 w-12" />
          </TableCell>
          <TableCell className="w-32 pr-6" />
        </TableRow>
      ))}
    </>
  );
}

/* ── Empty states ────────────────────────────────────────────────────── */

function EmptySharedByMe() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-accent">
        <Globe className="size-5 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-[14px] font-medium text-foreground">No shared pages yet</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Notes you make public will appear here.
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

function EmptySharedWithMe() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-accent">
        <Users className="size-5 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-[14px] font-medium text-foreground">Nothing shared with you</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Pages others share with you will appear here.
        </p>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function SharedPage() {
  const { notes, updateNote, loadStatus } = useNotes();
  const loading = loadStatus === "idle" || loadStatus === "loading";
  const publicNotes = notes.filter((n) => n.visibility === "public" && !n.isArchived);

  function stopSharing(id: string) {
    updateNote(id, { visibility: "private" });
  }

  return (
    <Tabs defaultValue="by-me" className="flex h-full flex-col overflow-hidden gap-0">
      {/* Page header */}
      <div className="shrink-0 border-b border-border px-8 pt-8 pb-0">
        <div className="flex items-center gap-2.5 mb-1">
          <Globe className="size-[18px] text-foreground" strokeWidth={1.5} />
          <h1 className="text-[20px] font-bold tracking-[-0.025em] text-foreground">
            Shared
          </h1>
        </div>
        <p className="text-[14px] text-muted-foreground mb-5">
          Pages you&apos;ve published and pages shared with you.
        </p>

        <TabsList
          variant="line"
          className="h-10 w-auto justify-start gap-0 overflow-visible border-b-0 bg-transparent px-0"
        >
          <TabsTrigger
            value="by-me"
            className="h-full gap-1.5 rounded-none px-4 text-[14px] data-[variant=line]:px-4"
          >
            Shared by me
            {!loading && publicNotes.length > 0 && (
              <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[11px]">
                {publicNotes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="with-me"
            className="h-full gap-1.5 rounded-none px-4 text-[14px] data-[variant=line]:px-4"
          >
            Shared with me
            <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[11px]">
              {SHARED_WITH_ME.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Shared by me */}
      <TabsContent value="by-me" className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden">
        <ScrollArea className="h-full">
          {loading ? (
            <Table>
              <TableBody><LoadingRows /></TableBody>
            </Table>
          ) : publicNotes.length === 0 ? (
            <EmptySharedByMe />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-8 pl-6 pr-0" />
                  <TableHead className="px-3 text-[12px] font-medium text-muted-foreground">Title</TableHead>
                  <TableHead className="w-44 px-3 text-[12px] font-medium text-muted-foreground">Access</TableHead>
                  <TableHead className="w-40 px-3 text-[12px] font-medium text-muted-foreground hidden sm:table-cell">Tags</TableHead>
                  <TableHead className="w-24 px-3 text-right text-[12px] font-medium text-muted-foreground">Edited</TableHead>
                  <TableHead className="w-32 pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {publicNotes.map((note) => (
                  <SharedByMeRow key={note.id} note={note} onStopSharing={stopSharing} />
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </TabsContent>

      {/* Shared with me */}
      <TabsContent value="with-me" className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden">
        <ScrollArea className="h-full">
          {SHARED_WITH_ME.length === 0 ? (
            <EmptySharedWithMe />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-8 pl-6 pr-2" />
                  <TableHead className="px-3 text-[12px] font-medium text-muted-foreground">Title</TableHead>
                  <TableHead className="w-40 px-3 text-[12px] font-medium text-muted-foreground hidden sm:table-cell">Tags</TableHead>
                  <TableHead className="w-36 px-3 text-right text-[12px] font-medium text-muted-foreground">Shared by</TableHead>
                  <TableHead className="w-20 pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {SHARED_WITH_ME.map((entry) => (
                  <SharedWithMeRow key={entry.id} entry={entry} />
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
