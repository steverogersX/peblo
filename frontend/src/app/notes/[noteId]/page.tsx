"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NoteList } from "@/components/notes/NoteList";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { useNotes } from "@/contexts/NotesContext";
import { cn } from "@/lib/utils";

export default function NoteDetailPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const { selectNote, loadStatus, notes } = useNotes();
  const router = useRouter();
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    if (loadStatus !== "success") return;
    const exists = notes.some((n) => n.id === noteId);
    if (exists) {
      selectNote(noteId);
    } else {
      router.replace("/notes");
    }
  }, [noteId, loadStatus]); // eslint-disable-line

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && focusMode) setFocusMode(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode]);

  return (
    <>
      <div
        className={cn(
          "shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out",
          focusMode ? "w-0" : "w-[260px]"
        )}
      >
        <NoteList />
      </div>
      <NoteEditor
        focusMode={focusMode}
        onToggleFocus={() => setFocusMode((v) => !v)}
      />
    </>
  );
}
