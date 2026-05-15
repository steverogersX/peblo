"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold, Italic, Underline, Strikethrough,
  Code, CodeSquare, Quote,
  List, ListOrdered, ListChecks,
  AlignLeft, AlignCenter, AlignRight,
  Link2, Highlighter,
  Undo2, Redo2, Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Sep() {
  return <span className="mx-1 h-3.5 w-px shrink-0 bg-border" />;
}

interface TBtnProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function TBtn({ onClick, active, disabled, title, children }: TBtnProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      className={cn(
        "flex size-6 items-center justify-center rounded transition-colors",
        active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        disabled && "pointer-events-none opacity-30"
      )}
    >
      {children}
    </button>
  );
}

function HeadingSelect({ editor }: { editor: Editor }) {
  function getCurrent() {
    if (editor.isActive("heading", { level: 1 })) return "1";
    if (editor.isActive("heading", { level: 2 })) return "2";
    if (editor.isActive("heading", { level: 3 })) return "3";
    return "0";
  }

  function onChange(v: string | null) {
    if (!v || v === "0") editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level: parseInt(v) as 1 | 2 | 3 }).run();
  }

  return (
    <Select value={getCurrent()} onValueChange={onChange}>
      <SelectTrigger className="h-6 w-[88px] border-0 bg-transparent text-[12px] text-muted-foreground shadow-none hover:bg-accent hover:text-foreground focus:ring-0 focus:ring-offset-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-border bg-popover text-[13px] shadow-lg">
        <SelectItem value="0" className="text-foreground focus:bg-accent">Normal</SelectItem>
        <SelectItem value="1" className="text-foreground focus:bg-accent">Heading 1</SelectItem>
        <SelectItem value="2" className="text-foreground focus:bg-accent">Heading 2</SelectItem>
        <SelectItem value="3" className="text-foreground focus:bg-accent">Heading 3</SelectItem>
      </SelectContent>
    </Select>
  );
}

function setLink(editor: Editor) {
  const prev = editor.getAttributes("link").href as string | undefined;
  const url = window.prompt("URL", prev ?? "https://");
  if (url === null) return;
  if (!url) { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
  editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
}

export function EditorToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-0.5 bg-background px-3 py-1.5">
      <TBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
        <Undo2 className="size-3" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
        <Redo2 className="size-3" strokeWidth={1.5} />
      </TBtn>

      <Sep />
      <HeadingSelect editor={editor} />
      <Sep />

      <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (⌘B)">
        <Bold className="size-3" strokeWidth={2} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (⌘I)">
        <Italic className="size-3" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (⌘U)">
        <Underline className="size-3" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
        <Strikethrough className="size-3" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code">
        <Code className="size-3" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight">
        <Highlighter className="size-3" strokeWidth={1.5} />
      </TBtn>

      <Sep />

      <TBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">
        <AlignLeft className="size-3" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Center">
        <AlignCenter className="size-3" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">
        <AlignRight className="size-3" strokeWidth={1.5} />
      </TBtn>

      <Sep />

      <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
        <List className="size-3" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
        <ListOrdered className="size-3" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} title="Task list">
        <ListChecks className="size-3" strokeWidth={1.5} />
      </TBtn>

      <Sep />

      <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
        <Quote className="size-3" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">
        <CodeSquare className="size-3" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
        <Minus className="size-3" strokeWidth={1.5} />
      </TBtn>

      <Sep />

      <TBtn onClick={() => setLink(editor)} active={editor.isActive("link")} title="Link (⌘K)">
        <Link2 className="size-3" strokeWidth={1.5} />
      </TBtn>
    </div>
  );
}
