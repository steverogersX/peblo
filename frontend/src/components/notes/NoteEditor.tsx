"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Archive, Trash2, Globe, Lock,
  MoreHorizontal, Check, Loader2, RotateCcw,
  Maximize2, Minimize2, ArrowLeft,
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

function SaveBadge({ status }: { status: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-dim">
      {status === "saving" ? (
        <><Loader2 className="size-3 animate-spin" strokeWidth={1.5} />Saving…</>
      ) : (
        <><Check className="size-3 text-blue" strokeWidth={2} />Saved</>
      )}
    </span>
  );
}

export function NoteEditor({ focusMode = false, onToggleFocus }: NoteEditorProps) {
  const {
    selectedNote,
    updateNote,
    deleteNote,
    toggleArchive,
    setSaveStatus,
    saveStatus,
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
        <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-card">
          <RotateCcw className="size-5 text-dim" strokeWidth={1.5} />
        </div>
        <p className="text-[13px] text-dim">Select a note or create one</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">

      {/* ── Top bar ─────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-background px-4 py-2.5">

        {/* Left side */}
        {focusMode ? (
          <button
            onClick={onToggleFocus}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-[11px] text-dim transition-colors hover:bg-card hover:text-muted-foreground"
          >
            <ArrowLeft className="size-3.5" strokeWidth={1.5} />
            <span>Notes</span>
          </button>
        ) : (
          <SaveBadge status={saveStatus} />
        )}

        {/* Right side */}
        <div className="flex items-center gap-1">
          {focusMode && <SaveBadge status={saveStatus} />}

          {/* Focus mode toggle */}
          <button
            onClick={onToggleFocus}
            title={focusMode ? "Exit focus mode (Esc)" : "Focus mode"}
            className="flex size-7 items-center justify-center rounded border border-transparent text-dim transition-colors hover:border-border hover:bg-card hover:text-muted-foreground"
          >
            {focusMode
              ? <Minimize2 className="size-3.5" strokeWidth={1.5} />
              : <Maximize2 className="size-3.5" strokeWidth={1.5} />
            }
          </button>

          {/* Visibility */}
          <button
            onClick={() =>
              updateNote(selectedNote.id, {
                visibility: selectedNote.visibility === "private" ? "public" : "private",
              })
            }
            className="flex items-center gap-1.5 rounded border border-transparent px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:border-border hover:bg-card"
          >
            {selectedNote.visibility === "public"
              ? <Globe className="size-3.5" strokeWidth={1.5} />
              : <Lock className="size-3.5" strokeWidth={1.5} />}
            <span className="capitalize">{selectedNote.visibility}</span>
          </button>

          {/* More */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex size-7 items-center justify-center rounded border border-transparent text-dim transition-colors hover:border-border hover:bg-card hover:text-muted-foreground"
            >
              <MoreHorizontal className="size-4" strokeWidth={1.5} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-30 w-44 rounded-lg border border-border bg-card py-1 shadow-2xl shadow-black/20">
                <button
                  onClick={() => { toggleArchive(selectedNote.id); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-subtle"
                >
                  <Archive className="size-3.5" strokeWidth={1.5} />Archive
                </button>
                <div className="mx-2 my-0.5 h-px bg-border" />
                <button
                  onClick={() => { deleteNote(selectedNote.id); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] text-destructive transition-colors hover:bg-accent"
                >
                  <Trash2 className="size-3.5" strokeWidth={1.5} />Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Scrollable body ──────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Title + meta */}
        <div
          className={cn(
            "shrink-0 border-b border-border transition-[padding] duration-200",
            focusMode ? "pt-10 pb-6 px-0" : "px-8 pt-7 pb-5"
          )}
        >
          <div className={cn(focusMode && "mx-auto w-full max-w-[700px] px-8")}>
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
                "w-full resize-none overflow-hidden bg-transparent font-semibold leading-snug tracking-[-0.035em] text-foreground outline-none placeholder:text-border-strong transition-[font-size] duration-200",
                focusMode ? "text-[28px]" : "text-[22px]"
              )}
            />

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-start gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-medium uppercase tracking-[0.07em] text-dim">Tags</span>
                <TagInput
                  tags={selectedNote.tags}
                  suggestions={settings.tags}
                  onChange={(tags) => updateNote(selectedNote.id, { tags })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-medium uppercase tracking-[0.07em] text-dim">Category</span>
                <Select
                  value={selectedNote.category ?? "none"}
                  onValueChange={(val) =>
                    updateNote(selectedNote.id, { category: val === "none" ? undefined : val || undefined })
                  }
                >
                  <SelectTrigger className="h-auto w-auto min-w-[88px] rounded border border-border bg-card px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-border-strong focus-visible:border-blue focus-visible:ring-0 focus-visible:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border border-border bg-card text-muted-foreground shadow-xl shadow-black/10 ring-0">
                    <SelectItem value="none" className="text-[12px] focus:bg-accent focus:text-subtle">None</SelectItem>
                    {settings.categories.map((c) => (
                      <SelectItem key={c} value={c} className="text-[12px] focus:bg-accent focus:text-subtle">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Rich editor */}
        <RichEditor
          key={selectedNote.id}
          content={selectedNote.content}
          onChange={handleContentChange}
          placeholder="Start writing… (supports Markdown)"
          className="flex-1 overflow-hidden"
          focusMode={focusMode}
        />
      </div>
    </div>
  );
}
