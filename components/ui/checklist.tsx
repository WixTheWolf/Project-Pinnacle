"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  href?: string;
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
        <div
          key={item.id}
          className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-background/50"
        >
          <button
            type="button"
            onClick={() => onToggle(item.id)}
            className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all duration-200"
            aria-pressed={item.completed}
            aria-label={item.completed ? `Mark incomplete: ${item.label}` : `Mark complete: ${item.label}`}
          >
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-200",
                item.completed
                  ? "border-accent-gold bg-accent-gold text-background"
                  : "border-border bg-transparent"
              )}
            >
              {item.completed && <Check className="h-3 w-3" strokeWidth={3} />}
            </div>
          </button>
          {item.href && !item.completed ? (
            <Link
              href={item.href}
              className="flex-1 text-sm text-foreground transition-colors hover:text-accent-gold"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                "flex-1 text-sm transition-all duration-200",
                item.completed ? "text-muted-foreground line-through" : "text-foreground"
              )}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
