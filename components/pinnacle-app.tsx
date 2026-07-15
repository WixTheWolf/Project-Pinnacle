"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  DAILY_MOBILITY,
  DEFAULT_SETTINGS,
  EMERGENCY_FIXES,
  PACKING_LIST,
  PERIODIZATION,
  PRACTICE_DRILLS,
  RECOVERY_CHECKLIST,
  ROUTINES,
  STRENGTH_A,
  STRENGTH_B,
  SWING_KEYS,
  TOURNAMENT_TIMELINE,
  WARMUP_40,
  WEEKLY_TEMPLATE
} from "@/lib/content";
import {
  FIELD_PLAYERS,
  SKILL_CATEGORIES,
  SKILL_LABELS,
  STRAND_BRAND_ASSETS,
  SkillCategory
} from "@/lib/field-data";
import { CHECKLIST_GUIDES } from "@/lib/coaching-guides";
import { ChecklistState, PracticeLog, ReadinessEntry, RoundLog, Settings, TabKey } from "@/lib/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  BottomTabs,
  Card,
  Checklist,
  CollapsibleCard,
  Eyebrow,
  Pill,
  ProgressBar,
  SectionTitle,
  StatCard
} from "@/components/ui";
import {
  HabitHeatmap,
  ProgressRing,
  ScoreTrendChart,
  SkillRadar,
  TargetMeter
} from "@/components/charts";
import { DrillDiagram } from "@/components/drill-diagrams";
import { CountdownHero, DawnCommandBanner, LinksHorizon, PinMark } from "@/components/course-art";
import { ChevronDown, Clock3, Flame, Play, Quote, Target } from "lucide-react";

const READINESS_KEYS = [
  "sleep",
  "energy",
  "back",
  "hips",
  "shoulders",
  "wristsHands",
  "stress",
  "confidence"
] as const;

type ReadinessKey = (typeof READINESS_KEYS)[number];

const localDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDate = (value: string) =>
  parseDateKey(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const toId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const textInputClass =
  "w-full rounded-xl border border-white/10 bg-well px-3 py-2 text-sm text-text outline-none transition focus:border-sand/60";
const buttonClass =
  "rounded-xl border border-sand/50 bg-sand/[0.12] px-4 py-2.5 text-sm font-semibold text-sand transition hover:bg-sand/20 active:scale-[0.99]";

const roundFieldConfig: Array<{
  key: keyof Omit<RoundLog, "id" | "notes">;
  label: string;
  type: "date" | "number" | "text";
}> = [
  { key: "date", label: "Date", type: "date" },
  { key: "course", label: "Course", type: "text" },
  { key: "score", label: "Score", type: "number" },
  { key: "tees", label: "Tees", type: "text" },
  { key: "fairwaysHit", label: "Fairways hit", type: "number" },
  { key: "gir", label: "Greens in regulation", type: "number" },
  { key: "putts", label: "Putts", type: "number" },
  { key: "penalties", label: "Penalty strokes", type: "number" },
  { key: "upAndDownMade", label: "Up-and-downs made", type: "number" },
  { key: "upAndDownAttempted", label: "Up-and-down attempts", type: "number" },
  { key: "birdies", label: "Birdies", type: "number" },
  { key: "doublesOrWorse", label: "Doubles or worse", type: "number" },
  { key: "threePutts", label: "Three-putts", type: "number" },
  { key: "soreness", label: "Physical soreness (1-10)", type: "number" },
  { key: "mentalGrade", label: "Mental grade (1-10)", type: "number" }
];

function readinessScore(draft: Record<ReadinessKey, number>) {
  const stressAdjusted = 11 - draft.stress;
  const total =
    draft.sleep +
    draft.energy +
    draft.back +
    draft.hips +
    draft.shoulders +
    draft.wristsHands +
    stressAdjusted +
    draft.confidence;
  return Math.round((total / 80) * 100);
}

function planIntensity(score: number) {
  if (score >= 80) {
    return {
      label: "Full intensity",
      tone: "green" as const,
      guidance: "Run the full plan. Tempo wins, then stack clean reps.",
      adjustment: "No reductions needed."
    };
  }
  if (score >= 60) {
    return {
      label: "Modified intensity",
      tone: "sand" as const,
      guidance: "Complete the plan with reduced volume and smooth tempo.",
      adjustment: "Cut total reps ~20%, keep quality high, no hero swings."
    };
  }
  return {
    label: "Recovery-priority intensity",
    tone: "danger" as const,
    guidance: "Convert today to mobility + short technical work only.",
    adjustment: "Skip heavy loading, preserve rhythm, and leave fresh."
  };
}

function phaseForDate(tournamentDate: string) {
  const now = new Date();
  const target = new Date(tournamentDate);
  const diffDays = Math.ceil((target.getTime() - now.getTime()) / 86400000);
  if (diffDays <= 7) {
    return "Tournament Week";
  }
  if (diffDays <= 14) {
    return "Week 7 Deload";
  }
  if (diffDays <= 28) {
    return "Week 5-6 Simulation";
  }
  if (diffDays <= 42) {
    return "Week 3-4 Build";
  }
  return "Week 1-2 Foundation";
}

function daysTo(tournamentDate: string) {
  const now = new Date();
  const target = new Date(tournamentDate);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

function streakFromDates(dates: string[]) {
  const dateSet = new Set(dates);
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = localDateKey(cursor);
    if (!dateSet.has(key)) {
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function estimateDurationMinutes(plan: string) {
  let minutes = 0;
  const lower = plan.toLowerCase();
  if (lower.includes("strength")) {
    minutes += 45;
  }
  if (lower.includes("range")) {
    minutes += 60;
  }
  if (lower.includes("wedge")) {
    minutes += 30;
  }
  if (lower.includes("putting")) {
    minutes += 25;
  }
  if (lower.includes("short game")) {
    minutes += 30;
  }
  if (lower.includes("walk")) {
    minutes += 45;
  }
  if (lower.includes("play 9")) {
    minutes += 120;
  }
  if (lower.includes("18")) {
    minutes += 240;
  }
  if (lower.includes("recovery")) {
    minutes += 20;
  }

  return Math.max(30, minutes);
}

export function PinnacleApp({ activeTab }: { activeTab: TabKey }) {
  const [settings, setSettings, settingsHydrated] = useLocalStorage<Settings>("pp-settings", DEFAULT_SETTINGS);
  const [readinessEntries, setReadinessEntries, readinessHydrated] = useLocalStorage<ReadinessEntry[]>(
    "pp-readiness",
    []
  );
  const [practiceLogs, setPracticeLogs, practiceHydrated] = useLocalStorage<PracticeLog[]>("pp-practice", []);
  const [roundLogs, setRoundLogs, roundsHydrated] = useLocalStorage<RoundLog[]>("pp-rounds", []);
  const [dailyChecklist, setDailyChecklist, checklistHydrated] = useLocalStorage<ChecklistState>("pp-checklist", {
    date: localDateKey(),
    completed: {}
  });
  const [habitHistory, setHabitHistory, habitsHydrated] = useLocalStorage<
    Record<string, { mobility: boolean; practice: boolean }>
  >("pp-habits", {});

  const [readinessDraft, setReadinessDraft] = useLocalStorage<Record<ReadinessKey, number>>(
    "pp-draft-readiness",
    {
      sleep: 7,
      energy: 7,
      back: 7,
      hips: 7,
      shoulders: 7,
      wristsHands: 7,
      stress: 4,
      confidence: 7
    }
  );

  const [practiceDraft, setPracticeDraft] = useLocalStorage("pp-draft-practice", {
    section: "Driver",
    drillName: "Fairway Finder 30",
    result: "",
    notes: ""
  });

  const [roundDraft, setRoundDraft] = useLocalStorage<Omit<RoundLog, "id">>("pp-draft-round", {
    date: localDateKey(),
    course: settings.course,
    score: 84,
    tees: "Blue",
    fairwaysHit: 8,
    gir: 7,
    putts: 31,
    penalties: 1,
    upAndDownMade: 4,
    upAndDownAttempted: 8,
    birdies: 2,
    doublesOrWorse: 1,
    threePutts: 0,
    soreness: 4,
    mentalGrade: 7,
    notes: ""
  });

  const [drillFilter, setDrillFilter] = useState("All");

  const ready =
    settingsHydrated &&
    readinessHydrated &&
    practiceHydrated &&
    roundsHydrated &&
    checklistHydrated &&
    habitsHydrated;

  useEffect(() => {
    const today = localDateKey();
    if (dailyChecklist.date !== today) {
      setDailyChecklist({ date: today, completed: {} });
    }
  }, [dailyChecklist.date, setDailyChecklist]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    const today = localDateKey();
    const mobilityKeys = DAILY_MOBILITY.map((_, idx) => `mobility-${idx}`);
    const mobilityDone = mobilityKeys.every((key) => dailyChecklist.completed[key]);
    const practiceDone = practiceLogs.some((log) => log.date === today);
    setHabitHistory((prev) => ({
      ...prev,
      [today]: { mobility: mobilityDone, practice: practiceDone }
    }));
  }, [dailyChecklist.completed, practiceLogs, ready, setHabitHistory]);

  const countdown = daysTo(settings.tournamentDate);
  const progressToTournament = Math.max(0, Math.min(100, Math.round(((70 - countdown) / 70) * 100)));
  const currentPhase = phaseForDate(settings.tournamentDate);

  const latestReadiness = useMemo(
    () => readinessEntries.find((entry) => entry.date === localDateKey()) ?? readinessEntries[0],
    [readinessEntries]
  );
  const latestReadinessScore = latestReadiness?.score ?? readinessScore(readinessDraft);
  const readinessState = planIntensity(latestReadinessScore);

  const todayName = new Date().toLocaleDateString(undefined, { weekday: "long" });
  const todayPlan = settings.weeklySchedule[todayName] ?? WEEKLY_TEMPLATE[todayName]?.join(" + ") ?? "Recovery + review";
  const estimatedMinutes = estimateDurationMinutes(todayPlan);
  const swingKeyDate = new Date();
  const dayOfYear = Math.floor(
    (swingKeyDate.getTime() - new Date(swingKeyDate.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const swingKeyOfTheDay = SWING_KEYS[dayOfYear % SWING_KEYS.length];

  const mobilityStreak = useMemo(
    () =>
      streakFromDates(
        Object.entries(habitHistory)
          .filter(([, data]) => data.mobility)
          .map(([date]) => date)
      ),
    [habitHistory]
  );
  const practiceStreak = useMemo(
    () =>
      streakFromDates(
        Object.entries(habitHistory)
          .filter(([, data]) => data.practice)
          .map(([date]) => date)
      ),
    [habitHistory]
  );

  const performanceStats = useMemo(() => {
    if (roundLogs.length === 0) {
      return null;
    }
    const sum = roundLogs.reduce(
      (acc, round) => {
        acc.score += round.score;
        acc.fairways += round.fairwaysHit;
        acc.gir += round.gir;
        acc.putts += round.putts;
        acc.penalties += round.penalties;
        acc.doubles += round.doublesOrWorse;
        acc.birdies += round.birdies;
        acc.threePutts += round.threePutts;
        acc.upDownMade += round.upAndDownMade;
        acc.upDownAttempted += round.upAndDownAttempted;
        acc.soreness += round.soreness;
        acc.best = Math.min(acc.best, round.score);
        return acc;
      },
      {
        score: 0,
        fairways: 0,
        gir: 0,
        putts: 0,
        penalties: 0,
        doubles: 0,
        birdies: 0,
        threePutts: 0,
        upDownMade: 0,
        upDownAttempted: 0,
        soreness: 0,
        best: Number.POSITIVE_INFINITY
      }
    );
    const n = roundLogs.length;
    const chronological = [...roundLogs].sort(
      (a, b) => parseDateKey(a.date).getTime() - parseDateKey(b.date).getTime()
    );
    return {
      avgScore: (sum.score / n).toFixed(1),
      avgFairways: sum.fairways / n,
      avgGir: sum.gir / n,
      avgPutts: sum.putts / n,
      avgPenalties: sum.penalties / n,
      avgDoubles: sum.doubles / n,
      avgBirdies: sum.birdies / n,
      avgThreePutts: (sum.threePutts / n).toFixed(1),
      scramblingPct: sum.upDownAttempted > 0 ? (sum.upDownMade / sum.upDownAttempted) * 100 : 0,
      avgSoreness: (sum.soreness / n).toFixed(1),
      bestRound: sum.best,
      trendScores: chronological.map((round) => round.score),
      trendDates: chronological.map((round) => formatDate(round.date))
    };
  }, [roundLogs]);

  const fieldByHandicap = useMemo(() => [...FIELD_PLAYERS].sort((a, b) => a.handicap - b.handicap), []);
  const youPlayer = useMemo(
    () => fieldByHandicap.find((player) => player.isYou) ?? fieldByHandicap[0],
    [fieldByHandicap]
  );
  const opponents = useMemo(
    () => fieldByHandicap.filter((player) => player.id !== youPlayer.id),
    [fieldByHandicap, youPlayer.id]
  );

  const fieldSkillAverages = useMemo(() => {
    const source = opponents.length > 0 ? opponents : fieldByHandicap;
    return SKILL_CATEGORIES.reduce<Record<SkillCategory, number>>((acc, category) => {
      acc[category] =
        source.reduce((sum, player) => sum + player.skills[category], 0) / Math.max(source.length, 1);
      return acc;
    }, {} as Record<SkillCategory, number>);
  }, [fieldByHandicap, opponents]);

  const yourSkillEdges = useMemo(() => {
    return SKILL_CATEGORIES.map((category) => ({
      category,
      label: SKILL_LABELS[category],
      delta: Math.round(youPlayer.skills[category] - fieldSkillAverages[category])
    })).sort((a, b) => b.delta - a.delta);
  }, [fieldSkillAverages, youPlayer.skills]);

  const drillSections = useMemo(
    () => ["All", ...Array.from(new Set(PRACTICE_DRILLS.map((drill) => drill.section)))],
    []
  );
  const visibleDrills = useMemo(
    () => PRACTICE_DRILLS.filter((drill) => drillFilter === "All" || drill.section === drillFilter),
    [drillFilter]
  );

  const toggleChecklist = (key: string) => {
    setDailyChecklist((prev) => ({
      ...prev,
      completed: {
        ...prev.completed,
        [key]: !prev.completed[key]
      }
    }));
  };

  const saveReadiness = () => {
    const score = readinessScore(readinessDraft);
    const entry: ReadinessEntry = { date: localDateKey(), ...readinessDraft, score };
    setReadinessEntries((prev) => [entry, ...prev.filter((item) => item.date !== entry.date)]);
  };

  const addPracticeLog = () => {
    if (!practiceDraft.result.trim()) {
      return;
    }
    setPracticeLogs((prev) => [
      {
        id: toId(),
        date: localDateKey(),
        section: practiceDraft.section,
        drillName: practiceDraft.drillName,
        result: practiceDraft.result,
        notes: practiceDraft.notes.trim()
      },
      ...prev
    ]);
    setPracticeDraft((prev) => ({ ...prev, result: "", notes: "" }));
  };

  const addRoundLog = () => {
    setRoundLogs((prev) => [{ id: toId(), ...roundDraft }, ...prev]);
    setRoundDraft((prev) => ({ ...prev, notes: "" }));
  };

  const startTodaysPlan = () => {
    const target = document.getElementById("today-workflow");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!ready) {
    return <main className="flex min-h-screen items-center justify-center text-muted">Loading Project Pinnacle...</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-6 text-text">
      <header className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Eyebrow>Road to Gamble Sands</Eyebrow>
            <h1 className="mt-1.5 font-display text-[34px] font-semibold leading-none tracking-tight">
              Project Pinnacle
            </h1>
            <p className="mt-2 text-sm text-muted">Do today&apos;s work, {settings.preferredName}.</p>
          </div>
          <div className="well relative flex shrink-0 flex-col items-center overflow-hidden rounded-2xl px-3.5 py-2.5">
            <PinMark className="absolute -right-1 -top-1 text-sand/30" />
            <span className="font-display text-2xl font-semibold leading-none text-sand">{countdown}</span>
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-faint">days out</span>
          </div>
        </div>
        {activeTab !== "tournament" ? (
          <div className="mt-4 overflow-hidden rounded-xl opacity-80">
            <LinksHorizon />
          </div>
        ) : null}
      </header>

      {activeTab === "today" ? (
        <div className="space-y-4">
          <div className="rise-in">
            <DawnCommandBanner
              plan={todayPlan}
              minutes={estimatedMinutes}
              intensityLabel={readinessState.label}
              intensityTone={readinessState.tone}
              onStart={startTodaysPlan}
            />
          </div>

          <Card hero className="rise-in">
            <p className="text-sm leading-relaxed text-muted">
              {readinessState.guidance} This keeps your body durable and your scoring clubs sharp for tournament week.
            </p>
            <p className="mt-2 text-xs text-sand">{readinessState.adjustment}</p>
            <div className="well mt-3 flex items-start gap-2.5 rounded-xl p-3">
              <Quote size={13} className="mt-0.5 shrink-0 text-sand/70" />
              <div>
                <p className="font-display text-sm font-semibold italic text-text">{swingKeyOfTheDay}</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
                  Swing key of the day
                </p>
              </div>
            </div>
          </Card>

          <Card className="rise-in">
            <div className="grid grid-cols-2 items-start gap-2">
              <ProgressRing
                value={latestReadinessScore}
                label="Readiness"
                sublabel="/ 100"
              />
              <ProgressRing
                value={progressToTournament}
                color="#BA8A28"
                centerValue={String(countdown)}
                sublabel="days left"
                label="To first tee"
              />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted">
                  {settings.tournamentName} · {settings.course}
                </p>
              </div>
              <Pill tone="sand">{currentPhase}</Pill>
            </div>
            <div className="mt-2.5">
              <ProgressBar value={progressToTournament} />
            </div>
          </Card>

          <CollapsibleCard
            title={`Readiness check-in — ${latestReadinessScore}/100`}
            subtitle="Eight sliders set today's intensity."
            defaultOpen={false}
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {READINESS_KEYS.map((key) => (
                <label key={key} className="text-xs text-muted">
                  <span className="flex items-baseline justify-between">
                    <span className="capitalize">{key === "wristsHands" ? "Wrists/hands" : key}</span>
                    <span className="text-sm font-semibold text-text">{readinessDraft[key]}</span>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={readinessDraft[key]}
                    onChange={(event) =>
                      setReadinessDraft((prev) => ({ ...prev, [key]: Number(event.target.value) }))
                    }
                    className="w-full"
                  />
                </label>
              ))}
            </div>
            <button type="button" className={`${buttonClass} mt-3 w-full`} onClick={saveReadiness}>
              Save Readiness
            </button>
          </CollapsibleCard>

          <Card id="today-workflow" className="rise-in">
            <SectionTitle eyebrow="Habit engine" title="Consistency map" subtitle="Every green square is a day the work got done." />
            <HabitHeatmap history={habitHistory} />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <StatCard
                label="Mobility streak"
                value={`${mobilityStreak}d`}
                tone={mobilityStreak > 0 ? "green" : "default"}
                sub="full mobility list done"
              />
              <StatCard
                label="Practice streak"
                value={`${practiceStreak}d`}
                tone={practiceStreak > 0 ? "sand" : "default"}
                sub="at least one logged drill"
              />
            </div>
            <div className="well mt-3 flex items-center gap-2 rounded-xl p-3 text-sm text-text">
              <Flame size={15} className="shrink-0 text-sand" />
              {todayPlan}
            </div>
          </Card>

          <Card>
            <SectionTitle title="Daily mobility" subtitle="Durability first. Tap ? on any item for a how-to." />
            <Checklist
              items={DAILY_MOBILITY}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="mobility"
              label="Mobility"
              guides={CHECKLIST_GUIDES}
            />
          </Card>

          <Card>
            <SectionTitle title="Recovery actions" subtitle="Fresh beats fried." />
            <Checklist
              items={RECOVERY_CHECKLIST}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="recovery"
              label="Recovery"
              guides={CHECKLIST_GUIDES}
            />
          </Card>
        </div>
      ) : null}

      {activeTab === "practice" ? (
        <div className="space-y-4">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {drillSections.map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => setDrillFilter(section)}
                className={
                  drillFilter === section
                    ? "shrink-0 rounded-full border border-sand/60 bg-sand/15 px-3.5 py-1.5 text-xs font-semibold text-sand"
                    : "shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-muted transition hover:text-text"
                }
              >
                {section}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {visibleDrills.map((drill, idx) => (
              <Card key={drill.name} className="rise-in" style={{ animationDelay: `${idx * 40}ms` }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Eyebrow>{drill.section}</Eyebrow>
                    <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">{drill.name}</h3>
                  </div>
                  <Pill tone="default">
                    <Clock3 size={11} className="mr-1 inline-block" />
                    {drill.time}
                  </Pill>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{drill.purpose}</p>

                <div className="mt-3">
                  <DrillDiagram section={drill.section} drillName={drill.name} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="well rounded-xl p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">Reps</p>
                    <p className="mt-1 text-xs font-medium text-text">{drill.reps}</p>
                  </div>
                  <div className="well rounded-xl p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">Scoring</p>
                    <p className="mt-1 text-xs font-medium text-turf">{drill.metric}</p>
                  </div>
                </div>

                <ul className="mt-3 space-y-1.5 text-xs text-muted">
                  {drill.instructions.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-sand/70" />
                      {item}
                    </li>
                  ))}
                </ul>

                <details className="well group/notes mt-3 rounded-xl [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
                    Coach&apos;s notes
                    <ChevronDown size={13} className="transition group-open/notes:rotate-180" />
                  </summary>
                  <div className="space-y-2 px-3 pb-3 text-xs">
                    <p className="leading-relaxed text-text">{drill.tutorial}</p>
                    {drill.tips.map((tip) => (
                      <p key={tip} className="leading-relaxed text-muted">
                        <span className="font-semibold text-sand">Tip · </span>
                        {tip}
                      </p>
                    ))}
                    {drill.tricks.map((trick) => (
                      <p key={trick} className="leading-relaxed text-muted">
                        <span className="font-semibold text-turf">Trick · </span>
                        {trick}
                      </p>
                    ))}
                  </div>
                </details>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a
                    href={drill.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-muted transition hover:border-sand/40 hover:text-sand"
                  >
                    <Play size={14} className="mr-2 inline-block" />
                    How-to videos
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setPracticeDraft((prev) => ({
                        ...prev,
                        section: drill.section,
                        drillName: drill.name
                      }));
                      document.getElementById("practice-log")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={buttonClass}
                  >
                    <Target size={14} className="mr-2 inline-block" />
                    Log Result
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <Card id="practice-log">
            <SectionTitle title="Quick practice log" subtitle="Minimal typing. Capture the result." />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs text-muted">
                  Section
                  <input
                    className={`${textInputClass} mt-1`}
                    value={practiceDraft.section}
                    onChange={(event) => setPracticeDraft((prev) => ({ ...prev, section: event.target.value }))}
                  />
                </label>
                <label className="block text-xs text-muted">
                  Drill name
                  <input
                    className={`${textInputClass} mt-1`}
                    value={practiceDraft.drillName}
                    onChange={(event) => setPracticeDraft((prev) => ({ ...prev, drillName: event.target.value }))}
                  />
                </label>
              </div>
              <label className="block text-xs text-muted">
                Result
                <input
                  className={`${textInputClass} mt-1`}
                  placeholder="Example: 23/30 playable"
                  value={practiceDraft.result}
                  onChange={(event) => setPracticeDraft((prev) => ({ ...prev, result: event.target.value }))}
                />
              </label>
              <label className="block text-xs text-muted">
                Notes
                <textarea
                  className={`${textInputClass} mt-1 min-h-20`}
                  placeholder="Tempo wins. Turn through finish."
                  value={practiceDraft.notes}
                  onChange={(event) => setPracticeDraft((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </label>
              <button type="button" className={`${buttonClass} w-full`} onClick={addPracticeLog}>
                Save Practice Log
              </button>
            </div>
          </Card>

          <Card>
            <SectionTitle title="Recent practice logs" />
            <div className="space-y-2">
              {practiceLogs.slice(0, 8).map((log) => (
                <div key={log.id} className="well rounded-xl p-3 text-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold text-text">
                      {log.section} · {log.drillName}
                    </p>
                    <p className="shrink-0 text-[10px] text-faint">{formatDate(log.date)}</p>
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-sand">{log.result}</p>
                  {log.notes ? <p className="mt-1 text-xs text-muted">{log.notes}</p> : null}
                </div>
              ))}
              {practiceLogs.length === 0 ? (
                <p className="text-sm text-muted">No practice logs yet — log a drill above to start the record.</p>
              ) : null}
            </div>
          </Card>
        </div>
      ) : null}

      {activeTab === "recovery" ? (
        <div className="space-y-4">
          <Card>
            <SectionTitle
              title="Daily 15-minute mobility"
              subtitle="Daily-critical. Do this first. Tap ? on any item for a how-to."
            />
            <Checklist
              items={DAILY_MOBILITY}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="mobility"
              label="Mobility"
              guides={CHECKLIST_GUIDES}
            />
          </Card>

          {Object.entries(ROUTINES).map(([name, items]) => (
            <CollapsibleCard key={name} title={`${name} routine`} subtitle="Open when this area needs attention.">
              <Checklist
                items={items}
                checkedMap={dailyChecklist.completed}
                onToggle={toggleChecklist}
                prefix={name.toLowerCase().replace(/[^a-z]/g, "")}
                label={name}
                guides={CHECKLIST_GUIDES}
              />
            </CollapsibleCard>
          ))}

          <CollapsibleCard title="Strength A" subtitle="Quality movement. Never to failure.">
            <Checklist
              items={STRENGTH_A}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="strengtha"
              label="Strength A"
              guides={CHECKLIST_GUIDES}
            />
          </CollapsibleCard>

          <CollapsibleCard title="Strength B" subtitle="Stop if back pain increases.">
            <Checklist
              items={STRENGTH_B}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="strengthb"
              label="Strength B"
              guides={CHECKLIST_GUIDES}
            />
            <p className="mt-3 text-xs text-muted">
              Deload week: reduce strength volume by 40-50%. Keep speed sharp and leave fresh.
            </p>
          </CollapsibleCard>

          <CollapsibleCard title="Post-round recovery" subtitle="Use after every round.">
            <Checklist
              items={RECOVERY_CHECKLIST}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="recovery"
              label="Recovery"
              guides={CHECKLIST_GUIDES}
            />
          </CollapsibleCard>
        </div>
      ) : null}

      {activeTab === "performance" ? (
        <div className="space-y-4">
          <Card className="rise-in">
            <SectionTitle
              eyebrow="Scoring trend"
              title="Rounds vs. the 79–84 window"
              subtitle="Every logged round, oldest to newest. Green dot marks the best round."
            />
            {performanceStats && performanceStats.trendScores.length > 0 ? (
              <ScoreTrendChart
                scores={performanceStats.trendScores}
                dates={performanceStats.trendDates}
              />
            ) : (
              <div className="well rounded-xl p-6 text-center">
                <p className="text-sm text-muted">Log your first round to draw the scoring trend.</p>
              </div>
            )}
          </Card>

          {performanceStats ? (
            <>
              <Card className="rise-in">
                <SectionTitle eyebrow="Averages" title="Performance dashboard" />
                <div className="grid grid-cols-2 gap-2">
                  <StatCard label="Avg score" value={performanceStats.avgScore} tone="sand" />
                  <StatCard label="Best round" value={String(performanceStats.bestRound)} tone="green" />
                  <StatCard label="Three-putts" value={performanceStats.avgThreePutts} sub="per round · target 0" />
                  <StatCard label="Soreness" value={performanceStats.avgSoreness} sub="post-round avg" />
                </div>
              </Card>

              <Card className="rise-in">
                <SectionTitle
                  eyebrow="Target card"
                  title="Tournament targets"
                  subtitle="Round averages vs. what a 79–84 round requires. Green fill = on target."
                />
                <div className="space-y-4">
                  <TargetMeter label="Fairways hit" value={performanceStats.avgFairways} target={8} max={14} />
                  <TargetMeter label="Greens in regulation" value={performanceStats.avgGir} target={7} max={18} />
                  <TargetMeter
                    label="Putts"
                    value={performanceStats.avgPutts}
                    target={30}
                    max={40}
                    lowerIsBetter
                  />
                  <TargetMeter
                    label="Penalty strokes"
                    value={performanceStats.avgPenalties}
                    target={1}
                    max={4}
                    lowerIsBetter
                  />
                  <TargetMeter
                    label="Doubles or worse"
                    value={performanceStats.avgDoubles}
                    target={1}
                    max={4}
                    lowerIsBetter
                  />
                  <TargetMeter label="Birdies" value={performanceStats.avgBirdies} target={2} max={6} />
                  <TargetMeter
                    label="Scrambling"
                    value={performanceStats.scramblingPct}
                    target={40}
                    max={100}
                    format={(v) => `${v.toFixed(0)}%`}
                  />
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <SectionTitle
                eyebrow="Target card"
                title="Tournament targets"
                subtitle="Fairways 8+ · GIR 7+ · Putts ≤30 · Penalties ≤1 · Doubles ≤1 · Birdies 2+ · Three-putts 0"
              />
            </Card>
          )}

          <Card>
            <SectionTitle title="Round journal" subtitle="Track consistency. Eliminate blow-up holes." />
            <div className="grid grid-cols-2 gap-2">
              {roundFieldConfig.map((field) => (
                <label key={field.key} className="text-xs text-muted">
                  {field.label}
                  <input
                    type={field.type}
                    className={`${textInputClass} mt-1`}
                    value={roundDraft[field.key]}
                    onChange={(event) =>
                      setRoundDraft((prev) => ({
                        ...prev,
                        [field.key]:
                          field.type === "number" ? Number(event.target.value) : event.target.value
                      }))
                    }
                  />
                </label>
              ))}
            </div>
            <label className="mt-2 block text-xs text-muted">
              Notes
              <textarea
                className={`${textInputClass} mt-1 min-h-20`}
                value={roundDraft.notes}
                onChange={(event) => setRoundDraft((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </label>
            <button type="button" className={`${buttonClass} mt-3 w-full`} onClick={addRoundLog}>
              Save Round
            </button>
          </Card>
        </div>
      ) : null}

      {activeTab === "field" ? (
        <div className="space-y-4">
          <Card
            className="field-hero-gradient overflow-hidden border-sand/35"
            style={{
              backgroundImage: `linear-gradient(145deg, rgba(10, 15, 11, 0.92), rgba(8, 13, 10, 0.9)), url('${STRAND_BRAND_ASSETS.heroImageUrl}')`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <Image
              src={STRAND_BRAND_ASSETS.logoUrl}
              alt="The Strand Invitational logo"
              width={160}
              height={36}
              className="h-8 w-auto opacity-90"
              priority={false}
            />
            <Eyebrow className="mt-3">Gamble Sands Field</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-white">
              Know the group. Prepare the edge.
            </h2>
            <p className="mt-2 max-w-[34ch] text-sm text-slate-200/90">
              Sourced from the current public Strand roster and handicap feed snapshot so Matt can prep with the right information.
            </p>
          </Card>

          <Card className="field-card-enter border-sand/45">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Eyebrow>Featured player</Eyebrow>
                <h3 className="mt-1 font-display text-2xl font-semibold text-white">
                  {youPlayer.name} <span className="text-sand">({youPlayer.nickname})</span>
                </h3>
                <p className="text-sm text-muted">
                  You · {youPlayer.handedness === "Unknown" ? "Handedness not listed" : `${youPlayer.handedness}-handed`}
                </p>
              </div>
              <HandicapBadge handicap={youPlayer.handicap} label={youPlayer.handicapLabel} />
            </div>

            <div className="mt-3">
              <SkillRadar you={youPlayer.skills} field={fieldSkillAverages} youLabel={settings.preferredName} />
            </div>

            <div className="well mt-3 rounded-xl p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">Current focus</p>
              <p className="mt-1 text-sm text-text">{youPlayer.currentFocus}</p>
              <p className="mt-2 text-xs text-sand">Goal handicap: {settings.goalHandicap}</p>
            </div>

            <div className="well mt-3 rounded-xl p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
                {settings.preferredName} edge map
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {yourSkillEdges.slice(0, 2).map((edge) => (
                  <li key={edge.category} className={edge.delta >= 0 ? "text-turf" : "text-danger"}>
                    {formatDelta(edge.delta)} in {edge.label}
                  </li>
                ))}
                {yourSkillEdges[yourSkillEdges.length - 1] ? (
                  <li className="text-sand">
                    Focus today: {yourSkillEdges[yourSkillEdges.length - 1].label} (
                    {formatDelta(yourSkillEdges[yourSkillEdges.length - 1].delta)} vs field)
                  </li>
                ) : null}
              </ul>
            </div>
          </Card>

          <Card className="field-card-enter">
            <SectionTitle
              title="Field comparison"
              subtitle="Simple scouting view. No leaderboard noise."
            />
            <div className="space-y-2">
              {[youPlayer, ...opponents].map((player) => (
                <div
                  key={player.id}
                  className="well flex items-center justify-between rounded-xl px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-text">
                      {player.name} <span className="text-sand">({player.nickname})</span>{" "}
                      {player.isYou ? <span className="text-sand">· You</span> : null}
                    </p>
                    <p className="text-xs text-muted">
                      Top skills: {topSkillLabels(player.skills).join(" · ")}
                    </p>
                  </div>
                  <HandicapBadge handicap={player.handicap} label={player.handicapLabel} />
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-3">
            <SectionTitle title="Player profiles" subtitle="Who you are playing with, and what to know." />
            {opponents.map((player, idx) => (
              <details
                key={player.id}
                className="field-card-enter card-surface group rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden"
                style={{ animationDelay: `${(idx + 1) * 45}ms` }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">
                      {player.name} <span className="text-sand">({player.nickname})</span>
                    </h3>
                    <p className="text-xs text-muted">
                      {player.handedness === "Unknown" ? "Handedness not listed" : `${player.handedness}-handed`} ·{" "}
                      {player.playingStyle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <HandicapBadge handicap={player.handicap} label={player.handicapLabel} />
                    <ChevronDown size={16} className="text-muted transition group-open:rotate-180 group-open:text-sand" />
                  </div>
                </summary>

                <div className="mt-3 space-y-3">
                  <div className="well rounded-xl p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">Profile snapshot</p>
                    <p className="mt-1 text-sm text-text">{player.bio}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                      {player.location ? <span>Location: {player.location}</span> : null}
                      {player.ghinClub ? <span>GHIN club: {player.ghinClub}</span> : null}
                      {player.grintProfileUrl ? (
                        <a
                          href={player.grintProfileUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`TheGrint profile for ${player.name}`}
                          className="rounded-full border border-sand/45 px-2 py-0.5 text-sand hover:bg-sand/10"
                        >
                          TheGrint profile
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="well rounded-xl p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">Strengths</p>
                      <ul className="mt-2 space-y-1 text-turf">
                        {player.strengths.map((item) => (
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="well rounded-xl p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">Weaknesses</p>
                      <ul className="mt-2 space-y-1 text-sand">
                        {player.weaknesses.map((item) => (
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="well rounded-xl p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">Skill profile</p>
                    <div className="mt-2">
                      <SkillBars skills={player.skills} />
                    </div>
                  </div>

                  <div className="well rounded-xl p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">Notes</p>
                    <p className="mt-1 text-sm text-text">{player.notes}</p>
                  </div>

                  <div className="rounded-xl border border-sand/30 bg-sand/[0.06] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sand">Matchup insight</p>
                    <p className="mt-1 text-sm text-text">{player.matchupInsight}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === "tournament" ? (
        <div className="space-y-4">
          <div className="rise-in">
            <CountdownHero
              days={countdown}
              phase={currentPhase}
              tournamentName={settings.tournamentName}
              course={settings.course}
              dateLabel={formatDate(settings.tournamentDate)}
              teeTime={settings.teeTime}
              goalScore={settings.goalScore}
              progress={progressToTournament}
            />
          </div>

          <Card className="rise-in">
            <SectionTitle
              eyebrow="Road map"
              title="Why every day counts"
              subtitle="Handicap 12.4 → 3. Score window 79–84 at Gamble Sands."
            />
            <div className="grid grid-cols-3 gap-2">
              <StatCard label="Days out" value={String(countdown)} tone="sand" />
              <StatCard label="Goal score" value={settings.goalScore} tone="default" />
              <StatCard label="Progress" value={`${progressToTournament}%`} tone="green" />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-xs text-muted">Current training phase</p>
              <Pill tone="sand">{currentPhase}</Pill>
            </div>
          </Card>

          <Card>
            <SectionTitle title="Tournament week schedule" subtitle="Daily-critical during tournament week." />
            <Checklist
              items={TOURNAMENT_TIMELINE}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="timeline"
              label="Tournament schedule"
            />
          </Card>

          <Card>
            <SectionTitle title="40-minute warm-up" subtitle="Arrive sharp, not tired." />
            <WarmupTimeline />
            <div className="mt-4">
              <Checklist
                items={WARMUP_40}
                checkedMap={dailyChecklist.completed}
                onToggle={toggleChecklist}
                prefix="warmup"
                label="Warm-up"
              />
            </div>
          </Card>

          <CollapsibleCard title="Emergency swing fixes" subtitle="Use one cue per swing.">
            <div className="space-y-3">
              {Object.entries(EMERGENCY_FIXES).map(([miss, fixes]) => (
                <div key={miss} className="well rounded-xl p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sand">{miss}</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-text">
                    {fixes.map((fix) => (
                      <li key={fix} className="flex gap-2">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-sand/70" />
                        {fix}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CollapsibleCard>

          <CollapsibleCard title="Packing list" subtitle="Make travel and rounds frictionless.">
            <Checklist
              items={PACKING_LIST}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="pack"
              label="Packing"
            />
          </CollapsibleCard>

          <CollapsibleCard title="Tournament binder" subtitle="Quick cards for pressure moments.">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <MiniCard title="Swing keys" lines={SWING_KEYS} />
              <MiniCard title="Mobility" lines={["15 min daily", "Hips + back + shoulders", "Keep wrists supple"]} />
              <MiniCard title="Warm-up" lines={["40 min sequence", "No over-hitting driver", "Speed + rhythm"]} />
              <MiniCard title="Recovery" lines={["Hydrate", "Protein", "Foam roll", "Sleep by 9:30"]} />
              <MiniCard title="Emergency fixes" lines={["Tempo", "Turn through", "Trust target"]} />
              <MiniCard title="Goals" lines={["79-84 range", "No blow-up holes", "Stay fresh"]} />
            </div>
          </CollapsibleCard>

          <CollapsibleCard title="Customize Project Pinnacle" subtitle="Edit settings anytime.">
            <div className="space-y-2">
              {(
                [
                  ["tournamentDate", "Tournament date", "date"],
                  ["course", "Course", "text"],
                  ["handicap", "Handicap", "text"],
                  ["goalScore", "Goal score", "text"],
                  ["teeTime", "Tee time", "time"],
                  ["wedgeDistances", "Wedge distances", "text"],
                  ["clubsInBag", "Clubs in bag", "text"],
                  ["sorenessAreas", "Pain/soreness areas", "text"],
                  ["strengthDays", "Strength days", "text"],
                  ["practiceAvailability", "Practice availability", "text"]
                ] as const
              ).map(([field, label, type]) => (
                <label className="block text-xs text-muted" key={field}>
                  {label}
                  <input
                    type={type}
                    className={`${textInputClass} mt-1`}
                    value={settings[field]}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSettings((prev) => ({
                        ...prev,
                        [field]: value
                      }));
                      if (field === "course") {
                        setRoundDraft((roundPrev) => ({ ...roundPrev, course: value }));
                      }
                    }}
                  />
                </label>
              ))}
              <label className="block text-xs text-muted">
                Weekly schedule
                <textarea
                  className={`${textInputClass} mt-1 min-h-24`}
                  value={Object.entries(settings.weeklySchedule)
                    .map(([day, plan]) => `${day}: ${plan}`)
                    .join("\n")}
                  onChange={(event) => {
                    const parsed = event.target.value.split("\n").reduce<Record<string, string>>((acc, line) => {
                      const [day, ...rest] = line.split(":");
                      if (day && rest.length > 0) {
                        acc[day.trim()] = rest.join(":").trim();
                      }
                      return acc;
                    }, {});
                    setSettings((prev) => ({ ...prev, weeklySchedule: parsed }));
                  }}
                />
              </label>
              <label className="block text-xs text-muted">
                Drill targets
                <textarea
                  className={`${textInputClass} mt-1 min-h-24`}
                  value={Object.entries(settings.drillTargets)
                    .map(([name, target]) => `${name}: ${target}`)
                    .join("\n")}
                  onChange={(event) => {
                    const parsed = event.target.value.split("\n").reduce<Record<string, string>>((acc, line) => {
                      const [name, ...rest] = line.split(":");
                      if (name && rest.length > 0) {
                        acc[name.trim()] = rest.join(":").trim();
                      }
                      return acc;
                    }, {});
                    setSettings((prev) => ({ ...prev, drillTargets: parsed }));
                  }}
                />
              </label>
            </div>
          </CollapsibleCard>

          <CollapsibleCard title="7-week periodization" subtitle="Trust the process and protect freshness.">
            <ol className="space-y-0">
              {PERIODIZATION.map((item, idx) => (
                <li key={item} className="relative flex gap-3 pb-4 last:pb-0">
                  {idx < PERIODIZATION.length - 1 ? (
                    <span className="absolute left-[7px] top-5 h-full w-px bg-white/10" aria-hidden="true" />
                  ) : null}
                  <span className="mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-sand/60 bg-well" />
                  <span className="text-sm leading-relaxed text-muted">{item}</span>
                </li>
              ))}
            </ol>
          </CollapsibleCard>
        </div>
      ) : null}

      <BottomTabs active={activeTab} />
    </main>
  );
}

/* 40-minute warm-up as a proportional timeline strip */
function WarmupTimeline() {
  const blocks = [
    { label: "Body", minutes: 10, color: "#4E90D1" },
    { label: "Chip/pitch", minutes: 10, color: "#4FA86B" },
    { label: "Irons", minutes: 10, color: "#BA8A28" },
    { label: "Driver", minutes: 5, color: "#D95F53" },
    { label: "Putt", minutes: 5, color: "#77837A" }
  ];
  let elapsed = 0;
  return (
    <div>
      <div className="flex h-9 w-full gap-[2px] overflow-hidden rounded-xl">
        {blocks.map((block) => (
          <div
            key={block.label}
            className="flex items-center justify-center"
            style={{ width: `${(block.minutes / 40) * 100}%`, background: block.color, opacity: 0.85 }}
          >
            <span className="px-1 text-[9px] font-bold uppercase tracking-wide text-[#08110B]">
              {block.minutes >= 10 ? block.label : ""}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[9px] text-faint">
        {blocks.map((block) => {
          const start = elapsed;
          elapsed += block.minutes;
          return (
            <span key={block.label} style={{ width: `${(block.minutes / 40) * 100}%` }}>
              {start}&apos;
            </span>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted">
        {blocks.map((block) => (
          <span key={block.label} className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-[3px]" style={{ background: block.color }} />
            {block.label} {block.minutes}&apos;
          </span>
        ))}
      </div>
    </div>
  );
}

function HandicapBadge({ handicap, label }: { handicap: number; label?: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-sand/55 bg-sand/15 px-3 py-1 text-sm font-semibold text-sand">
      HCP {label ?? handicap.toFixed(1)}
    </span>
  );
}

function SkillBars({
  skills,
  compact = false
}: {
  skills: Record<SkillCategory, number>;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      {SKILL_CATEGORIES.map((category) => (
        <div key={category}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted">{SKILL_LABELS[category]}</span>
            <span className="font-medium text-text">{skills[category]}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.08]">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-sand-deep to-turf transition-all duration-300"
              style={{ width: `${Math.max(3, Math.min(100, skills[category]))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function topSkillLabels(skills: Record<SkillCategory, number>) {
  return [...SKILL_CATEGORIES]
    .sort((a, b) => skills[b] - skills[a])
    .slice(0, 2)
    .map((category) => SKILL_LABELS[category]);
}

function formatDelta(value: number) {
  if (value > 0) {
    return `+${value}`;
  }
  return `${value}`;
}

function MiniCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="well rounded-xl p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sand">{title}</p>
      <ul className="mt-2 space-y-1 text-xs text-text">
        {lines.map((line) => (
          <li key={line} className="flex gap-1.5">
            <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-sand/60" />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
