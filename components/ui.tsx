"use client";

import clsx from "clsx";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { CoachingGuide, TabKey } from "@/lib/types";
import {
  BarChart3,
  CalendarCheck2,
  Check,
  ChevronDown,
  CircleHelp,
  Dumbbell,
  HeartPulse,
  House,
  Play,
  Users2
} from "lucide-react";

export function Card({
  children,
  className,
  hero = false,
  ...props
}: {
  children: ReactNode;
  className?: string;
  hero?: boolean;
} & React.ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={clsx("rounded-2xl p-4", hero ? "card-hero" : "card-surface", className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={clsx("text-[10px] font-semibold uppercase tracking-[0.22em] text-sand", className)}>
      {children}
    </p>
  );
}

export function SectionTitle({
  title,
  subtitle,
  eyebrow
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <div className="mb-3">
      {eyebrow ? <Eyebrow className="mb-1">{eyebrow}</Eyebrow> : null}
      <h2 className="font-display text-lg font-semibold tracking-tight text-text">{title}</h2>
      {subtitle ? <p className="mt-1 text-xs leading-relaxed text-muted">{subtitle}</p> : null}
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
        tone === "default" && "border-white/15 bg-white/[0.04] text-muted",
        tone === "sand" && "border-sand/50 bg-sand/10 text-sand",
        tone === "green" && "border-turf/55 bg-turf/10 text-turf",
        tone === "danger" && "border-danger/55 bg-danger/10 text-danger"
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-white/[0.09]">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-sand-deep to-turf shadow-glow-sand transition-all duration-500"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  tone = "default"
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "sand" | "green" | "danger";
}) {
  return (
    <div className="well rounded-xl p-3">
      <p className="text-[11px] text-muted">{label}</p>
      <p
        className={clsx(
          "mt-1 text-xl font-semibold leading-none",
          tone === "default" && "text-text",
          tone === "sand" && "text-sand",
          tone === "green" && "text-turf",
          tone === "danger" && "text-danger"
        )}
      >
        {value}
      </p>
      {sub ? <p className="mt-1.5 text-[10px] text-faint">{sub}</p> : null}
    </div>
  );
}

const tabs: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: "today", label: "Today", icon: <House size={17} strokeWidth={2.2} /> },
  { key: "practice", label: "Practice", icon: <Dumbbell size={17} strokeWidth={2.2} /> },
  { key: "recovery", label: "Recovery", icon: <HeartPulse size={17} strokeWidth={2.2} /> },
  { key: "performance", label: "Stats", icon: <BarChart3 size={17} strokeWidth={2.2} /> },
  { key: "field", label: "Field", icon: <Users2 size={17} strokeWidth={2.2} /> },
  { key: "tournament", label: "Event", icon: <CalendarCheck2 size={17} strokeWidth={2.2} /> }
];

const tabHref: Record<TabKey, string> = {
  today: "/today",
  practice: "/practice",
  recovery: "/recovery",
  performance: "/performance",
  field: "/field",
  tournament: "/tournament"
};

export function BottomTabs({ active }: { active: TabKey }) {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.625rem)]"
    >
      <ul className="mx-auto grid max-w-md grid-cols-6 items-stretch rounded-2xl border border-white/10 bg-[#0B110D]/92 p-1.5 shadow-dock backdrop-blur-xl">
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <li key={tab.key}>
              <Link
                href={tabHref[tab.key]}
                aria-current={isActive ? "page" : undefined}
                className={clsx(
                  "flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium transition",
                  isActive
                    ? "bg-sand/[0.12] font-semibold text-sand"
                    : "text-faint hover:bg-white/[0.05] hover:text-muted"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  aria-hidden="true"
                  className={clsx("h-1 w-1 rounded-full", isActive ? "bg-sand" : "bg-transparent")}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Checklist({
  items,
  checkedMap,
  onToggle,
  prefix,
  label,
  guides
}: {
  items: string[];
  checkedMap: Record<string, boolean>;
  onToggle: (key: string) => void;
  prefix: string;
  label?: string;
  guides?: Record<string, CoachingGuide>;
}) {
  const completed = items.reduce((count, _, idx) => (checkedMap[`${prefix}-${idx}`] ? count + 1 : count), 0);
  const [openGuides, setOpenGuides] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-2.5">
      {label ? (
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
            <p className="text-[11px] font-semibold text-sand">
              {completed}
              <span className="text-faint"> / {items.length}</span>
            </p>
          </div>
          <ProgressBar value={(completed / items.length) * 100} />
        </div>
      ) : null}
      {items.map((item, idx) => {
        const key = `${prefix}-${idx}`;
        const checked = !!checkedMap[key];
        const guide = guides?.[item];
        const guideOpen = !!openGuides[key];
        return (
          <div
            key={key}
            className={clsx(
              "rounded-xl border transition",
              checked ? "border-turf/50 bg-turf/[0.08]" : "well hover:border-white/20"
            )}
          >
            <div className="flex items-center gap-3 p-3">
              <button
                type="button"
                onClick={() => onToggle(key)}
                role="checkbox"
                aria-checked={checked}
                aria-label={`${checked ? "Mark incomplete" : "Mark complete"}: ${item}`}
                className="flex min-w-0 flex-1 items-center gap-3 text-left text-sm"
              >
                <span
                  className={clsx(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition",
                    checked ? "border-turf bg-turf text-[#08110B]" : "border-white/25"
                  )}
                >
                  {checked ? <Check size={12} strokeWidth={3} /> : null}
                </span>
                <span
                  className={clsx(
                    checked ? "text-muted line-through decoration-turf/40 decoration-1" : "text-text"
                  )}
                >
                  {item}
                </span>
              </button>
              {guide ? (
                <button
                  type="button"
                  onClick={() => setOpenGuides((prev) => ({ ...prev, [key]: !prev[key] }))}
                  aria-expanded={guideOpen}
                  aria-label={`How to: ${item}`}
                  className={clsx(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition",
                    guideOpen
                      ? "border-sand/60 bg-sand/15 text-sand"
                      : "border-white/10 bg-white/[0.04] text-faint hover:text-muted"
                  )}
                >
                  <CircleHelp size={14} />
                </button>
              ) : null}
            </div>
            {guide && guideOpen ? (
              <div className="space-y-2 border-t border-white/[0.06] px-3 pb-3 pt-2.5 text-xs">
                <p className="leading-relaxed text-text">{guide.tutorial}</p>
                <p className="leading-relaxed text-muted">
                  <span className="font-semibold text-sand">Tip · </span>
                  {guide.tip}
                </p>
                <p className="leading-relaxed text-muted">
                  <span className="font-semibold text-turf">Trick · </span>
                  {guide.trick}
                </p>
                <a
                  href={guide.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-sand/50 bg-sand/10 px-3 py-1.5 font-semibold text-sand transition hover:bg-sand/20"
                >
                  <Play size={11} />
                  Watch how-to videos
                </a>
              </div>
            ) : null}
          </div>
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
      className="card-surface group rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold tracking-tight text-text">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
        </div>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
          <ChevronDown size={14} className="text-muted transition group-open:rotate-180 group-open:text-sand" />
        </span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}
