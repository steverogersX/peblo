"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Archive, Trash2, Globe, Lock,
  MoreHorizontal, Loader2, RotateCcw,
  Maximize2, Minimize2, ArrowLeft,
  Tag, FolderOpen,
} from "lucide-react";
import { RichEditor } from "@/components/notes/RichEditor";
import { TagInput } from "@/components/notes/TagInput";
import { useNotes } from "@/contexts/NotesContext";
import { useSettings } from "@/contexts/SettingsContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SAVE_DELAY = 700;

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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const scheduleTitle = useCallback((val: string) => {
    setTitle(val);
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (selectedNote) {
        updateNote(selectedNote.id, { title: val });
        setSaveStatus("saved");
      }
    }, SAVE_DELAY);
  }, [selectedNote, updateNote, setSaveStatus]);

  const handleContentChange = useCallback((markdown: string) => {
    if (!selectedNote) return;
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      updateNote(selectedNote.id, { content: markdown });
      setSaveStatus("saved");
    }, SAVE_DELAY);
  }, [selectedNote, updateNote, setSaveStatus]);

  if (!selectedNote) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-background">
        <RotateCcw className="size-8 text-muted-foreground" strokeWidth={1} />
        <p className="text-[14px] text-muted-foreground">Select a note to start editing</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">

      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
        {focusMode ? (
          <button
            onClick={onToggleFocus}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" strokeWidth={1.5} />
            Notes
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            {saveStatus === "saving"
              ? <><Loader2 className="size-3 animate-spin" strokeWidth={1.5} />Saving…</>
              : <span className="text-muted-foreground/60">Saved</span>
            }
          </span>
        )}

        <div className="flex items-center gap-0.5">
          {focusMode && (
            <span className="mr-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
              {saveStatus === "saving"
                ? <><Loader2 className="size-3 animate-spin" strokeWidth={1.5} />Saving…</>
                : <span className="text-muted-foreground/60">Saved</span>
              }
            </span>
          )}

          <button
            onClick={onToggleFocus}
            title={focusMode ? "Exit focus mode (Esc)" : "Focus mode"}
            className="flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {focusMode
              ? <Minimize2 className="size-3.5" strokeWidth={1.5} />
              : <Maximize2 className="size-3.5" strokeWidth={1.5} />
            }
          </button>

          <button
            onClick={() =>
              updateNote(selectedNote.id, {
                visibility: selectedNote.visibility === "private" ? "public" : "private",
              })
            }
            className="flex items-center gap-1.5 rounded px-2 py-1 text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {selectedNote.visibility === "public"
              ? <Globe className="size-3.5" strokeWidth={1.5} />
              : <Lock className="size-3.5" strokeWidth={1.5} />}
            <span className="capitalize">{selectedNote.visibility}</span>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <MoreHorizontal className="size-4" strokeWidth={1.5} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-30 w-44 rounded-lg border border-border bg-popover py-1 shadow-lg">
                <button
                  onClick={() => { toggleArchive(selectedNote.id); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-foreground transition-colors hover:bg-accent"
                >
                  <Archive className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                  Archive
                </button>
                <div className="mx-2 my-0.5 h-px bg-border" />
                <button
                  onClick={() => { deleteNote(selectedNote.id); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-destructive transition-colors hover:bg-accent"
                >
                  <Trash2 className="size-3.5" strokeWidth={1.5} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Title + properties */}
        <div className={cn(
          "shrink-0 overflow-y-auto",
          focusMode ? "px-0 pt-16 pb-0" : "px-12 pt-10 pb-0"
        )}>
          <div className={cn(focusMode && "mx-auto w-full max-w-[720px] px-12")}>

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
                "placeholder:text-muted-foreground/30 transition-[font-size] duration-200",
                focusMode ? "text-[42px]" : "text-[36px]"
              )}
            />

            {/* Properties */}
            <div className="mt-6 space-y-1">
              <div className="flex items-start gap-3 group">
                <span className="flex w-28 shrink-0 items-center gap-1.5 py-0.5 text-[13px] text-muted-foreground">
                  <Tag className="size-3.5" strokeWidth={1.5} />
                  Tags
                </span>
                <div className="flex-1 py-0.5">
                  <TagInput
                    tags={selectedNote.tags}
                    suggestions={settings.tags}
                    onChange={(tags) => updateNote(selectedNote.id, { tags })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex w-28 shrink-0 items-center gap-1.5 text-[13px] text-muted-foreground">
                  <FolderOpen className="size-3.5" strokeWidth={1.5} />
                  Category
                </span>
                <Select
                  value={selectedNote.category ?? "none"}
                  onValueChange={(val) =>
                    updateNote(selectedNote.id, { category: val === "none" ? undefined : val || undefined })
                  }
                >
                  <SelectTrigger className="h-auto w-auto min-w-[100px] rounded border-0 bg-transparent px-2 py-1 text-[13px] text-foreground shadow-none transition-colors hover:bg-accent focus-visible:ring-0 focus-visible:ring-offset-0 data-[placeholder]:text-muted-foreground">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent className="border border-border bg-popover shadow-lg ring-0">
                    <SelectItem value="none" className="text-[13px] focus:bg-accent">None</SelectItem>
                    {settings.categories.map((c) => (
                      <SelectItem key={c} value={c} className="text-[13px] focus:bg-accent">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 border-t border-border" />
          </div>
        </div>

        {/* Rich editor */}
        <RichEditor
          key={selectedNote.id}
          content={selectedNote.content}
          onChange={handleContentChange}
          placeholder="Start writing…"
          className="flex-1 overflow-hidden"
          focusMode={focusMode}
        />
      </div>
    </div>
  );
}
