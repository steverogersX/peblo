"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Archive, Trash2, Globe, Lock,
  MoreHorizontal, Loader2, FileText,
  Maximize2, Minimize2, ArrowLeft,
  Tag, FolderOpen, ChevronRight,
} from "lucide-react";
import { RichEditor } from "@/components/notes/RichEditor";
import { TagInput } from "@/components/notes/TagInput";
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
const CONTENT_MAX = "mx-auto w-full max-w-[1020px]";

interface NoteEditorProps {
  focusMode?: boolean;
  onToggleFocus?: () => void;
}

export function NoteEditor({ focusMode = false, onToggleFocus }: NoteEditorProps) {
  const {
    selectedNote, updateNote, deleteNote, toggleArchive,
    setSaveStatus, saveStatus,
  } = useNotes();
  const { settings } = useSettings();

  const [title, setTitle] = useState("");
  const [propsOpen, setPropsOpen] = useState(true);
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

  const pad = focusMode ? "px-16" : "px-14";

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">

      {/* ── Minimal top bar ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-3 py-1.5">

        {focusMode ? (
          <Button variant="ghost" size="sm" onClick={onToggleFocus} className="gap-1.5 text-[13px] text-muted-foreground">
            <ArrowLeft className="size-3.5" strokeWidth={1.5} />
            Notes
          </Button>
        ) : (
          <span className="select-none text-[12px] text-muted-foreground/40">
            {saveStatus === "saving" ? (
              <span className="flex items-center gap-1">
                <Loader2 className="size-3 animate-spin" strokeWidth={1.5} />
                Saving…
              </span>
            ) : "Saved"}
          </span>
        )}

        <div className="flex items-center gap-0.5">
          {focusMode && (
            <span className="mr-2 select-none text-[12px] text-muted-foreground/40">
              {saveStatus === "saving" ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin" strokeWidth={1.5} />
                  Saving…
                </span>
              ) : "Saved"}
            </span>
          )}

          {/* Focus mode toggle with tooltip */}
          <Tooltip>
            <TooltipTrigger
              onClick={onToggleFocus}
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "text-muted-foreground")}
            >
              {focusMode
                ? <Minimize2 className="size-3.5" strokeWidth={1.5} />
                : <Maximize2 className="size-3.5" strokeWidth={1.5} />}
            </TooltipTrigger>
            <TooltipContent className="text-[12px]">
              {focusMode ? "Exit focus mode (Esc)" : "Focus mode"}
            </TooltipContent>
          </Tooltip>

          {/* Actions kebab */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "text-muted-foreground")}
            >
              <MoreHorizontal className="size-4" strokeWidth={1.5} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" sideOffset={6} className="w-52">
              <DropdownMenuItem
                onClick={() =>
                  updateNote(selectedNote.id, {
                    visibility: selectedNote.visibility === "private" ? "public" : "private",
                  })
                }
                className="gap-2 text-[13px]"
              >
                {selectedNote.visibility === "public"
                  ? <Globe className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                  : <Lock className="size-3.5 text-muted-foreground" strokeWidth={1.5} />}
                Make {selectedNote.visibility === "public" ? "private" : "public"}
              </DropdownMenuItem>
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

      {/* ── Single scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className={cn(CONTENT_MAX, pad, "pt-16 pb-2")}>

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
              "w-full resize-none overflow-hidden bg-transparent font-bold leading-tight tracking-[-0.03em] text-foreground outline-none",
              "placeholder:text-muted-foreground/20",
              focusMode ? "text-[46px]" : "text-[40px]"
            )}
          />

          {/* ── Properties ── */}
          <div className="mt-5">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setPropsOpen((v) => !v)}
              className="gap-1 text-[12px] text-muted-foreground/40 hover:text-muted-foreground/70 px-1"
            >
              <ChevronRight
                className={cn("size-3 transition-transform duration-150", propsOpen && "rotate-90")}
                strokeWidth={1.5}
              />
              {propsOpen ? "Properties" : "Show properties"}
            </Button>

            {propsOpen && (
              <div className="mt-2 space-y-0.5">
                {/* Tags row */}
                <div className="group/row -mx-2 flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent/50">
                  <span className="flex w-28 shrink-0 items-center gap-1.5 pt-0.5 text-[13px] text-muted-foreground/70">
                    <Tag className="size-3.5" strokeWidth={1.5} />
                    Tags
                  </span>
                  <div className="min-w-0 flex-1">
                    <TagInput
                      tags={selectedNote.tags}
                      suggestions={settings.tags}
                      onChange={(tags) => updateNote(selectedNote.id, { tags })}
                    />
                  </div>
                </div>

                {/* Category row */}
                <div className="group/row -mx-2 flex items-center gap-2 rounded-md px-2 transition-colors hover:bg-accent/50">
                  <span className="flex w-28 shrink-0 items-center gap-1.5 text-[13px] text-muted-foreground/70">
                    <FolderOpen className="size-3.5" strokeWidth={1.5} />
                    Category
                  </span>
                  <Select
                    value={selectedNote.category ?? "none"}
                    onValueChange={(val) =>
                      updateNote(selectedNote.id, {
                        category: val === "none" ? null : val || undefined,
                      })
                    }
                  >
                    <SelectTrigger className="h-auto w-auto min-w-0 border-0 bg-transparent px-2 py-1.5 text-[13px] shadow-none focus:ring-0 focus:ring-offset-0 data-[placeholder]:text-muted-foreground/50">
                      <SelectValue placeholder="None" />
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
            )}
          </div>

          <div className="mt-6 border-t border-border/40" />
        </div>

        {/* ── Editor content ── */}
        <div className={cn(CONTENT_MAX, pad, "pt-5 pb-40")}>
          <RichEditor
            key={selectedNote.id}
            content={selectedNote.content}
            onChange={handleContentChange}
            placeholder="Start writing… (select text for formatting)"
          />
        </div>
      </div>
    </div>
  );
}
