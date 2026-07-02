"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  const trendColor = {
    up: "text-accent-green",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-2xl border border-border bg-card p-4",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {Icon && <Icon className="h-4 w-4 text-accent-gold" aria-hidden="true" />}
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
      {(subtext || trendValue) && (
        <div className="mt-1 flex items-center gap-2">
          {trendValue && trend && (
            <span className={cn("text-xs font-medium", trendColor[trend])}>{trendValue}</span>
          )}
          {subtext && <span className="text-xs text-muted-foreground">{subtext}</span>}
        </div>
      )}
    </motion.div>
  );
}
