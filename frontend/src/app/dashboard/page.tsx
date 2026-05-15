"use client";

import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentNotes } from "@/components/dashboard/RecentNotes";
import { TopTags } from "@/components/dashboard/TopTags";
import { WeeklyActivity } from "@/components/dashboard/WeeklyActivity";
import { AIUsageCard } from "@/components/dashboard/AIUsageCard";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 px-10 py-10">
      <div>
        <h2 className="text-[24px] font-bold tracking-[-0.025em] text-foreground">
          {greeting()}, John
        </h2>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          Here&apos;s what&apos;s happening in your workspace today.
        </p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <WeeklyActivity />
          <RecentNotes />
        </div>
        <div className="flex flex-col gap-6">
          <AIUsageCard />
          <TopTags />
        </div>
      </div>
    </div>
  );
}
