"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Lock, Check, Clock, PenLine } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import { notesApi, type PublicNote } from "@/lib/api/notes";
import { RichEditor } from "@/components/notes/RichEditor";
import { buildExtensions } from "@/lib/editor-extensions";
import { usePresence } from "@/hooks/usePresence";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";
import { cn } from "@/lib/utils";

/* ── Anonymous viewer identity ───────────────────────────────────────── */

const AVATAR_COLORS = [
  "#5C7CFA", "#F06595", "#20C997", "#FCC419",
  "#74C0FC", "#A9E34B", "#FF6B6B", "#CC5DE8",
];

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return h;
}

function hashColor(str: string): string {
  return AVATAR_COLORS[Math.abs(hashStr(str)) % AVATAR_COLORS.length];
}

function getAnonymousViewer(): { name: string; color: string } {
  const key = "peblo:viewer";
  try {
    const stored = sessionStorage.getItem(key);
    if (stored) return JSON.parse(stored) as { name: string; color: string };
  } catch {}
  const name = uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: " ",
    style: "capital",
  });
  const color = AVATAR_COLORS[Math.abs(hashStr(name)) % AVATAR_COLORS.length];
  const identity = { name, color };
  try { sessionStorage.setItem(key, JSON.stringify(identity)); } catch {}
  return identity;
}

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ── Read-only Tiptap renderer ──────────────────────────────────────── */

function NoteViewer({ content }: { content: string }) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: buildExtensions(),
    content,
    editorProps: { attributes: { class: "tiptap focus:outline-none" } },
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  return <EditorContent editor={editor} />;
}

/* ── Page ─────────────────────────────────────────────────────────────── */

type Status = "loading" | "restricted" | "ready";

export default function SharedNotePage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<Status>("loading");
  const [note, setNote] = useState<PublicNote | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [viewer] = useState(getAnonymousViewer);
  const others = usePresence(token, viewer);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    notesApi
      .getPublic(token)
      .then((data) => {
        setNote(data);
        setTitle(data.title);
        setContent(data.content);
        setStatus("ready");
      })
      .catch(() => setStatus("restricted"));
  }, [token]);

  function handleContentChange(md: string) {
    setContent(md);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("saving");
    saveTimer.current = setTimeout(async () => {
      try {
        await notesApi.updatePublic(token, { title, content: md });
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2200);
      } catch {
        setSaveState("idle");
      }
    }, 900);
  }

  function handleTitleChange(next: string) {
    setTitle(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("saving");
    saveTimer.current = setTimeout(async () => {
      try {
        await notesApi.updatePublic(token, { title: next, content });
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2200);
      } catch {
        setSaveState("idle");
      }
    }, 900);
  }

  const isEditable = note?.shareLinkPermission === "edit";

  /* Loading */
  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="mx-auto w-full max-w-[720px] px-6 pt-20">
          <Skeleton className="mb-3 h-3 w-24" />
          <Skeleton className="mb-10 h-10 w-3/4" />
          <Skeleton className="mb-3 h-4 w-full" />
          <Skeleton className="mb-3 h-4 w-5/6" />
          <Skeleton className="mb-3 h-4 w-4/6" />
          <Skeleton className="mt-6 h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-3/4" />
        </div>
      </div>
    );
  }

  /* Restricted */
  if (status === "restricted") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-5 px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-accent">
          <Lock className="size-6 text-muted-foreground/40" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-[18px] font-semibold text-foreground">This note is private</h1>
          <p className="mt-1 max-w-xs text-[13px] text-muted-foreground/55">
            This link is no longer active or the note owner has restricted access.
          </p>
        </div>
        <a
          href="/"
          className="rounded-lg bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-80"
        >
          Go home
        </a>
      </div>
    );
  }

  const ownerColor = hashColor(note!.ownerName);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/40 bg-background/85 px-5 py-2.5 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="shrink-0 text-[13px] font-semibold tracking-tight text-foreground/70">
            Peblo
          </span>
          <span className="text-border/60">/</span>
          <span className="min-w-0 truncate text-[13px] text-muted-foreground/55">
            {title || "Untitled"}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {isEditable && saveState !== "idle" && (
            <span
              className={cn(
                "flex items-center gap-1.5 text-[12px] transition-all",
                saveState === "saved" ? "text-emerald-500" : "text-muted-foreground/40"
              )}
            >
              {saveState === "saved"
                ? <><Check className="size-3" strokeWidth={2.5} />Saved</>
                : "Saving…"}
            </span>
          )}

          {/* Other viewers — stacked avatars like Google Docs */}
          {others.length > 0 && (
            <div className="flex items-center">
              {others.slice(0, 4).map((v, i) => (
                <Tooltip key={v.id}>
                  <TooltipTrigger
                    render={
                      <div
                        className="flex size-7 cursor-default items-center justify-center rounded-full border-2 border-background text-[9px] font-semibold text-white transition-transform hover:z-10 hover:scale-110"
                        style={{ backgroundColor: v.color, marginLeft: i === 0 ? 0 : "-8px", zIndex: i }}
                      />
                    }
                  >
                    {initials(v.name)}
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[11.5px]">{v.name}</TooltipContent>
                </Tooltip>
              ))}
              {others.length > 4 && (
                <div
                  className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-accent text-[9px] font-semibold text-muted-foreground"
                  style={{ marginLeft: "-8px" }}
                >
                  +{others.length - 4}
                </div>
              )}
            </div>
          )}

          {/* Current viewer chip */}
          <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-accent/50 py-1 pl-1 pr-2.5">
            <div
              className="flex size-6 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white"
              style={{ backgroundColor: viewer.color }}
            >
              {initials(viewer.name)}
            </div>
            <span className="text-[11.5px] font-medium text-muted-foreground/70">{viewer.name}</span>
          </div>
        </div>
      </header>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-[720px] flex-1 px-6 pb-24 pt-14">

        {/* Author row */}
        <div className="mb-8 flex items-center gap-2.5">
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
            style={{ backgroundColor: ownerColor }}
          >
            {initials(note!.ownerName)}
          </div>
          <div>
            <span className="text-[13px] font-medium text-foreground/80">{note!.ownerName}</span>
            <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground/45">
              <Clock className="size-3" strokeWidth={1.5} />
              <span>Updated {timeAgo(note!.updatedAt)}</span>
              {isEditable && (
                <>
                  <span className="opacity-40">·</span>
                  <PenLine className="size-3" strokeWidth={1.5} />
                  <span>You can edit</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        {note!.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-1.5">
            {note!.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-border/50 bg-accent/60 px-2 py-0.5 text-[11.5px] text-muted-foreground/60"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        {isEditable ? (
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className="mb-6 w-full bg-transparent text-[36px] font-bold leading-tight tracking-[-0.02em] text-foreground outline-none placeholder:text-muted-foreground/25"
          />
        ) : (
          <h1 className="mb-6 text-[36px] font-bold leading-tight tracking-[-0.02em] text-foreground">
            {title || <span className="text-muted-foreground/30">Untitled</span>}
          </h1>
        )}

        {/* Content */}
        {isEditable ? (
          <RichEditor content={content} onChange={handleContentChange} />
        ) : (
          <NoteViewer content={content} />
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-border/30 px-6 py-4 text-center text-[11.5px] text-muted-foreground/35">
        Shared via <span className="font-medium text-muted-foreground/50">Peblo</span>
      </footer>
    </div>
  );
}
