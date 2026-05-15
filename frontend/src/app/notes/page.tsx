"use client";

import { useState, useEffect } from "react";
import { NoteList } from "@/components/notes/NoteList";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { cn } from "@/lib/utils";

export default function NotesPage() {
  const [focusMode, setFocusMode] = useState(false);

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
