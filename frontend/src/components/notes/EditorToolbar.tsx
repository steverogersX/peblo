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
  return <span className="mx-0.5 h-4 w-px shrink-0 bg-[#2a2a2a]" />;
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
        "flex size-7 items-center justify-center rounded transition-colors",
        active
          ? "bg-[#2a2a2a] text-[#e5e2e1]"
          : "text-[#8e9192] hover:bg-[#2a2a2a] hover:text-[#c4c7c8]",
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
      <SelectTrigger className="h-7 w-[100px] border-[#2a2a2a] bg-[#1c1b1b] text-[11px] text-[#8e9192] hover:border-[#353434] hover:text-[#c4c7c8] focus:ring-0 focus:ring-offset-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-[#2a2a2a] bg-[#1c1b1b] text-[11px]">
        <SelectItem value="0" className="text-[#8e9192] focus:bg-[#2a2a2a] focus:text-[#c4c7c8]">Normal</SelectItem>
        <SelectItem value="1" className="text-[#8e9192] focus:bg-[#2a2a2a] focus:text-[#c4c7c8]">Heading 1</SelectItem>
        <SelectItem value="2" className="text-[#8e9192] focus:bg-[#2a2a2a] focus:text-[#c4c7c8]">Heading 2</SelectItem>
        <SelectItem value="3" className="text-[#8e9192] focus:bg-[#2a2a2a] focus:text-[#c4c7c8]">Heading 3</SelectItem>
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
    <div className="flex shrink-0 flex-wrap items-center gap-0.5 border-b border-[#2a2a2a] bg-[#141313] px-3 py-2">
      <TBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (⌘Z)">
        <Undo2 className="size-3.5" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (⌘⇧Z)">
        <Redo2 className="size-3.5" strokeWidth={1.5} />
      </TBtn>

      <Sep />
      <HeadingSelect editor={editor} />
      <Sep />

      <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (⌘B)">
        <Bold className="size-3.5" strokeWidth={2} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (⌘I)">
        <Italic className="size-3.5" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (⌘U)">
        <Underline className="size-3.5" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
        <Strikethrough className="size-3.5" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code">
        <Code className="size-3.5" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight">
        <Highlighter className="size-3.5" strokeWidth={1.5} />
      </TBtn>

      <Sep />

      <TBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">
        <AlignLeft className="size-3.5" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Center">
        <AlignCenter className="size-3.5" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">
        <AlignRight className="size-3.5" strokeWidth={1.5} />
      </TBtn>

      <Sep />

      <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
        <List className="size-3.5" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
        <ListOrdered className="size-3.5" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} title="Task list">
        <ListChecks className="size-3.5" strokeWidth={1.5} />
      </TBtn>

      <Sep />

      <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
        <Quote className="size-3.5" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">
        <CodeSquare className="size-3.5" strokeWidth={1.5} />
      </TBtn>
      <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
        <Minus className="size-3.5" strokeWidth={1.5} />
      </TBtn>

      <Sep />

      <TBtn onClick={() => setLink(editor)} active={editor.isActive("link")} title="Link (⌘K)">
        <Link2 className="size-3.5" strokeWidth={1.5} />
      </TBtn>
    </div>
  );
}
