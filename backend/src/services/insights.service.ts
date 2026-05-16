import { eq } from "drizzle-orm";
import { db } from "../db";
import { notes } from "../db/schema";

export interface TagCount {
  tag: string;
  count: number;
}

export interface WeeklyActivityDay {
  date: string;
  notesCreated: number;
  notesEdited: number;
}

export interface AIUsageStats {
  totalRequests: number;
  thisWeek: number;
  thisMonth: number;
}

export interface RecentNote {
  id: string;
  title: string;
  updatedAt: string;
}

export interface ProductivityInsights {
  totalNotes: number;
  archivedNotes: number;
  notesThisWeek: number;
  wordsWritten: number;
  recentlyEditedNotes: RecentNote[];
  mostUsedTags: TagCount[];
  aiUsage: AIUsageStats;
  weeklyActivity: WeeklyActivityDay[];
}

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#*`_[\]()>~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getInsights(userId: string): Promise<ProductivityInsights> {
  const allNotes = await db.select().from(notes).where(eq(notes.userId, userId));

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const active = allNotes.filter((n) => !n.isArchived);
  const archived = allNotes.filter((n) => n.isArchived);

  // Weekly activity — last 7 days
  const weeklyActivity: WeeklyActivityDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dateStr = day.toISOString().slice(0, 10);
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    weeklyActivity.push({
      date: label,
      notesCreated: active.filter((n) => n.createdAt.toISOString().slice(0, 10) === dateStr).length,
      notesEdited: active.filter(
        (n) =>
          n.updatedAt.toISOString().slice(0, 10) === dateStr &&
          n.createdAt.toISOString().slice(0, 10) !== dateStr
      ).length,
    });
  }

  // Recently edited — top 5 by updatedAt
  const recentlyEditedNotes = [...active]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5)
    .map(({ id, title, updatedAt }) => ({ id, title, updatedAt: updatedAt.toISOString() }));

  // Most-used tags — top 5
  const tagMap = new Map<string, number>();
  active.forEach((n) => {
    const tags = (n.tags as string[]) ?? [];
    tags.forEach((t) => tagMap.set(t, (tagMap.get(t) ?? 0) + 1));
  });
  const mostUsedTags = [...tagMap.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const notesThisWeek = active.filter((n) => n.createdAt >= weekAgo).length;

  const wordsWritten = active.reduce((sum, n) => {
    const text = stripMarkdown(n.content || "");
    return sum + (text ? text.split(/\s+/).length : 0);
  }, 0);

  const withSummary = allNotes.filter((n) => Boolean(n.aiSummary));

  return {
    totalNotes: allNotes.length,
    archivedNotes: archived.length,
    notesThisWeek,
    wordsWritten,
    recentlyEditedNotes,
    mostUsedTags,
    aiUsage: {
      totalRequests: withSummary.length,
      thisWeek: withSummary.filter((n) => n.updatedAt >= weekAgo).length,
      thisMonth: withSummary.filter((n) => n.updatedAt >= monthAgo).length,
    },
    weeklyActivity,
  };
}
