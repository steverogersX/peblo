"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { buildExtensions } from "@/lib/editor-extensions";
import { EditorToolbar } from "@/components/notes/EditorToolbar";
import { cn } from "@/lib/utils";

interface RichEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
  focusMode?: boolean;
}

const COLUMN = "mx-auto w-full max-w-[720px] px-12";

export function RichEditor({
  content,
  onChange,
  placeholder,
  className,
  focusMode = false,
}: RichEditorProps) {
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
    <div className={cn("flex flex-col overflow-hidden", className)}>

      {editor && (
        <div className="shrink-0 border-b border-border">
          <div className={cn(focusMode && COLUMN)}>
            <EditorToolbar editor={editor} />
          </div>
        </div>
      )}

      <div className={cn(
        "flex-1 overflow-y-auto",
        focusMode ? "px-0 py-8" : "px-12 py-6"
      )}>
        <div className={cn(focusMode && COLUMN)}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {editor && (
        <div className="shrink-0 border-t border-border px-12 py-2">
          <span className="text-[11px] text-muted-foreground">
            {(editor.storage.characterCount as { words?: () => number } | undefined)?.words?.() ?? 0} words
            {" · "}
            {(editor.storage.characterCount as { characters?: () => number } | undefined)?.characters?.() ?? 0} chars
          </span>
        </div>
      )}
    </div>
  );
}
