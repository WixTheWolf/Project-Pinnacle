import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "green" | "red" | "muted";
  className?: string;
}

const variantStyles = {
  default: "bg-card border-border text-foreground",
  gold: "bg-accent-gold/15 border-accent-gold/30 text-accent-gold",
  green: "bg-accent-green/15 border-accent-green/30 text-accent-green",
  red: "bg-destructive/15 border-destructive/30 text-destructive",
  muted: "bg-muted/10 border-border text-muted-foreground",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
