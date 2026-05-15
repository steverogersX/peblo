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

export const UpdateNoteSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().nullable().optional(),
  visibility: NoteVisibilitySchema.optional(),
  isArchived: z.boolean().optional(),
});

export type Note = z.infer<typeof NoteSchema>;
export type NoteVisibility = z.infer<typeof NoteVisibilitySchema>;
export type UpdateNote = z.infer<typeof UpdateNoteSchema>;
