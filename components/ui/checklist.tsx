"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface ChecklistProps {
  items: ChecklistItem[];
  onToggle: (id: string) => void;
  className?: string;
}

export function Checklist({ items, onToggle, className }: ChecklistProps) {
  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {completedCount}/{items.length} complete
        </span>
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border/50">
          <div
            className="h-full rounded-full bg-accent-gold transition-all duration-300"
            style={{ width: `${items.length ? (completedCount / items.length) * 100 : 0}%` }}
          />
        </div>
      </div>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onToggle(item.id)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-background/50"
          aria-pressed={item.completed}
        >
          <div
            className={cn(
              "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all duration-200",
              item.completed
                ? "border-accent-gold bg-accent-gold text-background"
                : "border-border bg-transparent"
            )}
          >
            {item.completed && <Check className="h-3 w-3" strokeWidth={3} />}
          </div>
          <span
            className={cn(
              "text-sm transition-all duration-200",
              item.completed ? "text-muted-foreground line-through" : "text-foreground"
            )}
          >
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
