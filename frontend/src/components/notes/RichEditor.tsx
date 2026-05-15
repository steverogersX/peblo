"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { buildExtensions } from "@/lib/editor-extensions";
import {
  Bold, Italic, Underline, Strikethrough,
  Code, Highlighter, Link2, CodeSquare, Quote,
  List, ListOrdered, ListChecks,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RichEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
}

// ── Toolbar button (shadcn Button + Tooltip) ──────────────────────────────
function ToolBtn({
  onClick, active, label, children,
}: {
  onClick: () => void; active?: boolean; label: string; children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        onMouseDown={(e) => { e.preventDefault(); onClick(); }}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "text-white/65 hover:bg-white/12 hover:text-white",
          active && "bg-white/18 text-white"
        )}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-[11px]">{label}</TooltipContent>
    </Tooltip>
  );
}

function HeadingBtn({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  const active = editor.isActive("heading");
  const label =
    editor.isActive("heading", { level: 1 }) ? "H1" :
    editor.isActive("heading", { level: 2 }) ? "H2" :
    editor.isActive("heading", { level: 3 }) ? "H3" : "T";

  function cycle() {
    if (label === "T") editor.chain().focus().toggleHeading({ level: 1 }).run();
    else if (label === "H1") editor.chain().focus().toggleHeading({ level: 2 }).run();
    else if (label === "H2") editor.chain().focus().toggleHeading({ level: 3 }).run();
    else editor.chain().focus().setParagraph().run();
  }

  return (
    <Tooltip>
      <TooltipTrigger
        onMouseDown={(e) => { e.preventDefault(); cycle(); }}
        className={cn(
          buttonVariants({ variant: "ghost", size: "xs" }),
          "min-w-[1.75rem] px-1 text-[11px] font-bold",
          "text-white/65 hover:bg-white/12 hover:text-white",
          active && "bg-white/18 text-white"
        )}
      >
        {label}
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-[11px]">
        Cycle heading (T → H1 → H2 → H3)
      </TooltipContent>
    </Tooltip>
  );
}

// ── Floating selection toolbar ────────────────────────────────────────────
function FloatingToolbar({ editor }: { editor: ReturnType<typeof useEditor> | null }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const recalc = useCallback(() => {
    if (!editor) return;
    const { state, view } = editor;
    const { from, to } = state.selection;
    if (from === to || !view.hasFocus()) { setPos(null); return; }

    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    const toolbar = toolbarRef.current;
    const tbW = toolbar?.offsetWidth ?? 340;
    const tbH = toolbar?.offsetHeight ?? 36;

    const midX = (start.left + end.left) / 2;
    const topY = Math.min(start.top, end.top);

    setPos({
      left: Math.max(8, Math.min(midX - tbW / 2, window.innerWidth - tbW - 8)),
      top: topY - tbH - 10 + window.scrollY,
    });
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    editor.on("selectionUpdate", recalc);
    editor.on("focus", recalc);
    editor.on("blur", () => setPos(null));
    return () => {
      editor.off("selectionUpdate", recalc);
      editor.off("focus", recalc);
      editor.off("blur");
    };
  }, [editor, recalc]);

  if (!pos || !editor || typeof document === "undefined") return null;

  function setLink() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "https://");
    if (url === null) return;
    if (!url) { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return createPortal(
    <div
      ref={toolbarRef}
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
      onMouseDown={(e) => e.preventDefault()}
      className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-[#1c1c1c] px-1.5 py-1 shadow-2xl"
    >
      <HeadingBtn editor={editor} />
      <Separator orientation="vertical" className="mx-0.5 h-4 bg-white/15" />
      <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="Bold (⌘B)">
        <Bold className="size-3.5" strokeWidth={2} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="Italic (⌘I)">
        <Italic className="size-3.5" strokeWidth={1.5} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} label="Underline (⌘U)">
        <Underline className="size-3.5" strokeWidth={1.5} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} label="Strikethrough">
        <Strikethrough className="size-3.5" strokeWidth={1.5} />
      </ToolBtn>
      <Separator orientation="vertical" className="mx-0.5 h-4 bg-white/15" />
      <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} label="Inline code">
        <Code className="size-3.5" strokeWidth={1.5} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} label="Highlight">
        <Highlighter className="size-3.5" strokeWidth={1.5} />
      </ToolBtn>
      <ToolBtn onClick={setLink} active={editor.isActive("link")} label="Link (⌘K)">
        <Link2 className="size-3.5" strokeWidth={1.5} />
      </ToolBtn>
      <Separator orientation="vertical" className="mx-0.5 h-4 bg-white/15" />
      <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="Bullet list">
        <List className="size-3.5" strokeWidth={1.5} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="Numbered list">
        <ListOrdered className="size-3.5" strokeWidth={1.5} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} label="Task list">
        <ListChecks className="size-3.5" strokeWidth={1.5} />
      </ToolBtn>
      <Separator orientation="vertical" className="mx-0.5 h-4 bg-white/15" />
      <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="Quote">
        <Quote className="size-3.5" strokeWidth={1.5} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} label="Code block">
        <CodeSquare className="size-3.5" strokeWidth={1.5} />
      </ToolBtn>
    </div>,
    document.body
  );
}

// ── Main RichEditor ───────────────────────────────────────────────────────
export function RichEditor({ content, onChange, placeholder, className }: RichEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: buildExtensions(placeholder),
    content,
    editorProps: {
      attributes: { class: "tiptap focus:outline-none" },
    },
    onUpdate({ editor }) {
      // @ts-expect-error tiptap-markdown storage
      const md: string = editor.storage.markdown.getMarkdown();
      contentRef.current = md; // prevent the sync effect from calling setContent after debounced save
      onChangeRef.current(md);
    },
  });

  const contentRef = useRef(content);
  useEffect(() => {
    if (!editor || content === contentRef.current) return;
    contentRef.current = content;
    const { from, to } = editor.state.selection;
    editor.commands.setContent(content);
    const size = editor.state.doc.content.size;
    editor.commands.setTextSelection({
      from: Math.min(from, size),
      to: Math.min(to, size),
    });
  }, [editor, content]);

  return (
    <div className={cn("relative", className)}>
      <FloatingToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
