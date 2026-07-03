"use client";

import { useEffect, useMemo } from "react";
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
import { ChecklistState, PracticeLog, ReadinessEntry, Settings, TabKey } from "@/lib/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { BottomTabs, Card, Checklist, CollapsibleCard, Pill, ProgressBar, SectionTitle } from "@/components/ui";
import { ChevronDown, Clock3, Flame, Gauge, Play, Target } from "lucide-react";

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

const GHIN_URL = "https://www.ghin.com/";
const GHIN_NUMBER = "11634237";
const THE_GRINT_URL = "https://thegrint.com/deeplink/profile/tgMTgxMjQ2NQ";

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

  const ready =
    settingsHydrated &&
    readinessHydrated &&
    practiceHydrated &&
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
            <SectionTitle
              title="Performance sync"
              subtitle="Enter scores once in GHIN or TheGrint. No double logging."
            />
            <div className="space-y-3">
              <a
                href={THE_GRINT_URL}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-sand/55 bg-sand/10 p-3 text-sm font-semibold text-sand hover:bg-sand/20"
              >
                Open TheGrint profile
              </a>
              <a
                href={GHIN_URL}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-white/20 bg-black/20 p-3 text-sm font-semibold text-text hover:border-white/35"
              >
                Open GHIN app / portal
              </a>
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-muted">Connected sources</p>
              <p className="mt-1 text-text">TheGrint profile and GHIN record</p>
              <p className="mt-1 text-xs text-muted">GHIN number: {GHIN_NUMBER}</p>
            </div>
          </Card>

          <Card>
            <SectionTitle title="Performance strategy" subtitle="Use official scoring apps as source of truth." />
            <p className="text-sm text-muted">
              Keep Project Pinnacle focused on preparation and decision-making. Track and attest every round in GHIN/TheGrint,
              then review trends there.
            </p>
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

      {activeTab === "field" ? (
        <div className="space-y-4">
          <Card
            className="field-hero-gradient overflow-hidden border-sand/35"
            style={{
              backgroundImage: `linear-gradient(145deg, rgba(17, 24, 39, 0.9), rgba(15, 23, 42, 0.88)), url('${STRAND_BRAND_ASSETS.heroImageUrl}')`,
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
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-sand">Gamble Sands Field</p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight text-white">Know the group. Prepare the edge.</h2>
            <p className="mt-2 max-w-[34ch] text-sm text-slate-200/90">
              Sourced from the current public Strand roster and handicap feed snapshot so Matt can prep with the right information.
            </p>
          </Card>

          <Card className="field-card-enter border-sand/45">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-sand">Featured player</p>
                <h3 className="mt-1 text-2xl font-semibold text-white">
                  {youPlayer.name} <span className="text-sand">({youPlayer.nickname})</span>
                </h3>
                <p className="text-sm text-muted">
                  You · {youPlayer.handedness === "Unknown" ? "Handedness not listed" : `${youPlayer.handedness}-handed`}
                </p>
              </div>
              <HandicapBadge handicap={youPlayer.handicap} label={youPlayer.handicapLabel} />
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="text-xs uppercase tracking-wide text-muted">Current focus</p>
              <p className="mt-1 text-sm text-text">{youPlayer.currentFocus}</p>
              <p className="mt-2 text-xs text-sand">Goal handicap: {settings.goalHandicap}</p>
              <p className="mt-2 text-xs text-muted">{youPlayer.bio}</p>
            </div>

            <div className="mt-3">
              <SkillBars skills={youPlayer.skills} compact />
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
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2"
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
            <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="text-xs uppercase tracking-wide text-muted">{settings.preferredName} edge map</p>
              <ul className="mt-2 space-y-1 text-sm">
                {yourSkillEdges.slice(0, 2).map((edge) => (
                  <li
                    key={edge.category}
                    className={edge.delta >= 0 ? "text-green-300" : "text-danger"}
                  >
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

          <div className="space-y-3">
            <SectionTitle title="Player profiles" subtitle="Who you are playing with, and what to know." />
            {opponents.map((player, idx) => (
              <details
                key={player.id}
                className="field-card-enter group rounded-2xl border border-white/10 bg-card p-4 shadow-soft [&_summary::-webkit-details-marker]:hidden"
                style={{ animationDelay: `${(idx + 1) * 45}ms` }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
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
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted">Profile snapshot</p>
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
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted">Strengths</p>
                      <ul className="mt-2 space-y-1 text-green-300">
                        {player.strengths.map((item) => (
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted">Weaknesses</p>
                      <ul className="mt-2 space-y-1 text-sand">
                        {player.weaknesses.map((item) => (
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted">Skill profile</p>
                    <div className="mt-2">
                      <SkillBars skills={player.skills} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted">Notes</p>
                    <p className="mt-1 text-sm text-text">{player.notes}</p>
                  </div>

                  <div className="rounded-xl border border-sand/30 bg-sand/5 p-3">
                    <p className="text-xs uppercase tracking-wide text-sand">Matchup insight</p>
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
          <div className="h-1.5 rounded-full bg-black/35">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-sand to-turf transition-all duration-300"
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
