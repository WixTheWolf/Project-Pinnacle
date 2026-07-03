"use client";

import { useEffect, useMemo } from "react";
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
import { ChecklistState, PracticeLog, ReadinessEntry, RoundLog, Settings, TabKey } from "@/lib/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { BottomTabs, Card, Checklist, CollapsibleCard, Pill, ProgressBar, SectionTitle } from "@/components/ui";
import { Clock3, Flame, Gauge, Play, Target } from "lucide-react";

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
  "w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-text outline-none focus:border-sand";
const buttonClass =
  "rounded-xl border border-sand/60 bg-sand/15 px-4 py-2 text-sm font-semibold text-sand transition hover:bg-sand/25";

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
        soreness: 0,
        best: Number.POSITIVE_INFINITY
      }
    );
    const n = roundLogs.length;
    const recentFive = [...roundLogs]
      .sort((a, b) => parseDateKey(b.date).getTime() - parseDateKey(a.date).getTime())
      .slice(0, 5)
      .map((round) => round.score);
    return {
      avgScore: (sum.score / n).toFixed(1),
      avgFairways: (sum.fairways / n).toFixed(1),
      avgGir: (sum.gir / n).toFixed(1),
      avgPutts: (sum.putts / n).toFixed(1),
      avgPenalties: (sum.penalties / n).toFixed(1),
      avgDoubles: (sum.doubles / n).toFixed(1),
      avgSoreness: (sum.soreness / n).toFixed(1),
      bestRound: sum.best,
      recentFive
    };
  }, [roundLogs]);

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
    <main className="mx-auto min-h-screen max-w-md bg-bg px-4 pb-24 pt-5 text-text">
      <header className="mb-5 space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-sand">Road to Gamble Sands</p>
        <h1 className="text-[30px] font-semibold leading-none">Project Pinnacle</h1>
        <p className="text-sm text-muted">Do today&apos;s work, {settings.preferredName}.</p>
      </header>

      {activeTab === "today" ? (
        <div className="space-y-4">
          <Card className="border-sand/40 bg-gradient-to-br from-sand/10 to-turf/5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-sand">Daily Command</p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight text-text">{todayPlan}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Pill tone="default">
                <Clock3 size={12} className="mr-1 inline-block" />
                {estimatedMinutes} min
              </Pill>
              <Pill tone={readinessState.tone}>
                <Gauge size={12} className="mr-1 inline-block" />
                {readinessState.label}
              </Pill>
            </div>
            <p className="mt-3 text-sm text-muted">
              {readinessState.guidance} This keeps your body durable and your scoring clubs sharp for tournament week.
            </p>
            <p className="mt-2 text-xs text-sand">{readinessState.adjustment}</p>
            <button type="button" className={`${buttonClass} mt-4 w-full`} onClick={startTodaysPlan}>
              <Play size={15} className="mr-2 inline-block" />
              Start Today&apos;s Plan
            </button>
          </Card>

          <Card>
            <div className="mb-2 flex items-center justify-between">
              <SectionTitle title={`${countdown} days to tee off`} subtitle={`${settings.tournamentName} · ${settings.course}`} />
              <Pill tone="sand">{currentPhase}</Pill>
            </div>
            <ProgressBar value={progressToTournament} />
          </Card>

          <CollapsibleCard
            title={`Readiness ${latestReadinessScore}/100`}
            subtitle="Readiness supports your command plan."
            defaultOpen={false}
          >
            <div className="grid grid-cols-2 gap-3">
              {READINESS_KEYS.map((key) => (
                <label key={key} className="space-y-1 text-xs text-muted">
                  <span className="capitalize">{key === "wristsHands" ? "Wrists/hands" : key}</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={readinessDraft[key]}
                    onChange={(event) =>
                      setReadinessDraft((prev) => ({ ...prev, [key]: Number(event.target.value) }))
                    }
                    className="w-full accent-sand"
                  />
                  <span className="text-text">{readinessDraft[key]}</span>
                </label>
              ))}
            </div>
            <button type="button" className={`${buttonClass} mt-3 w-full`} onClick={saveReadiness}>
              Save Readiness
            </button>
          </CollapsibleCard>

          <Card id="today-workflow">
            <SectionTitle title="Today workflow" subtitle="Win the next shot. Keep it simple." />
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-text">{todayPlan}</div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted">
              <Flame size={14} className="text-sand" />
              Mobility streak: <strong className="text-text">{mobilityStreak} days</strong>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted">
              <Target size={14} className="text-turf" />
              Practice streak: <strong className="text-text">{practiceStreak} days</strong>
            </div>
          </Card>

          <Card>
            <SectionTitle title="Daily mobility" subtitle="Durability first." />
            <Checklist
              items={DAILY_MOBILITY}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="mobility"
              label="Mobility"
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
            />
          </Card>
        </div>
      ) : null}

      {activeTab === "practice" ? (
        <div className="space-y-4">
          <Card>
            <SectionTitle title="Drill library" subtitle="Stack clean reps." />
            <div className="space-y-3">
              {PRACTICE_DRILLS.map((drill) => (
                <div key={drill.name} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-sand">{drill.section}</p>
                      <h3 className="text-sm font-semibold">{drill.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPracticeDraft((prev) => ({
                          ...prev,
                          section: drill.section,
                          drillName: drill.name
                        }))
                      }
                      className={buttonClass}
                    >
                      Log Result
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-muted">{drill.purpose}</p>
                  <p className="mt-1 text-xs text-muted">
                    {drill.time} · {drill.reps}
                  </p>
                  <p className="mt-1 text-xs text-green-300">{drill.metric}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-text">
                    {drill.instructions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle title="Quick practice log" subtitle="Minimal typing. Capture the result." />
            <div className="space-y-3">
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
                <div key={log.id} className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                  <p className="text-xs text-muted">{formatDate(log.date)}</p>
                  <p className="font-semibold">
                    {log.section} · {log.drillName}
                  </p>
                  <p className="text-sand">{log.result}</p>
                  {log.notes ? <p className="text-xs text-muted">{log.notes}</p> : null}
                </div>
              ))}
              {practiceLogs.length === 0 ? <p className="text-sm text-muted">No practice logs yet.</p> : null}
            </div>
          </Card>
        </div>
      ) : null}

      {activeTab === "recovery" ? (
        <div className="space-y-4">
          <Card>
            <SectionTitle title="Daily 15-minute mobility" subtitle="Daily-critical. Do this first." />
            <Checklist
              items={DAILY_MOBILITY}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="mobility"
              label="Mobility"
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
            />
          </CollapsibleCard>

          <CollapsibleCard title="Strength B" subtitle="Stop if back pain increases.">
            <Checklist
              items={STRENGTH_B}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="strengthb"
              label="Strength B"
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
            />
          </CollapsibleCard>
        </div>
      ) : null}

      {activeTab === "performance" ? (
        <div className="space-y-4">
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

          <Card>
            <SectionTitle title="Performance dashboard" subtitle="Target: 79-84 with no blow-up holes." />
            {performanceStats ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Metric label="Average score" value={performanceStats.avgScore} />
                <Metric label="Average fairways" value={performanceStats.avgFairways} />
                <Metric label="Average GIR" value={performanceStats.avgGir} />
                <Metric label="Average putts" value={performanceStats.avgPutts} />
                <Metric label="Average penalties" value={performanceStats.avgPenalties} />
                <Metric label="Doubles per round" value={performanceStats.avgDoubles} />
                <Metric label="Soreness trend" value={performanceStats.avgSoreness} />
                <Metric label="Best round" value={String(performanceStats.bestRound)} />
                <div className="col-span-2 rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs text-muted">Recent 5-round trend</p>
                  <p className="mt-1 font-semibold">{performanceStats.recentFive.join(" • ") || "n/a"}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">Log your first round to unlock dashboard metrics.</p>
            )}
          </Card>

          <Card>
            <SectionTitle title="Target card" />
            <ul className="space-y-1 text-sm">
              <li>- Fairways: 8+</li>
              <li>- GIR: 7+</li>
              <li>- Putts: 30 or less</li>
              <li>- Penalties: 0-1</li>
              <li>- Doubles: 0-1</li>
              <li>- Birdies: 2+</li>
              <li>- Three-putts: 0</li>
            </ul>
          </Card>
        </div>
      ) : null}

      {activeTab === "tournament" ? (
        <div className="space-y-4">
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
            <Checklist
              items={WARMUP_40}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="warmup"
              label="Warm-up"
            />
          </Card>

          <CollapsibleCard title="Emergency swing fixes" subtitle="Use one cue per swing.">
            <div className="space-y-3">
              {Object.entries(EMERGENCY_FIXES).map(([miss, fixes]) => (
                <div key={miss} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-sand">{miss}</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                    {fixes.map((fix) => (
                      <li key={fix}>{fix}</li>
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
            <ul className="space-y-1 text-sm text-text">
              {PERIODIZATION.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </CollapsibleCard>
        </div>
      ) : null}

      <BottomTabs active={activeTab} />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-lg font-semibold text-text">{value}</p>
    </div>
  );
}

function MiniCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs uppercase tracking-wide text-sand">{title}</p>
      <ul className="mt-1 space-y-1 text-xs text-text">
        {lines.map((line) => (
          <li key={line}>- {line}</li>
        ))}
      </ul>
    </div>
  );
}
