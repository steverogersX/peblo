"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/contexts/DashboardContext";

const SKELETON_HEIGHTS = [72, 48, 96, 56, 80, 40, 64];

export function WeeklyActivity() {
  const { insights, status } = useDashboard();
  const loading = status === "loading" || status === "idle";

  const tooltipStyle = {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "6px",
    fontSize: "13px",
    fontFamily: "var(--font-sans)",
    color: "var(--foreground)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    padding: "8px 12px",
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-[14px] font-semibold text-foreground">
            Weekly activity
          </span>
        </div>
        <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-sm" style={{ background: "var(--chart-bar-created)" }} />
            Created
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-sm" style={{ background: "var(--chart-bar-edited)" }} />
            Edited
          </span>
        </div>
      </div>

      <div className="px-5 py-5">
        {loading ? (
          <div className="flex h-44 items-end gap-2.5">
            {SKELETON_HEIGHTS.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <Skeleton className="w-full rounded-sm" style={{ height: h }} />
                <Skeleton className="h-3 w-5" />
              </div>
            ))}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={176}>
            <BarChart
              data={insights?.weeklyActivity}
              margin={{ top: 4, right: 0, left: -28, bottom: 0 }}
              barCategoryGap="38%"
              barGap={3}
            >
              <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "var(--accent)", radius: 3 }}
                contentStyle={tooltipStyle}
                labelStyle={{ color: "var(--muted-foreground)", fontSize: "11px", marginBottom: "4px" }}
                formatter={(value, name) => [
                  value,
                  name === "notesCreated" ? "Created" : "Edited",
                ]}
              />
              <Bar dataKey="notesCreated" fill="var(--chart-bar-created)" radius={[3, 3, 0, 0]} maxBarSize={20} />
              <Bar dataKey="notesEdited" fill="var(--chart-bar-edited)" radius={[3, 3, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
