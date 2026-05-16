"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NoteList } from "@/components/notes/NoteList";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { NoteAISidebar } from "@/components/notes/NoteAISidebar";
import { useNotes } from "@/contexts/NotesContext";
import { cn } from "@/lib/utils";

const AI_MIN = 260;
const AI_MAX = 480;
const AI_DEFAULT = 300;

export default function NoteDetailPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const { selectNote, loadStatus, notes, selectedNote, patchNote, updateNote } = useNotes();
  const router = useRouter();

  const [focusMode, setFocusMode] = useState(false);
  const [showAISidebar, setShowAISidebar] = useState(false);
  const [aiWidth, setAiWidth] = useState(AI_DEFAULT);

  useEffect(() => {
    if (loadStatus !== "success") return;
    const exists = notes.some((n) => n.id === noteId);
    if (exists) selectNote(noteId);
    else router.replace("/notes");
  }, [noteId, loadStatus]); // eslint-disable-line

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (focusMode) setFocusMode(false);
        else if (showAISidebar) setShowAISidebar(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode, showAISidebar]);

  useEffect(() => {
    if (!selectedNote) setShowAISidebar(false);
  }, [selectedNote]);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = aiWidth;

    const onMove = (mv: MouseEvent) => {
      const w = Math.min(AI_MAX, Math.max(AI_MIN, startW - (mv.clientX - startX)));
      setAiWidth(w);
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [aiWidth]);

  const aiSidebarOpen = showAISidebar && !!selectedNote;

  return (
    <>
      {/* Note list */}
      <div
        className={cn(
          "shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out",
          focusMode ? "w-0" : "w-[260px]"
        )}
      >
        <NoteList />
      </div>

      {/* Editor */}
      <NoteEditor
        focusMode={focusMode}
        onToggleFocus={() => setFocusMode((v) => !v)}
        showAISidebar={showAISidebar}
        onToggleAISidebar={() => setShowAISidebar((v) => !v)}
      />

      {/* AI Sidebar — desktop: always in DOM so width transition always plays */}
      <div
        className="hidden md:flex shrink-0 h-full overflow-hidden"
        style={{
          width: aiSidebarOpen ? aiWidth : 0,
          transition: "width 300ms ease-in-out",
        }}
      >
        <div
          className="flex h-full border-l border-border/40"
          style={{ width: aiWidth, minWidth: aiWidth }}
        >
          <div
            onMouseDown={startResize}
            className="w-1 shrink-0 cursor-col-resize group relative"
            title="Drag to resize"
          >
            <div className="absolute inset-y-0 left-0 w-px bg-border/40 group-hover:bg-[#508eff]/40 transition-colors duration-150" />
          </div>
          <div className="flex-1 overflow-hidden min-w-0">
            {selectedNote && (
              <NoteAISidebar
                note={selectedNote}
                onClose={() => setShowAISidebar(false)}
                onSummaryGenerated={(patch) => patchNote(selectedNote.id, patch)}
                onApplyTitle={(title) => updateNote(selectedNote.id, { title })}
              />
            )}
          </div>
        </div>
      </div>

      {/* AI Sidebar — mobile: always in DOM so transform transition always plays */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 flex justify-end",
          aiSidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          style={{
            opacity: aiSidebarOpen ? 1 : 0,
            transition: "opacity 300ms ease-in-out",
          }}
          onClick={() => setShowAISidebar(false)}
        />
        <div
          className="relative h-full w-80 max-w-[85vw] bg-background shadow-2xl"
          style={{
            transform: aiSidebarOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 300ms ease-in-out",
          }}
        >
          {selectedNote && (
            <NoteAISidebar
              note={selectedNote}
              onClose={() => setShowAISidebar(false)}
              onSummaryGenerated={(patch) => patchNote(selectedNote.id, patch)}
              onApplyTitle={(title) => updateNote(selectedNote.id, { title })}
            />
          )}
        </div>
      </div>
    </>
  );
}
