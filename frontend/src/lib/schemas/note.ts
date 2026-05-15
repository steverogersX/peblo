import { z } from "zod";

export const NoteVisibilitySchema = z.enum(["private", "public"]);

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  category: z.string().optional(),
  visibility: NoteVisibilitySchema,
  isArchived: z.boolean(),
  aiSummary: z.string().optional(),
  aiActionItems: z.array(z.string()).optional(),
  aiGeneratedAt: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().default(""),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  visibility: NoteVisibilitySchema.default("private"),
});

export const UpdateNoteSchema = CreateNoteSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

export type Note = z.infer<typeof NoteSchema>;
export type NoteVisibility = z.infer<typeof NoteVisibilitySchema>;
export type CreateNote = z.infer<typeof CreateNoteSchema>;
export type UpdateNote = z.infer<typeof UpdateNoteSchema>;
