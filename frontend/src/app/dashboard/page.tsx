import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentNotes } from "@/components/dashboard/RecentNotes";
import { TopTags } from "@/components/dashboard/TopTags";
import { WeeklyActivity } from "@/components/dashboard/WeeklyActivity";
import { AIUsageCard } from "@/components/dashboard/AIUsageCard";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#e5e2e1]">Overview</h2>
        <p className="text-[13px] text-[#8e9192]">
          Your notes workspace at a glance
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
