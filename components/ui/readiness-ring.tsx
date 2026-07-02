"use client";

import { cn } from "@/lib/utils";

interface ReadinessRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ReadinessRing({
  score,
  size = 120,
  strokeWidth = 8,
  className,
}: ReadinessRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const scoreColor =
    score >= 80 ? "#2E7D32" : score >= 60 ? "#D6B56D" : "#DC2626";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#374151"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold tabular-nums">{score}</span>
        <span className="text-xs text-muted-foreground">Readiness</span>
      </div>
    </div>
  );
}
