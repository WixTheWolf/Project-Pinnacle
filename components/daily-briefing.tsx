"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BarChart3,
  CalendarCheck2,
  ChevronRight,
  Dumbbell,
  Gauge,
  HeartPulse,
  House,
  Quote,
  Users2
} from "lucide-react";
import { DAILY_MOBILITY, DEFAULT_SETTINGS, SWING_KEYS, WEEKLY_TEMPLATE } from "@/lib/content";
import { GRINT_BASELINES } from "@/lib/grint-snapshot";
import { isRegulationRound } from "@/lib/ghin";
import {
  daysTo,
  estimateDurationMinutes,
  formatDate,
  localDateKey,
  parseDateKey,
  phaseForDate,
  planIntensity,
  swingKeyForToday
} from "@/lib/plan";
import { ChecklistState, ReadinessEntry, RoundLog, Settings } from "@/lib/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, Eyebrow, Pill } from "@/components/ui";
import { ProgressRing } from "@/components/charts";

/*
  Daily briefing — the landing page at "/". Read-only view over the same
  localStorage the tabbed app owns; every path links into a tab.
*/
export function DailyBriefing() {
  const [settings, , settingsHydrated] = useLocalStorage<Settings>("pp-settings", DEFAULT_SETTINGS);
  const [readinessEntries, , readinessHydrated] = useLocalStorage<ReadinessEntry[]>("pp-readiness", []);
  const [roundLogs, , roundsHydrated] = useLocalStorage<RoundLog[]>("pp-rounds", []);
  const [dailyChecklist, , checklistHydrated] = useLocalStorage<ChecklistState>("pp-checklist", {
    date: localDateKey(),
    completed: {}
  });

  const ready = settingsHydrated && readinessHydrated && roundsHydrated && checklistHydrated;

  const countdown = daysTo(settings.tournamentDate);
  const currentPhase = phaseForDate(settings.tournamentDate);
  const progressToTournament = Math.max(0, Math.min(100, Math.round(((70 - countdown) / 70) * 100)));

  const todayName = new Date().toLocaleDateString(undefined, { weekday: "long" });
  const todayPlan =
    settings.weeklySchedule[todayName] ?? WEEKLY_TEMPLATE[todayName]?.join(" + ") ?? "Recovery + review";
  const estimatedMinutes = estimateDurationMinutes(todayPlan);
  const swingKey = swingKeyForToday(SWING_KEYS);

  const todayReadiness = useMemo(
    () => readinessEntries.find((entry) => entry.date === localDateKey()) ?? null,
    [readinessEntries]
  );
  const intensity = todayReadiness ? planIntensity(todayReadiness.score) : null;

  const lastRound = useMemo(() => {
    const regulation = roundLogs.filter(isRegulationRound);
    if (regulation.length === 0) {
      return null;
    }
    return [...regulation].sort((a, b) => parseDateKey(b.date).getTime() - parseDateKey(a.date).getTime())[0];
  }, [roundLogs]);

  const mobilityDone = DAILY_MOBILITY.reduce(
    (count, _, idx) => (dailyChecklist.completed[`mobility-${idx}`] ? count + 1 : count),
    0
  );

  const needToKnow = useMemo(() => {
    const items: string[] = [];
    items.push(
      todayReadiness
        ? `Readiness ${todayReadiness.score}/100 — ${planIntensity(todayReadiness.score).guidance}`
        : "No readiness check-in yet today — 60 seconds of sliders sets the right intensity."
    );
    if (mobilityDone < DAILY_MOBILITY.length) {
      items.push(`Mobility: ${mobilityDone}/${DAILY_MOBILITY.length} done — durability work comes first.`);
    } else {
      items.push("Mobility complete — body is cleared for full practice loading.");
    }
    if (lastRound) {
      items.push(
        `Last round ${lastRound.score} at ${lastRound.course} (${formatDate(lastRound.date)}) — the Practice tab has today's focus drill.`
      );
    } else {
      items.push(`Career baseline ${GRINT_BASELINES.avgScore} avg — sync GHIN on the Stats tab to go live.`);
    }
    if (currentPhase === "Tournament Week") {
      items.push("Tournament week: sharpen, hydrate, sleep by 9:30 — arrive fresh, not tired.");
    } else if (currentPhase === "Week 7 Deload") {
      items.push("Deload week: cut volume 40-50%. Freshness beats one more range session.");
    } else if (currentPhase.includes("Simulation")) {
      items.push("Simulation phase: pressure reps and full-round tracking over rehearsal.");
    }
    return items;
  }, [todayReadiness, mobilityDone, lastRound, currentPhase]);

  const tabs = [
    {
      href: "/today",
      label: "Today",
      icon: <House size={18} strokeWidth={2.2} />,
      stat: todayReadiness ? `Readiness ${todayReadiness.score}` : "Check in"
    },
    {
      href: "/practice",
      label: "Practice",
      icon: <Dumbbell size={18} strokeWidth={2.2} />,
      stat: "Drills + focus"
    },
    {
      href: "/recovery",
      label: "Recovery",
      icon: <HeartPulse size={18} strokeWidth={2.2} />,
      stat: `Mobility ${mobilityDone}/${DAILY_MOBILITY.length}`
    },
    {
      href: "/performance",
      label: "Stats",
      icon: <BarChart3 size={18} strokeWidth={2.2} />,
      stat: lastRound ? `Last ${lastRound.score}` : `Avg ${GRINT_BASELINES.avgScore}`
    },
    {
      href: "/field",
      label: "Field",
      icon: <Users2 size={18} strokeWidth={2.2} />,
      stat: `HCP ${settings.handicap}`
    },
    {
      href: "/tournament",
      label: "Event",
      icon: <CalendarCheck2 size={18} strokeWidth={2.2} />,
      stat: `${countdown} days out`
    }
  ];

  if (!ready) {
    return <main className="flex min-h-screen items-center justify-center text-muted">Loading Project Pinnacle...</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pb-14 pt-10 text-text">
      <header className="text-center">
        <Eyebrow>Road to Gamble Sands</Eyebrow>
        <h1 className="mt-2 font-display text-[42px] font-semibold leading-none tracking-tight">
          Project Pinnacle
        </h1>
        <p className="mt-2 text-sm text-muted">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · Do
          today&apos;s work, {settings.preferredName}.
        </p>
      </header>

      <div className="mt-7 flex flex-col items-center">
        <ProgressRing
          value={progressToTournament}
          size={150}
          stroke={10}
          color="#BA8A28"
          centerValue={String(countdown)}
          sublabel="days to tee-off"
          label={settings.tournamentName}
        />
        <div className="mt-2">
          <Pill tone="sand">{currentPhase}</Pill>
        </div>
      </div>

      <Card hero className="rise-in mt-7">
        <div className="flex items-center justify-between gap-2">
          <Eyebrow>Today&apos;s mission</Eyebrow>
          <Pill tone="default">{estimatedMinutes} min</Pill>
        </div>
        <h2 className="mt-2 font-display text-xl font-semibold leading-snug">{todayPlan}</h2>
        {intensity ? (
          <div className="mt-2.5">
            <Pill tone={intensity.tone}>
              <Gauge size={12} className="mr-1 inline-block" />
              {intensity.label}
            </Pill>
          </div>
        ) : null}
        <div className="well mt-3 flex items-start gap-2.5 rounded-xl p-3">
          <Quote size={13} className="mt-0.5 shrink-0 text-sand/70" />
          <div>
            <p className="font-display text-sm font-semibold italic text-text">{swingKey}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
              Swing key of the day
            </p>
          </div>
        </div>
        <Link
          href="/today"
          className="mt-4 flex w-full items-center justify-center rounded-xl border border-sand/50 bg-sand/[0.12] px-4 py-3 text-sm font-semibold text-sand transition hover:bg-sand/20"
        >
          Start today&apos;s plan
          <ChevronRight size={16} className="ml-1" />
        </Link>
      </Card>

      <Card className="rise-in mt-4">
        <Eyebrow>Need to know</Eyebrow>
        <ul className="mt-3 space-y-2.5">
          {needToKnow.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-muted">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-sand/70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="card-surface group rounded-2xl p-3.5 transition hover:border-sand/40"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sand">
              {tab.icon}
            </span>
            <p className="mt-2.5 font-display text-base font-semibold text-text">{tab.label}</p>
            <p className="mt-0.5 text-[11px] text-faint">{tab.stat}</p>
          </Link>
        ))}
      </div>

      <p className="mt-7 text-center text-[10px] uppercase tracking-[0.2em] text-faint">
        {settings.course} · Goal {settings.goalScore}
      </p>
    </main>
  );
}
