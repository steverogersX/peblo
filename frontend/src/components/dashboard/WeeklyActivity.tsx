"use client";

import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/contexts/DashboardContext";

const CREATED_COLOR = "#508eff";
const EDITED_COLOR  = "#a78bfa";

const SKELETON_H = [56, 88, 44, 72, 104, 36, 60];

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-popover px-3.5 py-2.5 shadow-xl">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
        {label}
      </p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center gap-2 text-[13px]">
          <span
            className="size-1.5 rounded-full"
            style={{ background: item.color }}
          />
          <span className="text-muted-foreground/70">
            {item.name === "notesCreated" ? "Created" : "Edited"}
          </span>
          <span className="ml-1 font-semibold tabular-nums text-foreground">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function WeeklyActivity() {
  const { insights, status } = useDashboard();
  const loading = status === "loading" || status === "idle";

  const totalCreated = insights?.weeklyActivity.reduce((s, d) => s + d.notesCreated, 0) ?? 0;
  const totalEdited  = insights?.weeklyActivity.reduce((s, d) => s + d.notesEdited,  0) ?? 0;

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-accent/60">
            <TrendingUp className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-foreground">Weekly activity</p>
            <p className="text-[11.5px] text-muted-foreground/45">Last 7 days</p>
          </div>
        </div>

        {/* Summary chips */}
        {!loading && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[12px]">
              <span
                className="size-2 rounded-sm"
                style={{ background: CREATED_COLOR }}
              />
              <span className="text-muted-foreground/60">Created</span>
              <span className="font-semibold tabular-nums text-foreground">{totalCreated}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px]">
              <span
                className="size-2 rounded-sm"
                style={{ background: EDITED_COLOR }}
              />
              <span className="text-muted-foreground/60">Edited</span>
              <span className="font-semibold tabular-nums text-foreground">{totalEdited}</span>
            </div>
          </div>
        )}
      </div>

      {/* Subtle divider */}
      <div className="h-px w-full bg-border/40" />

      {/* Chart */}
      <div className="px-4 py-5">
        {loading ? (
          <div className="flex h-48 items-end gap-2">
            {SKELETON_H.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <Skeleton className="w-full rounded" style={{ height: h }} />
                <Skeleton className="h-2.5 w-5 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={192}>
            <BarChart
              data={insights?.weeklyActivity}
              margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
              barCategoryGap="36%"
              barGap={3}
            >
              <defs>
                <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CREATED_COLOR} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={CREATED_COLOR} stopOpacity={0.45} />
                </linearGradient>
                <linearGradient id="gradEdited" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={EDITED_COLOR} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={EDITED_COLOR} stopOpacity={0.45} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11.5,
                  fill: "var(--muted-foreground)",
                  fontFamily: "var(--font-sans)",
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                tick={{
                  fontSize: 11.5,
                  fill: "var(--muted-foreground)",
                  fontFamily: "var(--font-sans)",
                }}
              />
              <Tooltip
                cursor={{ fill: "var(--accent)", radius: 4, opacity: 0.5 }}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="notesCreated"
                fill="url(#gradCreated)"
                radius={[4, 4, 2, 2]}
                maxBarSize={18}
              />
              <Bar
                dataKey="notesEdited"
                fill="url(#gradEdited)"
                radius={[4, 4, 2, 2]}
                maxBarSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
