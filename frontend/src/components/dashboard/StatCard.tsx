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
      <div className={cn("rounded-lg border border-border bg-card p-5", className)}>
        <Skeleton className="mb-4 h-3.5 w-24" />
        <Skeleton className="h-8 w-14" />
        <Skeleton className="mt-1.5 h-3 w-32" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-5 transition-colors hover:bg-card-hover",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
        <Icon className="size-4 text-muted-foreground/50" strokeWidth={1.5} />
      </div>

      <p className="mt-3 text-[30px] font-bold tracking-[-0.04em] text-foreground tabular-nums leading-none">
        {value}
      </p>
      {description && (
        <p className="mt-1.5 text-[12px] text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
