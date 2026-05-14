"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Archive, Trash2, Globe, Lock,
  MoreHorizontal, Check, Loader2, RotateCcw,
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

const SAVE_DELAY = 700;

function SaveBadge({ status }: { status: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-[#444748]">
      {status === "saving" ? (
        <><Loader2 className="size-3 animate-spin" strokeWidth={1.5} />Saving…</>
      ) : (
        <><Check className="size-3 text-[#508eff]" strokeWidth={2} />Saved</>
      )}
    </span>
  );
}

export function NoteEditor() {
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

  // Sync title when selected note changes
  useEffect(() => {
    if (selectedNote) setTitle(selectedNote.title);
  }, [selectedNote?.id]); // eslint-disable-line

  // Auto-focus title on new empty note
  useEffect(() => {
    if (selectedNote && !selectedNote.title && !selectedNote.content) {
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [selectedNote?.id]); // eslint-disable-line

  // Close menu on outside click
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
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#141313]">
        <div className="flex size-12 items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#1c1b1b]">
          <RotateCcw className="size-5 text-[#444748]" strokeWidth={1.5} />
        </div>
        <p className="text-[13px] text-[#444748]">Select a note or create one</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#141313]">

      {/* ── Top bar ─────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#2a2a2a] bg-[#141313] px-5 py-2.5">
        <SaveBadge status={saveStatus} />

        <div className="flex items-center gap-1.5">
          {/* Visibility */}
          <button
            onClick={() =>
              updateNote(selectedNote.id, {
                visibility: selectedNote.visibility === "private" ? "public" : "private",
              })
            }
            className="flex items-center gap-1.5 rounded border border-transparent px-2 py-1 text-[11px] text-[#8e9192] transition-colors hover:border-[#2a2a2a] hover:bg-[#1c1b1b]"
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
              className="flex size-7 items-center justify-center rounded border border-transparent text-[#444748] transition-colors hover:border-[#2a2a2a] hover:bg-[#1c1b1b] hover:text-[#8e9192]"
            >
              <MoreHorizontal className="size-4" strokeWidth={1.5} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-30 w-44 rounded-lg border border-[#2a2a2a] bg-[#1c1b1b] py-1 shadow-2xl shadow-black/60">
                <button
                  onClick={() => { toggleArchive(selectedNote.id); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] text-[#8e9192] transition-colors hover:bg-[#2a2a2a] hover:text-[#c4c7c8]"
                >
                  <Archive className="size-3.5" strokeWidth={1.5} />Archive
                </button>
                <div className="mx-2 my-0.5 h-px bg-[#2a2a2a]" />
                <button
                  onClick={() => { deleteNote(selectedNote.id); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] text-[#ffb4ab] transition-colors hover:bg-[#2a2a2a]"
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
        {/* Title + meta — above the toolbar */}
        <div className="shrink-0 border-b border-[#2a2a2a] px-8 pt-7 pb-5">
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
            className="w-full resize-none overflow-hidden bg-transparent text-[22px] font-semibold leading-snug tracking-[-0.035em] text-[#e5e2e1] outline-none placeholder:text-[#2a2a2a]"
          />

          {/* Meta */}
          <div className="mt-4 flex flex-wrap items-start gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium uppercase tracking-[0.07em] text-[#444748]">Tags</span>
              <TagInput
                tags={selectedNote.tags}
                suggestions={settings.tags}
                onChange={(tags) => updateNote(selectedNote.id, { tags })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium uppercase tracking-[0.07em] text-[#444748]">Category</span>
              <Select
                value={selectedNote.category ?? "none"}
                onValueChange={(val) =>
                  updateNote(selectedNote.id, { category: val === "none" ? undefined : val || undefined })
                }
              >
                <SelectTrigger className="h-auto w-auto min-w-[88px] rounded border border-[#2a2a2a] bg-[#1c1b1b] px-2.5 py-1.5 text-[12px] text-[#8e9192] transition-colors hover:border-[#353434] focus-visible:border-[#508eff] focus-visible:ring-0 focus-visible:ring-offset-0 data-[placeholder]:text-[#444748]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border border-[#2a2a2a] bg-[#1c1b1b] text-[#8e9192] shadow-xl shadow-black/50 ring-0">
                  <SelectItem value="none" className="text-[12px] focus:bg-[#2a2a2a] focus:text-[#c4c7c8]">None</SelectItem>
                  {settings.categories.map((c) => (
                    <SelectItem key={c} value={c} className="text-[12px] focus:bg-[#2a2a2a] focus:text-[#c4c7c8]">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tiptap editor (toolbar + content inside) */}
        <RichEditor
          key={selectedNote.id}
          content={selectedNote.content}
          onChange={handleContentChange}
          placeholder="Start writing… (supports Markdown)"
          className="flex-1 overflow-hidden"
        />
      </div>
    </div>
  );
}
