"use client";

import { type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  loading = false,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn("rounded-xl border border-[#2a2a2a] bg-[#1c1b1b] p-5", className)}>
        <Skeleton className="mb-4 size-8 rounded-lg" />
        <Skeleton className="mb-1.5 h-7 w-14" />
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="mt-1 h-3 w-28" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-[#2a2a2a] bg-[#1c1b1b] p-5 transition-colors hover:border-[#353434] hover:bg-[#201f1f]",
        className
      )}
    >
      <div className="mb-4 flex size-8 items-center justify-center rounded-lg border border-[#353434] bg-[#2a2a2a]">
        <Icon className="size-4 text-[#8e9192]" strokeWidth={1.5} />
      </div>

      <p className="text-2xl font-semibold tracking-[-0.03em] text-[#e5e2e1] tabular-nums">
        {value}
      </p>
      <p className="mt-0.5 text-[13px] font-medium text-[#c4c7c8]">{title}</p>
      {description && (
        <p className="mt-1 text-[11px] text-[#8e9192]">{description}</p>
      )}
    </div>
  );
}
