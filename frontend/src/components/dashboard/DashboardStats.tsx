"use client";

import { FileText, Archive, CalendarDays, BookOpen } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { useDashboard } from "@/contexts/DashboardContext";

function formatWords(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function DashboardStats() {
  const { insights, status } = useDashboard();
  const loading = status === "loading" || status === "idle";

  const activeNotes = insights ? insights.totalNotes - insights.archivedNotes : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Notes"
        value={activeNotes}
        description={`${insights?.archivedNotes ?? 0} archived`}
        icon={FileText}
        loading={loading}
      />
      <StatCard
        title="This week"
        value={insights?.notesThisWeek ?? 0}
        description="New notes in the last 7 days"
        icon={CalendarDays}
        loading={loading}
      />
      <StatCard
        title="Words written"
        value={loading ? 0 : formatWords(insights?.wordsWritten ?? 0)}
        description="Across all active notes"
        icon={BookOpen}
        loading={loading}
      />
      <StatCard
        title="Archived"
        value={insights?.archivedNotes ?? 0}
        description="Moved to archive"
        icon={Archive}
        loading={loading}
      />
    </div>
  );
}
