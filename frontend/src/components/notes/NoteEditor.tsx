"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Archive, Trash2, Globe, Lock,
  MoreHorizontal, Loader2, FileText,
  Maximize2, Minimize2, ArrowLeft,
  Tag, FolderOpen, ChevronRight,
  CalendarDays,
} from "lucide-react";
import { RichEditor } from "@/components/notes/RichEditor";
import { TagInput } from "@/components/notes/TagInput";
import { NoteSharePopover } from "@/components/notes/NoteSharePopover";
import { useNotes } from "@/contexts/NotesContext";
import { useSettings } from "@/contexts/SettingsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const SAVE_DELAY = 700;
const CONTENT_MAX = "mx-auto w-full max-w-[900px]";

interface NoteEditorProps {
  focusMode?: boolean;
  onToggleFocus?: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function NoteEditor({ focusMode = false, onToggleFocus }: NoteEditorProps) {
  const {
    selectedNote, updateNote, deleteNote, toggleArchive,
    setSaveStatus, saveStatus, selectNote,
  } = useNotes();
  const { settings } = useSettings();

  const [title, setTitle] = useState("");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selectedNote) setTitle(selectedNote.title);
  }, [selectedNote?.id]); // eslint-disable-line

  useEffect(() => {
    if (selectedNote && !selectedNote.title && !selectedNote.content) {
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [selectedNote?.id]); // eslint-disable-line

  const scheduleTitle = useCallback(
    (val: string) => {
      setTitle(val);
      setSaveStatus("saving");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        if (selectedNote) {
          updateNote(selectedNote.id, { title: val });
          setSaveStatus("saved");
        }
      }, SAVE_DELAY);
    },
    [selectedNote, updateNote, setSaveStatus]
  );

  const handleContentChange = useCallback(
    (markdown: string) => {
      if (!selectedNote) return;
      setSaveStatus("saving");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        updateNote(selectedNote.id, { content: markdown });
        setSaveStatus("saved");
      }, SAVE_DELAY);
    },
    [selectedNote, updateNote, setSaveStatus]
  );

  if (!selectedNote) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-background">
        <FileText className="size-10 text-muted-foreground/30" strokeWidth={1} />
        <p className="text-[14px] text-muted-foreground">Select a note to start editing</p>
      </div>
    );
  }

  const pad = focusMode ? "px-20" : "px-14";

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">

      {/* ── Notion-style ghost top bar ── */}
      <div className="group/topbar flex shrink-0 items-center justify-between px-3.5 py-2">

        {/* Left: back button (focus) or breadcrumb */}
        {focusMode ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFocus}
            className="gap-1.5 text-[12.5px] text-muted-foreground/50 hover:text-muted-foreground/80 hover:bg-accent/40"
          >
            <ArrowLeft className="size-3.5" strokeWidth={1.5} />
            Notes
          </Button>
        ) : (
          <div className="flex select-none items-center gap-1 text-[12px] text-muted-foreground/30">
            <button
              type="button"
              onClick={() => selectNote(null)}
              className="rounded px-0.5 transition-colors hover:text-muted-foreground/70 cursor-pointer"
            >
              Notes
            </button>
            <ChevronRight className="size-3 shrink-0" strokeWidth={1.5} />
            <span className="max-w-[180px] truncate text-muted-foreground/50 cursor-default">
              {title || "Untitled"}
            </span>
          </div>
        )}

        {/* Right: share + save status + actions */}
        <div className="flex items-center gap-0.5">
          <NoteSharePopover
            noteId={selectedNote.id}
            noteTitle={title}
            visibility={selectedNote.visibility ?? "private"}
          />
          {/* Save status — fades in only when saving */}
          <span className="mr-2 select-none text-[11px] text-muted-foreground/30 tabular-nums">
            {saveStatus === "saving" ? (
              <span className="flex items-center gap-1 text-muted-foreground/45">
                <Loader2 className="size-3 animate-spin" strokeWidth={1.5} />
                Saving
              </span>
            ) : (
              <span className="opacity-0 group-hover/topbar:opacity-100 transition-opacity duration-200">
                Saved
              </span>
            )}
          </span>

          {/* Focus toggle */}
          <Tooltip>
            <TooltipTrigger
              onClick={onToggleFocus}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                "text-muted-foreground/40 hover:text-muted-foreground/80 opacity-0 group-hover/topbar:opacity-100 transition-opacity duration-150"
              )}
            >
              {focusMode
                ? <Minimize2 className="size-3.5" strokeWidth={1.5} />
                : <Maximize2 className="size-3.5" strokeWidth={1.5} />}
            </TooltipTrigger>
            <TooltipContent className="text-[12px]">
              {focusMode ? "Exit focus mode" : "Focus mode"}
            </TooltipContent>
          </Tooltip>

          {/* More menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                "text-muted-foreground/40 hover:text-muted-foreground/80 opacity-0 group-hover/topbar:opacity-100 transition-opacity duration-150"
              )}
            >
              <MoreHorizontal className="size-4" strokeWidth={1.5} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" sideOffset={6} className="w-52">
              <DropdownMenuItem
                onClick={() => toggleArchive(selectedNote.id)}
                className="gap-2 text-[13px]"
              >
                <Archive className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                {selectedNote.isArchived ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => deleteNote(selectedNote.id)}
                variant="destructive"
                className="gap-2 text-[13px]"
              >
                <Trash2 className="size-3.5" strokeWidth={1.5} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Scrollable document body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className={cn(CONTENT_MAX, pad, "pt-14 pb-4")}>

          {/* Title */}
          <textarea
            ref={titleRef}
            value={title}
            onChange={(e) => {
              scheduleTitle(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                document.querySelector<HTMLElement>(".tiptap")?.focus();
              }
            }}
            placeholder="Untitled"
            rows={1}
            className={cn(
              "w-full resize-none overflow-hidden bg-transparent font-extrabold leading-[1.15] tracking-[-0.03em] text-foreground outline-none",
              "placeholder:text-foreground/10",
              focusMode ? "text-[48px]" : "text-[40px]"
            )}
          />

          {/* ── Notion-style property rows ── */}
          <div className="mt-6 mb-1">

            {/* Tags */}
            <div className="group/prop flex min-h-[32px] items-start rounded-md transition-colors duration-100 hover:bg-accent/25">
              <div className="flex w-[140px] shrink-0 items-center gap-2 px-2 py-[7px] text-[12.5px] font-medium text-muted-foreground/40 select-none">
                <Tag className="size-3.5 shrink-0" strokeWidth={1.5} />
                Tags
              </div>
              <div className="min-w-0 flex-1 px-2 py-1">
                <TagInput
                  tags={selectedNote.tags}
                  suggestions={settings.tags}
                  onChange={(tags) => updateNote(selectedNote.id, { tags })}
                />
              </div>
            </div>

            {/* Category */}
            <div className="group/prop flex min-h-[32px] items-center rounded-md transition-colors duration-100 hover:bg-accent/25">
              <div className="flex w-[140px] shrink-0 items-center gap-2 px-2 py-[7px] text-[12.5px] font-medium text-muted-foreground/40 select-none">
                <FolderOpen className="size-3.5 shrink-0" strokeWidth={1.5} />
                Category
              </div>
              <div className="flex-1 px-1">
                <Select
                  value={selectedNote.category ?? "none"}
                  onValueChange={(val) =>
                    updateNote(selectedNote.id, {
                      category: val === "none" ? null : val || undefined,
                    })
                  }
                >
                  <SelectTrigger className="h-auto w-auto min-w-[72px] border-0 bg-transparent px-2 py-[7px] text-[13px] text-foreground/60 shadow-none focus:ring-0 focus:ring-offset-0 data-[placeholder]:text-muted-foreground/30 hover:text-foreground/80 transition-colors">
                    <SelectValue placeholder="Empty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-[13px]">None</SelectItem>
                    {settings.categories.map((c) => (
                      <SelectItem key={c} value={c} className="text-[13px]">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Visibility */}
            <div className="group/prop flex min-h-[32px] items-center rounded-md transition-colors duration-100 hover:bg-accent/25">
              <div className="flex w-[140px] shrink-0 items-center gap-2 px-2 py-[7px] text-[12.5px] font-medium text-muted-foreground/40 select-none">
                {selectedNote.visibility === "public"
                  ? <Globe className="size-3.5 shrink-0" strokeWidth={1.5} />
                  : <Lock className="size-3.5 shrink-0" strokeWidth={1.5} />}
                Visibility
              </div>
              <div className="flex-1 px-2">
                <button
                  type="button"
                  onClick={() =>
                    updateNote(selectedNote.id, {
                      visibility: selectedNote.visibility === "private" ? "public" : "private",
                    })
                  }
                  className="rounded px-1 py-[5px] text-[13px] capitalize text-foreground/55 transition-colors hover:bg-accent/50 hover:text-foreground/80"
                >
                  {selectedNote.visibility ?? "private"}
                </button>
              </div>
            </div>

            {/* Last edited — read-only */}
            <div className="flex min-h-[32px] items-center">
              <div className="flex w-[140px] shrink-0 items-center gap-2 px-2 py-[7px] text-[12.5px] font-medium text-muted-foreground/40 select-none">
                <CalendarDays className="size-3.5 shrink-0" strokeWidth={1.5} />
                Last edited
              </div>
              <div className="flex-1 px-2 py-[7px] text-[13px] text-muted-foreground/35 select-none">
                {formatDate(selectedNote.updatedAt)}
              </div>
            </div>

          </div>

          {/* Subtle divider before content */}
          <div className="mt-5 mb-1 border-t border-border/25" />
        </div>

        {/* ── Editor body ── */}
        <div className={cn(CONTENT_MAX, pad, "pt-3 pb-48")}>
          <RichEditor
            key={selectedNote.id}
            content={selectedNote.content}
            onChange={handleContentChange}
            placeholder="Start writing…"
          />
        </div>
      </div>
    </div>
  );
}
