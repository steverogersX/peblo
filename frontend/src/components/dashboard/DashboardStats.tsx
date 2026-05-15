"use client";

import { FileText, Archive, BrainCircuit, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { useDashboard } from "@/contexts/DashboardContext";

export function DashboardStats() {
  const { insights, status } = useDashboard();
  const loading = status === "loading" || status === "idle";

  const activeNotes = insights
    ? insights.totalNotes - insights.archivedNotes
    : 0;
  const weeklyEdits =
    insights?.weeklyActivity.reduce((s, d) => s + d.notesEdited, 0) ?? 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Notes"
        value={insights?.totalNotes ?? 0}
        description={`${activeNotes} active · ${insights?.archivedNotes ?? 0} archived`}
        icon={FileText}
        loading={loading}
      />
      <StatCard
        title="Archived"
        value={insights?.archivedNotes ?? 0}
        description="Moved to archive"
        icon={Archive}
        loading={loading}
      />
      <StatCard
        title="AI Summaries"
        value={insights?.aiUsage.totalRequests ?? 0}
        description={`${insights?.aiUsage.thisWeek ?? 0} generated this week`}
        icon={BrainCircuit}
        loading={loading}
      />
      <StatCard
        title="Weekly Edits"
        value={weeklyEdits}
        description="Notes edited this week"
        icon={TrendingUp}
        loading={loading}
      />
    </div>
  );
}
