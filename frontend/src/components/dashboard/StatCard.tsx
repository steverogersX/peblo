"use client";

import { type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type StatAccent = "blue" | "emerald" | "violet" | "amber";

const ACCENT_COLOR: Record<StatAccent, string> = {
  blue:    "#508eff",
  emerald: "#34d399",
  violet:  "#a78bfa",
  amber:   "#f59e0b",
};

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  loading?: boolean;
  accent?: StatAccent;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  loading = false,
  accent = "blue",
  className,
}: StatCardProps) {
  const color = ACCENT_COLOR[accent];

  if (loading) {
    return (
      <div className={cn("relative overflow-hidden rounded-xl border border-border/60 bg-card p-5", className)}>
        <div className="absolute inset-x-0 top-0 h-px opacity-40" style={{ background: color }} />
        <Skeleton className="mb-4 size-8 rounded-lg" />
        <Skeleton className="h-9 w-16" />
        <Skeleton className="mt-2 h-3.5 w-20" />
        <Skeleton className="mt-1 h-3 w-28" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 transition-colors duration-150 hover:border-border",
        className
      )}
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: color }} />

      {/* Radial gradient wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] transition-opacity duration-200 group-hover:opacity-[0.09]"
        style={{ background: `radial-gradient(ellipse at 10% 10%, ${color} 0%, transparent 65%)` }}
      />

      {/* Icon */}
      <div
        className="mb-4 flex size-8 items-center justify-center rounded-lg"
        style={{ background: `${color}1a` }}
      >
        <Icon className="size-[17px]" style={{ color }} strokeWidth={1.5} />
      </div>

      {/* Value */}
      <p className="text-[36px] font-bold leading-none tracking-[-0.045em] tabular-nums text-foreground">
        {value}
      </p>

      {/* Title */}
      <p className="mt-2 text-[13px] font-medium text-foreground/60">{title}</p>

      {/* Description */}
      {description && (
        <p className="mt-0.5 text-[11.5px] text-muted-foreground/45">{description}</p>
      )}
    </div>
  );
}
