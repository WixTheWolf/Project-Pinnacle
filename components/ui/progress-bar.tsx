import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: "gold" | "green" | "default";
  size?: "sm" | "md";
  className?: string;
}

const barColors = {
  gold: "bg-accent-gold",
  green: "bg-accent-green",
  default: "bg-foreground",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  variant = "gold",
  size = "md",
  className,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
          {showValue && (
            <span className="text-xs font-medium text-foreground">{Math.round(percent)}%</span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-border/50",
          size === "sm" ? "h-1.5" : "h-2.5"
        )}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", barColors[variant])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
