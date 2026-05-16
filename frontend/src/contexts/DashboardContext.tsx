"use client";

import {
  createContext, useContext, useState, useCallback,
  useMemo, useEffect, type ReactNode,
} from "react";
import type { ProductivityInsights, WeeklyActivity } from "@/lib/schemas/insights";
import { useNotes } from "@/contexts/NotesContext";
import { useAuth } from "@/contexts/AuthContext";
import { insightsApi } from "@/lib/api/insights";
import type { Note } from "@/lib/schemas/note";


type Status = "idle" | "loading" | "success" | "error";

interface DashboardContextValue {
  insights: ProductivityInsights | null;
  status: Status;
  error: string | null;
  lastRefreshed: Date | null;
  refresh: () => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);


function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function computeInsights(notes: Note[]): ProductivityInsights {
  const active = notes.filter((n) => !n.isArchived);
  const archived = notes.filter((n) => n.isArchived);
  const now = new Date();

  // Weekly activity — last 7 days
  const weeklyActivity: WeeklyActivity[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dateStr = day.toISOString().slice(0, 10);
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    weeklyActivity.push({
      date: label,
      notesCreated: active.filter((n) => n.createdAt.slice(0, 10) === dateStr).length,
      notesEdited: active.filter(
        (n) => n.updatedAt.slice(0, 10) === dateStr && n.createdAt.slice(0, 10) !== dateStr
      ).length,
    });
  }

  // Recently edited — top 5 by updatedAt
  const recentlyEditedNotes = [...active]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
    .map(({ id, title, updatedAt }) => ({ id, title, updatedAt }));

  // Most used tags — top 5
  const tagMap = new Map<string, number>();
  active.forEach((n) => n.tags.forEach((t) => tagMap.set(t, (tagMap.get(t) ?? 0) + 1)));
  const mostUsedTags = [...tagMap.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Derived counts
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const notesThisWeek = active.filter((n) => new Date(n.createdAt) >= weekAgo).length;
  const wordsWritten = active.reduce((sum, n) => sum + countWords(n.content), 0);

  // AI usage — derived from notes with aiSummary
  const withSummary = notes.filter((n) => Boolean(n.aiSummary));
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  return {
    totalNotes: notes.length,
    archivedNotes: archived.length,
    notesThisWeek,
    wordsWritten,
    recentlyEditedNotes,
    mostUsedTags,
    aiUsage: {
      totalRequests: withSummary.length,
      thisWeek: withSummary.filter((n) => new Date(n.updatedAt) >= weekAgo).length,
      thisMonth: withSummary.filter((n) => new Date(n.updatedAt) >= monthAgo).length,
    },
    weeklyActivity,
  };
}


export function DashboardProvider({ children }: { children: ReactNode }) {
  const { notes, loadStatus } = useNotes();
  const { user } = useAuth();
  const [apiInsights, setApiInsights] = useState<ProductivityInsights | null>(null);
  const [apiStatus, setApiStatus] = useState<Status>("idle");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!user) return;
    setApiStatus("loading");
    try {
      const { insights } = await insightsApi.get();
      setApiInsights(insights);
      setApiStatus("success");
      setLastRefreshed(new Date());
    } catch {
      // Fall back to client-computed insights if the API fails
      setApiStatus("error");
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (loadStatus === "success") fetchInsights();
  }, [loadStatus, fetchInsights]);

  // Use server insights when available, fall back to client-computed
  const clientInsights = useMemo(
    () => (loadStatus === "success" ? computeInsights(notes) : null),
    [notes, loadStatus]
  );

  const insights = apiInsights ?? clientInsights;

  const status: Status =
    apiStatus === "idle" || apiStatus === "loading" || loadStatus === "loading"
      ? "loading"
      : apiStatus === "success" || loadStatus === "success"
      ? "success"
      : "error";

  const refresh = useCallback(() => {
    fetchInsights();
  }, [fetchInsights]);

  return (
    <DashboardContext.Provider value={{ insights, status, error: null, lastRefreshed, refresh }}>
      {children}
    </DashboardContext.Provider>
  );
}


export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within a DashboardProvider");
  return ctx;
}
