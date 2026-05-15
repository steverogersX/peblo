import type { ProductivityInsights } from "@/lib/schemas/insights";

export const MOCK_INSIGHTS: ProductivityInsights = {
  totalNotes: 24,
  archivedNotes: 3,
  notesThisWeek: 5,
  wordsWritten: 3840,
  recentlyEditedNotes: [
    {
      id: "n1",
      title: "Sprint Planning — May 2026",
      updatedAt: "2026-05-14T10:00:00Z",
    },
    {
      id: "n2",
      title: "API Architecture Review",
      updatedAt: "2026-05-14T08:30:00Z",
    },
    {
      id: "n3",
      title: "User Research Findings",
      updatedAt: "2026-05-13T17:45:00Z",
    },
    {
      id: "n4",
      title: "Onboarding Flow Ideas",
      updatedAt: "2026-05-13T14:00:00Z",
    },
    {
      id: "n5",
      title: "Weekly Retro Notes",
      updatedAt: "2026-05-12T09:00:00Z",
    },
  ],
  mostUsedTags: [
    { tag: "work", count: 12 },
    { tag: "meeting", count: 8 },
    { tag: "ideas", count: 6 },
    { tag: "research", count: 4 },
    { tag: "personal", count: 3 },
  ],
  aiUsage: {
    totalRequests: 47,
    thisWeek: 12,
    thisMonth: 31,
  },
  weeklyActivity: [
    { date: "Mon", notesCreated: 2, notesEdited: 5 },
    { date: "Tue", notesCreated: 1, notesEdited: 3 },
    { date: "Wed", notesCreated: 4, notesEdited: 7 },
    { date: "Thu", notesCreated: 0, notesEdited: 2 },
    { date: "Fri", notesCreated: 3, notesEdited: 4 },
    { date: "Sat", notesCreated: 1, notesEdited: 1 },
    { date: "Sun", notesCreated: 0, notesEdited: 0 },
  ],
};
