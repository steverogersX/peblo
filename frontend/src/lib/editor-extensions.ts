import StarterKit from "@tiptap/starter-kit";
import { Paragraph } from "@tiptap/extension-paragraph";
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

// Extend Paragraph so that empty paragraphs are serialized as <p></p> in
// Markdown output. This prevents multiple blank lines from collapsing on
// round-trip since standard Markdown treats consecutive blank lines as one.
const MarkdownParagraph = Paragraph.extend({
  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          if (node.childCount === 0) {
            state.write("<p></p>");
            state.closeBlock(node);
          } else {
            state.renderInline(node);
            state.closeBlock(node);
          }
        },
      },
    };
  },
});

export function buildExtensions(placeholder = "Start writing…") {
  return [
    StarterKit.configure({
      // Disable StarterKit's bundled versions so we can configure our own
      link: false,
      underline: false,
      paragraph: false, // replaced by MarkdownParagraph below
      heading: { levels: [1, 2, 3] },
      bulletList: { keepMarks: true, keepAttributes: false },
      orderedList: { keepMarks: true, keepAttributes: false },
    }),
    MarkdownParagraph,
    Markdown.configure({
      html: true, // required so <p></p> round-trips correctly
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
