"use client";

import { useEffect, useMemo, useState } from "react";
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
import { BottomTabs, Card, Checklist, Pill, ProgressBar, SectionTitle } from "@/components/ui";
import { Flame, Target } from "lucide-react";

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

function scoreTone(score: number) {
  if (score >= 80) {
    return { label: "Full training day", tone: "green" as const };
  }
  if (score >= 60) {
    return { label: "Modify intensity", tone: "sand" as const };
  }
  return { label: "Recovery priority", tone: "danger" as const };
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

const numberInputClass =
  "w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-text outline-none focus:border-sand";
const textInputClass =
  "w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-text outline-none focus:border-sand";
const buttonClass =
  "rounded-xl border border-sand/60 bg-sand/15 px-4 py-2 text-sm font-semibold text-sand transition hover:bg-sand/25";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("today");
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

  const [readinessDraft, setReadinessDraft] = useState<Record<ReadinessKey, number>>({
    sleep: 7,
    energy: 7,
    back: 7,
    hips: 7,
    shoulders: 7,
    wristsHands: 7,
    stress: 4,
    confidence: 7
  });

  const [practiceDraft, setPracticeDraft] = useState({
    section: "Driver",
    drillName: "Fairway Finder 30",
    result: "",
    notes: ""
  });

  const [roundDraft, setRoundDraft] = useState({
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
  const readinessState = scoreTone(latestReadinessScore);

  const todayName = new Date().toLocaleDateString(undefined, { weekday: "long" });
  const todayPlan = settings.weeklySchedule[todayName] ?? WEEKLY_TEMPLATE[todayName]?.join(" + ") ?? "Recovery + review";

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

  const stats = useMemo(() => {
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

  const saveReadiness = () => {
    const score = readinessScore(readinessDraft);
    const entry: ReadinessEntry = { date: localDateKey(), ...readinessDraft, score };
    setReadinessEntries((prev) => [entry, ...prev.filter((item) => item.date !== entry.date)]);
  };

  const toggleChecklist = (key: string) => {
    setDailyChecklist((prev) => ({
      ...prev,
      completed: {
        ...prev.completed,
        [key]: !prev.completed[key]
      }
    }));
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
    const payload: RoundLog = {
      id: toId(),
      ...roundDraft,
      score: Number(roundDraft.score),
      fairwaysHit: Number(roundDraft.fairwaysHit),
      gir: Number(roundDraft.gir),
      putts: Number(roundDraft.putts),
      penalties: Number(roundDraft.penalties),
      upAndDownMade: Number(roundDraft.upAndDownMade),
      upAndDownAttempted: Number(roundDraft.upAndDownAttempted),
      birdies: Number(roundDraft.birdies),
      doublesOrWorse: Number(roundDraft.doublesOrWorse),
      threePutts: Number(roundDraft.threePutts),
      soreness: Number(roundDraft.soreness),
      mentalGrade: Number(roundDraft.mentalGrade)
    };
    setRoundLogs((prev) => [payload, ...prev]);
    setRoundDraft((prev) => ({ ...prev, notes: "" }));
  };

  if (!ready) {
    return <main className="flex min-h-screen items-center justify-center text-muted">Loading Project Pinnacle...</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-bg px-4 pb-24 pt-5 text-text">
      <header className="mb-4 space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-sand">Road to Gamble Sands</p>
        <h1 className="text-2xl font-bold">Project Pinnacle</h1>
        <p className="text-sm text-muted">Do today&apos;s work, {settings.preferredName}.</p>
      </header>

      {activeTab === "today" ? (
        <div className="space-y-4">
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <SectionTitle title={`${countdown} days to tee off`} subtitle={settings.tournamentName} />
              <Pill tone="sand">{currentPhase}</Pill>
            </div>
            <ProgressBar value={progressToTournament} />
            <p className="mt-2 text-xs text-muted">{settings.course}</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <SectionTitle title={`Readiness ${latestReadinessScore}/100`} subtitle={readinessState.label} />
              <Pill tone={readinessState.tone}>{readinessState.label}</Pill>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {READINESS_KEYS.map((key) => (
                <label key={key} className="space-y-1 text-xs text-muted">
                  <span className="capitalize">{key === "wristsHands" ? "Wrists/Hands" : key}</span>
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
            <button className={`${buttonClass} mt-3 w-full`} onClick={saveReadiness}>
              Log Today
            </button>
          </Card>

          <Card>
            <SectionTitle title="Today plan" subtitle={`${todayName}: ${todayPlan}`} />
            <p className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-text">{todayPlan}</p>
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
            <SectionTitle title="Today's mobility checklist" subtitle="Tap each item as you complete it." />
            <Checklist
              items={DAILY_MOBILITY}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="mobility"
            />
          </Card>

          <Card>
            <SectionTitle title="Recovery checklist" subtitle="Fresh beats fried." />
            <Checklist
              items={RECOVERY_CHECKLIST}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="recovery"
            />
          </Card>

          <Card>
            <SectionTitle title="Emergency Swing Fix" subtitle="Use one thought. No hero swings today." />
            <ul className="space-y-1 text-sm text-text">
              <li>- 80% tempo</li>
              <li>- Full turn through finish</li>
              <li>- Chest faces target</li>
              <li>- Commit to one shot</li>
              <li>- Do not steer it</li>
            </ul>
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
                Drill
                <input
                  className={`${textInputClass} mt-1`}
                  value={practiceDraft.drillName}
                  onChange={(event) => setPracticeDraft((prev) => ({ ...prev, drillName: event.target.value }))}
                />
              </label>
              <label className="block text-xs text-muted">
                Result / score
                <input
                  className={`${textInputClass} mt-1`}
                  placeholder="Example: 23/30 playable"
                  value={practiceDraft.result}
                  onChange={(event) => setPracticeDraft((prev) => ({ ...prev, result: event.target.value }))}
                />
              </label>
              <label className="block text-xs text-muted">
                Notes (optional)
                <textarea
                  className={`${textInputClass} mt-1 min-h-20`}
                  placeholder="Tempo wins. Turn through finish."
                  value={practiceDraft.notes}
                  onChange={(event) => setPracticeDraft((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </label>
              <button className={`${buttonClass} w-full`} onClick={addPracticeLog}>
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
            <SectionTitle title="Daily 15-min mobility" subtitle="Durability for 5 rounds starts here." />
            <Checklist
              items={DAILY_MOBILITY}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="mobility"
            />
          </Card>

          {Object.entries(ROUTINES).map(([name, items]) => (
            <Card key={name}>
              <SectionTitle title={`${name} routine`} />
              <Checklist
                items={items}
                checkedMap={dailyChecklist.completed}
                onToggle={toggleChecklist}
                prefix={name.toLowerCase().replace(/[^a-z]/g, "")}
              />
            </Card>
          ))}

          <Card>
            <SectionTitle title="Strength A" subtitle="Never train to failure. Quality reps only." />
            <Checklist
              items={STRENGTH_A}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="strengtha"
            />
          </Card>

          <Card>
            <SectionTitle title="Strength B" subtitle="Stop if back pain increases." />
            <Checklist
              items={STRENGTH_B}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="strengthb"
            />
            <p className="mt-3 text-xs text-muted">
              Deload week: reduce strength volume by 40-50%. Focus on mobility, sleep, and confidence.
            </p>
          </Card>
        </div>
      ) : null}

      {activeTab === "stats" ? (
        <div className="space-y-4">
          <Card>
            <SectionTitle title="Round log" subtitle="Track scoring consistency. Avoid blow-up holes." />
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["date", "date"],
                  ["course", "text"],
                  ["score", "number"],
                  ["tees", "text"],
                  ["fairwaysHit", "number"],
                  ["gir", "number"],
                  ["putts", "number"],
                  ["penalties", "number"],
                  ["upAndDownMade", "number"],
                  ["upAndDownAttempted", "number"],
                  ["birdies", "number"],
                  ["doublesOrWorse", "number"],
                  ["threePutts", "number"],
                  ["soreness", "number"],
                  ["mentalGrade", "number"]
                ] as const
              ).map(([field, type]) => (
                <label key={field} className="text-xs text-muted">
                  {field}
                  <input
                    type={type}
                    className={`${numberInputClass} mt-1`}
                    value={roundDraft[field]}
                    onChange={(event) =>
                      setRoundDraft((prev) => ({
                        ...prev,
                        [field]: type === "number" ? Number(event.target.value) : event.target.value
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
            <button className={`${buttonClass} mt-3 w-full`} onClick={addRoundLog}>
              Save Round
            </button>
          </Card>

          <Card>
            <SectionTitle title="Performance dashboard" subtitle="Target: 79-84 range with no blow-up rounds." />
            {stats ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Metric label="Avg score" value={stats.avgScore} />
                <Metric label="Avg fairways" value={stats.avgFairways} />
                <Metric label="Avg GIR" value={stats.avgGir} />
                <Metric label="Avg putts" value={stats.avgPutts} />
                <Metric label="Avg penalties" value={stats.avgPenalties} />
                <Metric label="Doubles / round" value={stats.avgDoubles} />
                <Metric label="Soreness trend" value={stats.avgSoreness} />
                <Metric label="Best round" value={String(stats.bestRound)} />
                <div className="col-span-2 rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs text-muted">Recent 5-round trend</p>
                  <p className="mt-1 font-semibold">{stats.recentFive.join(" • ") || "n/a"}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">Log your first round to unlock dashboard metrics.</p>
            )}
          </Card>

          <Card>
            <SectionTitle title="Target stat card" />
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
            <SectionTitle title="Tournament week schedule" subtitle="Win the next shot." />
            <Checklist
              items={TOURNAMENT_TIMELINE}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="timeline"
            />
          </Card>

          <Card>
            <SectionTitle title="40-minute warm-up" />
            <Checklist
              items={WARMUP_40}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="warmup"
            />
          </Card>

          <Card>
            <SectionTitle title="Emergency swing fixes" subtitle="One cue per swing." />
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
          </Card>

          <Card>
            <SectionTitle title="Packing list" />
            <Checklist
              items={PACKING_LIST}
              checkedMap={dailyChecklist.completed}
              onToggle={toggleChecklist}
              prefix="pack"
            />
          </Card>

          <Card>
            <SectionTitle title="Tournament binder / manual" subtitle="Quick cards for pressure moments." />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <MiniCard title="Swing Keys" lines={SWING_KEYS} />
              <MiniCard title="Mobility" lines={["15 min daily", "Hips + back + shoulders", "Keep wrists supple"]} />
              <MiniCard title="Warm-up" lines={["40 min sequence", "No over-hitting driver", "Speed + rhythm"]} />
              <MiniCard title="Recovery" lines={["Hydrate", "Protein", "Foam roll", "Sleep by 9:30"]} />
              <MiniCard title="Emergency Fixes" lines={["Tempo", "Turn through", "Trust target"]} />
              <MiniCard title="Tournament Goals" lines={["79-84 range", "No blow-up holes", "Stay fresh"]} />
            </div>
            <a
              href="#"
              className="mt-3 inline-flex rounded-xl border border-white/20 px-3 py-2 text-xs text-muted hover:text-text"
            >
              Printable PDF (placeholder)
            </a>
          </Card>

          <Card>
            <SectionTitle title="Customize Project Pinnacle" subtitle="Edit settings anytime." />
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
          </Card>

          <Card>
            <SectionTitle title="7-week periodization" />
            <ul className="space-y-1 text-sm text-text">
              {PERIODIZATION.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </Card>
        </div>
      ) : null}

      <BottomTabs active={activeTab} onChange={setActiveTab} />
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
