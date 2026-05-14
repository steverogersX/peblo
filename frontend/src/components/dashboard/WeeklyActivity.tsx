"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/contexts/DashboardContext";

const SKELETON_HEIGHTS = [72, 48, 96, 56, 80, 40, 64];

const TOOLTIP_STYLE = {
  background: "#1c1b1b",
  border: "1px solid #2a2a2a",
  borderRadius: "8px",
  fontSize: "12px",
  fontFamily: "var(--font-sans)",
  color: "#e5e2e1",
  boxShadow: "none",
  padding: "8px 12px",
};

export function WeeklyActivity() {
  const { insights, status } = useDashboard();
  const loading = status === "loading" || status === "idle";

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1c1b1b]">
      <div className="flex items-center justify-between border-b border-[#2a2a2a] px-5 py-4">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-[#444748]" strokeWidth={1.5} />
          <span className="text-[13px] font-semibold tracking-[-0.01em] text-[#e5e2e1]">
            Weekly Activity
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-[#8e9192]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-[#c6c6c7]" />
            Created
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-[#508eff]" />
            Edited
          </span>
        </div>
      </div>

      <div className="px-5 py-4">
        {loading ? (
          <div className="flex h-44 items-end gap-2.5">
            {SKELETON_HEIGHTS.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <Skeleton className="w-full rounded-sm bg-[#2a2a2a]" style={{ height: h }} />
                <Skeleton className="h-3 w-5 bg-[#2a2a2a]" />
              </div>
            ))}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={176}>
            <BarChart
              data={insights?.weeklyActivity}
              margin={{ top: 4, right: 0, left: -28, bottom: 0 }}
              barCategoryGap="35%"
              barGap={3}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#2a2a2a"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#8e9192", fontFamily: "var(--font-sans)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#8e9192", fontFamily: "var(--font-sans)" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "#2a2a2a", radius: 4 }}
                contentStyle={TOOLTIP_STYLE}
                formatter={(value, name) => [
                  value,
                  name === "notesCreated" ? "Created" : "Edited",
                ]}
              />
              <Bar dataKey="notesCreated" fill="#c6c6c7" radius={[3, 3, 0, 0]} maxBarSize={24} />
              <Bar dataKey="notesEdited" fill="#508eff" radius={[3, 3, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
