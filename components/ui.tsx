"use client";

import clsx from "clsx";
import { ReactNode } from "react";
import { TabKey } from "@/lib/types";
import { BarChart3, CalendarCheck2, Dumbbell, HeartPulse, House } from "lucide-react";

export function Card({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx("rounded-2xl border border-white/10 bg-card p-4 shadow-soft", className)}>
      {children}
    </section>
  );
}

export function SectionTitle({
  title,
  subtitle
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-3">
      <h2 className="text-base font-semibold text-text">{title}</h2>
      {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
    </div>
  );
}

export function Pill({
  children,
  tone = "default"
}: {
  children: ReactNode;
  tone?: "default" | "sand" | "green" | "danger";
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        tone === "default" && "border-white/20 text-muted",
        tone === "sand" && "border-sand/60 bg-sand/10 text-sand",
        tone === "green" && "border-turf/60 bg-turf/10 text-green-300",
        tone === "danger" && "border-danger/60 bg-danger/10 text-red-300"
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-black/40">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-sand to-turf transition-all"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

const tabs: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: "today", label: "Today", icon: <House size={16} /> },
  { key: "practice", label: "Practice", icon: <Dumbbell size={16} /> },
  { key: "recovery", label: "Recovery", icon: <HeartPulse size={16} /> },
  { key: "stats", label: "Stats", icon: <BarChart3 size={16} /> },
  { key: "tournament", label: "Tournament", icon: <CalendarCheck2 size={16} /> }
];

export function BottomTabs({
  active,
  onChange
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#111827]/95 backdrop-blur">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {tabs.map((tab) => (
          <li key={tab.key}>
            <button
              onClick={() => onChange(tab.key)}
              className={clsx(
                "flex w-full flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium",
                active === tab.key ? "text-sand" : "text-muted"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Checklist({
  items,
  checkedMap,
  onToggle,
  prefix
}: {
  items: string[];
  checkedMap: Record<string, boolean>;
  onToggle: (key: string) => void;
  prefix: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const key = `${prefix}-${idx}`;
        const checked = !!checkedMap[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => onToggle(key)}
            aria-pressed={checked}
            aria-label={`${checked ? "Mark incomplete" : "Mark complete"}: ${item}`}
            className={clsx(
              "flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm",
              checked
                ? "border-turf/70 bg-turf/10 text-green-200"
                : "border-white/10 bg-black/15 text-text"
            )}
          >
            <span
              className={clsx(
                "h-5 w-5 shrink-0 rounded-md border",
                checked ? "border-turf bg-turf" : "border-white/30"
              )}
            />
            <span>{item}</span>
          </button>
        );
      })}
    </div>
  );
}
