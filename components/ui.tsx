"use client";

import clsx from "clsx";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { TabKey } from "@/lib/types";
import { BarChart3, CalendarCheck2, Check, ChevronDown, Dumbbell, HeartPulse, House } from "lucide-react";

export function Card({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & React.ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={clsx("rounded-2xl border border-white/10 bg-card p-4 shadow-soft", className)}
      {...props}
    >
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
      <h2 className="text-lg font-semibold text-text">{title}</h2>
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
  { key: "performance", label: "Performance", icon: <BarChart3 size={16} /> },
  { key: "tournament", label: "Tournament", icon: <CalendarCheck2 size={16} /> }
];

const tabHref: Record<TabKey, string> = {
  today: "/today",
  practice: "/practice",
  recovery: "/recovery",
  performance: "/performance",
  tournament: "/tournament"
};

export function BottomTabs({ active }: { active: TabKey }) {
  return (
    <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#111827]/95 backdrop-blur">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {tabs.map((tab) => (
          <li key={tab.key}>
            <Link
              href={tabHref[tab.key]}
              aria-current={active === tab.key ? "page" : undefined}
              className={clsx(
                "flex w-full flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium transition",
                active === tab.key
                  ? "border-t-2 border-sand bg-white/10 font-semibold text-white"
                  : "border-t-2 border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
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
  prefix,
  label
}: {
  items: string[];
  checkedMap: Record<string, boolean>;
  onToggle: (key: string) => void;
  prefix: string;
  label?: string;
}) {
  const completed = items.reduce((count, _, idx) => (checkedMap[`${prefix}-${idx}`] ? count + 1 : count), 0);

  return (
    <div className="space-y-2.5">
      {label ? (
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}: {completed} / {items.length} complete
        </p>
      ) : null}
      {items.map((item, idx) => {
        const key = `${prefix}-${idx}`;
        const checked = !!checkedMap[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => onToggle(key)}
            role="checkbox"
            aria-checked={checked}
            aria-label={`${checked ? "Mark incomplete" : "Mark complete"}: ${item}`}
            className={clsx(
              "flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition",
              checked
                ? "border-turf/70 bg-turf/10 text-green-100 shadow-[0_0_0_1px_rgba(46,125,50,0.2)]"
                : "border-white/10 bg-black/15 text-text hover:border-white/20"
            )}
          >
            <span
              className={clsx(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                checked ? "border-turf bg-turf text-black" : "border-white/30"
              )}
            >
              {checked ? <Check size={12} /> : null}
            </span>
            <span>{item}</span>
          </button>
        );
      })}
    </div>
  );
}

export function CollapsibleCard({
  title,
  subtitle,
  children,
  defaultOpen = false
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      className="group rounded-2xl border border-white/10 bg-card p-4 shadow-soft [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-text">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
        </div>
        <ChevronDown
          size={16}
          className="shrink-0 text-muted transition group-open:rotate-180 group-open:text-sand"
        />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}
