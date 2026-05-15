import { z } from "zod";
export {
  NoteSchema,
  NoteVisibilitySchema,
  UpdateNoteSchema,
} from "@peblo/shared";
export type { Note, NoteVisibility, UpdateNote } from "@peblo/shared";

// Frontend-only: stricter create validation for the UI form
export const CreateNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().default(""),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  visibility: z.enum(["private", "public"]).default("private"),
});

export type CreateNote = z.infer<typeof CreateNoteSchema>;
