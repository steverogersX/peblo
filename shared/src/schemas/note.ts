import { z } from "zod";

export const NoteVisibilitySchema = z.enum(["private", "public"]);
export const ShareLinkPermissionSchema = z.enum(["none", "view", "edit"]);

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  category: z.string().nullable().optional(),
  visibility: NoteVisibilitySchema,
  isArchived: z.boolean(),
  shareLinkPermission: ShareLinkPermissionSchema.default("none"),
  shareToken: z.string().nullable().optional(),
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
  isArchived: z.boolean().optional(),
  shareLinkPermission: ShareLinkPermissionSchema.optional(),
});

export type Note = z.infer<typeof NoteSchema>;
export type NoteVisibility = z.infer<typeof NoteVisibilitySchema>;
export type UpdateNote = z.infer<typeof UpdateNoteSchema>;
export type ShareLinkPermission = z.infer<typeof ShareLinkPermissionSchema>;
