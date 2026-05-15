"use client";

import { FileText, CalendarDays, BookOpen, Archive } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { useDashboard } from "@/contexts/DashboardContext";

function formatWords(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function DashboardStats() {
  const { insights, status } = useDashboard();
  const loading = status === "loading" || status === "idle";

  const active = insights ? insights.totalNotes - insights.archivedNotes : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total notes"
        value={active}
        description={`${insights?.archivedNotes ?? 0} archived`}
        icon={FileText}
        accent="blue"
        loading={loading}
      />
      <StatCard
        title="This week"
        value={insights?.notesThisWeek ?? 0}
        description="New notes in the last 7 days"
        icon={CalendarDays}
        accent="emerald"
        loading={loading}
      />
      <StatCard
        title="Words written"
        value={loading ? "—" : formatWords(insights?.wordsWritten ?? 0)}
        description="Across all active notes"
        icon={BookOpen}
        accent="violet"
        loading={loading}
      />
      <StatCard
        title="Archived"
        value={insights?.archivedNotes ?? 0}
        description="Moved out of main view"
        icon={Archive}
        accent="amber"
        loading={loading}
      />
    </div>
  );
}
