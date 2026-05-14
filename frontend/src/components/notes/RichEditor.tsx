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
}

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
      onChangeRef.current(md);
    },
  });

  // Sync when a different note is selected
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
      {editor && <EditorToolbar editor={editor} />}

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <EditorContent editor={editor} />
      </div>

      {editor && (
        <div className="flex shrink-0 items-center justify-between border-t border-[#2a2a2a] px-6 py-2">
          <span className="font-mono text-[10px] text-[#444748]">
            {(editor.storage.characterCount as { words?: () => number } | undefined)?.words?.() ?? 0} words
            &nbsp;·&nbsp;
            {(editor.storage.characterCount as { characters?: () => number } | undefined)?.characters?.() ?? 0} chars
          </span>
        </div>
      )}
    </div>
  );
}
