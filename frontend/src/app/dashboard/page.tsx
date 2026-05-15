"use client";

import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentNotes } from "@/components/dashboard/RecentNotes";
import { TopTags } from "@/components/dashboard/TopTags";
import { WeeklyActivity } from "@/components/dashboard/WeeklyActivity";
import { AIUsageCard } from "@/components/dashboard/AIUsageCard";
import { useAuth } from "@/contexts/AuthContext";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-col gap-6 px-8 py-8 xl:px-10">

      {/* ── Greeting ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.03em] text-foreground">
            {greeting()}, {firstName}
          </h1>
          <p className="mt-0.5 text-[13.5px] text-muted-foreground/55">
            Here&apos;s your workspace at a glance.
          </p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <DashboardStats />

      {/* ── Weekly chart (full width) ── */}
      <WeeklyActivity />

      {/* ── Bottom two-col grid ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* Left: recently edited */}
        <RecentNotes />

        {/* Right: AI usage + top tags */}
        <div className="flex flex-col gap-6">
          <AIUsageCard />
          <TopTags />
        </div>
      </div>

    </div>
  );
}
