import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import TextAlign from "@tiptap/extension-text-align";
import { Markdown } from "tiptap-markdown";

export function buildExtensions(placeholder = "Start writing…") {
  return [
    StarterKit.configure({
      // Disable StarterKit's bundled versions so we can configure our own
      link: false,
      underline: false,
      heading: { levels: [1, 2, 3] },
      bulletList: { keepMarks: true, keepAttributes: false },
      orderedList: { keepMarks: true, keepAttributes: false },
    }),
    Markdown.configure({
      html: false,
      transformCopiedText: true,
      transformPastedText: true,
    }),
    Placeholder.configure({ placeholder }),
    CharacterCount,
    Underline,
    TaskList,
    TaskItem.configure({ nested: true }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
    }),
    Highlight.configure({ multicolor: false }),
    Typography,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
  ];
}
