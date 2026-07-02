"use client";

import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div
      className={cn("flex gap-1 overflow-x-auto rounded-xl bg-background p-1 scrollbar-none", className)}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
            activeTab === tab.id
              ? "bg-card text-accent-gold shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
