import { z } from "zod";
import { NoteVisibilitySchema } from "@peblo/shared";
export { UpdateNoteSchema } from "@peblo/shared";
export type { UpdateNote as UpdateNoteInput } from "@peblo/shared";

// Backend-only: looser create schema — empty title allowed, optional client-provided id
export const CreateNoteSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().max(200).default(""),
  content: z.string().default(""),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  visibility: NoteVisibilitySchema.default("private"),
});

export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
