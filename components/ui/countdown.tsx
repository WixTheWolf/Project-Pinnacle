"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CountdownProps {
  days: number;
  label: string;
  sublabel?: string;
  className?: string;
}

export function Countdown({ days, label, sublabel, className }: CountdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-accent-gold/20 bg-gradient-to-br from-card to-background p-6",
        className
      )}
    >
      <div className="absolute inset-0 bg-accent-gold/5" />
      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-widest text-accent-gold">
          {label}
        </p>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-6xl font-bold tabular-nums tracking-tighter">{days}</span>
          <span className="mb-2 text-lg text-muted-foreground">days</span>
        </div>
        {sublabel && (
          <p className="mt-1 text-sm text-muted-foreground">{sublabel}</p>
        )}
      </div>
    </motion.div>
  );
}
