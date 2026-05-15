import { z } from "zod";

export const TagCountSchema = z.object({
  tag: z.string(),
  count: z.number().int().nonnegative(),
});

export const WeeklyActivitySchema = z.object({
  date: z.string(),
  notesCreated: z.number().int().nonnegative(),
  notesEdited: z.number().int().nonnegative(),
});

export const RecentNoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  updatedAt: z.string().datetime(),
});

export const AIUsageSchema = z.object({
  totalRequests: z.number().int().nonnegative(),
  thisWeek: z.number().int().nonnegative(),
  thisMonth: z.number().int().nonnegative(),
});

export const ProductivityInsightsSchema = z.object({
  totalNotes: z.number().int().nonnegative(),
  archivedNotes: z.number().int().nonnegative(),
  notesThisWeek: z.number().int().nonnegative(),
  wordsWritten: z.number().int().nonnegative(),
  recentlyEditedNotes: z.array(RecentNoteSchema),
  mostUsedTags: z.array(TagCountSchema),
  aiUsage: AIUsageSchema,
  weeklyActivity: z.array(WeeklyActivitySchema),
});

export type TagCount = z.infer<typeof TagCountSchema>;
export type WeeklyActivity = z.infer<typeof WeeklyActivitySchema>;
export type RecentNote = z.infer<typeof RecentNoteSchema>;
export type AIUsage = z.infer<typeof AIUsageSchema>;
export type ProductivityInsights = z.infer<typeof ProductivityInsightsSchema>;
