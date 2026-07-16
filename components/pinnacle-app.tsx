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
import {
  READINESS_KEYS,
  ReadinessKey,
  daysTo,
  estimateDurationMinutes,
  formatDate,
  localDateKey,
  parseDateKey,
  phaseForDate,
  planIntensity,
  readinessScore,
  swingKeyForToday
} from "@/lib/plan";
import { GhinSyncResult, ghinScoreToRound, isRegulationRound, mergeGhinRounds } from "@/lib/ghin";
import { enrichRoundWithGrintStats, GRINT_BASELINES, GRINT_TREND_URL, GRINT_TROPHIES } from "@/lib/grint-snapshot";
import { GHIN_2024, GHIN_PATTERN_INSIGHTS } from "@/lib/ghin-snapshot";
import { computeGhinRecords } from "@/lib/records";
import { parseScorecard, summarizeScorecard, type ParsedScorecard } from "@/lib/scorecard-import";
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
  MissPatternBar,
  ProgressRing,
  ScoreTrendChart,
  SkillRadar,
  TargetMeter
} from "@/components/charts";
import { DrillDiagram } from "@/components/drill-diagrams";
import { ChevronDown, Clock3, Flame, Gauge, Link2, Play, Quote, RefreshCw, Target } from "lucide-react";

const toId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const textInputClass =
  "w-full rounded-xl border border-white/10 bg-well px-3 py-2 text-sm text-text outline-none transition focus:border-sand/60";
const buttonClass =
  "rounded-xl border border-sand/50 bg-sand/[0.12] px-4 py-2.5 text-sm font-semibold text-sand transition hover:bg-sand/20 active:scale-[0.99]";

const roundFieldConfig: Array<{
  key: keyof Omit<
    RoundLog,
    "id" | "notes" | "source" | "hasStats" | "courseRating" | "front9" | "back9" | "differential" | "eagles"
  >;
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

  const [ghinSync, setGhinSync] = useLocalStorage<{
    lastSynced: string | null;
    handicapIndex: string | null;
    lowHandicapIndex: string | null;
  }>("pp-ghin-sync", { lastSynced: null, handicapIndex: null, lowHandicapIndex: null });
  const [ghinEmail, setGhinEmail] = useState("");
  const [ghinPassword, setGhinPassword] = useState("");
  const [ghinBusy, setGhinBusy] = useState(false);
  const [ghinMessage, setGhinMessage] = useState<{ tone: "green" | "danger"; text: string } | null>(null);

  const [importText, setImportText] = useState("");
  const [importDate, setImportDate] = useState(localDateKey());
  const [importCourse, setImportCourse] = useState("");
  const [importPreview, setImportPreview] = useState<ParsedScorecard | null>(null);
  const [importMessage, setImportMessage] = useState<{ tone: "green" | "danger"; text: string } | null>(null);

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
  const swingKeyOfTheDay = swingKeyForToday(SWING_KEYS);

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
    /* Regulation rounds only for scoring stats — executive/par-3 courses
       (e.g. a 73 on a par-60) stay in history but would distort the 79-84
       trend and averages. */
    const regulation = roundLogs.filter(isRegulationRound);
    if (regulation.length === 0) {
      return null;
    }
    const mean = (values: number[]) =>
      values.length > 0 ? values.reduce((total, v) => total + v, 0) / values.length : null;
    /* Each stat averages only over rounds that actually carry it: GHIN
       imports zero-fill stats GHIN never tracked, and treating those zeros
       as data drags every average toward zero. Detail stats (penalties,
       birdies, three-putts, soreness) only exist on manually logged rounds. */
    const puttsAvg = mean(regulation.filter((r) => r.putts > 0).map((r) => r.putts));
    const fairwaysAvg = mean(regulation.filter((r) => r.fairwaysHit > 0).map((r) => r.fairwaysHit));
    const girAvg = mean(regulation.filter((r) => r.gir > 0).map((r) => r.gir));
    /* Hole-count stats (birdies, doubles, three-putts) exist on journal
       rounds AND pasted scorecards; penalties and soreness only on journal
       rounds — imports would zero-fill them. */
    const detail = regulation.filter((r) => r.source !== "ghin" && r.hasStats !== false);
    const journal = detail.filter((r) => r.source !== "import");
    const scrambleRounds = regulation.filter((r) => r.upAndDownAttempted > 0);
    const scrambleMade = scrambleRounds.reduce((total, r) => total + r.upAndDownMade, 0);
    const scrambleAttempted = scrambleRounds.reduce((total, r) => total + r.upAndDownAttempted, 0);
    const chronological = [...regulation].sort(
      (a, b) => parseDateKey(a.date).getTime() - parseDateKey(b.date).getTime()
    );
    return {
      rounds: regulation.length,
      avgScore: (regulation.reduce((total, r) => total + r.score, 0) / regulation.length).toFixed(1),
      bestRound: Math.min(...regulation.map((r) => r.score)),
      avgPutts: puttsAvg,
      avgFairways: fairwaysAvg,
      avgGir: girAvg,
      avgPenalties: mean(journal.map((r) => r.penalties)),
      avgDoubles: mean(detail.map((r) => r.doublesOrWorse)),
      avgBirdies: mean(detail.map((r) => r.birdies)),
      avgThreePutts: mean(detail.filter((r) => r.putts > 0).map((r) => r.threePutts)),
      avgSoreness: mean(journal.filter((r) => r.soreness > 0).map((r) => r.soreness)),
      scramblingPct: scrambleAttempted > 0 ? (scrambleMade / scrambleAttempted) * 100 : null,
      trendScores: chronological.map((round) => round.score),
      trendDates: chronological.map((round) => formatDate(round.date))
    };
  }, [roundLogs]);

  const lastRound = useMemo(() => {
    if (roundLogs.length === 0) {
      return null;
    }
    return [...roundLogs].sort((a, b) => parseDateKey(b.date).getTime() - parseDateKey(a.date).getTime())[0];
  }, [roundLogs]);

  const ghinRecords = useMemo(() => computeGhinRecords(roundLogs), [roundLogs]);
  const pbScore = ghinRecords.find((tile) => tile.label === "Best score")?.value;
  const pbNine = ghinRecords.find((tile) => tile.label === "Best 9 holes")?.value;

  const practiceFocus = useMemo(() => {
    if (!lastRound || lastRound.hasStats === false) {
      return null;
    }
    const isGhin = lastRound.source === "ghin";
    /* GHIN imports zero-fill detail stats they never carried — only judge
       a synced round on the stats it actually has. */
    if (!isGhin && lastRound.threePutts >= 2) {
      return { section: "Putting", reason: `${lastRound.threePutts} three-putts last round` };
    }
    if (!isGhin && lastRound.penalties >= 2) {
      return { section: "Driver", reason: `${lastRound.penalties} penalty strokes last round` };
    }
    if (!isGhin && lastRound.upAndDownAttempted > 0 && lastRound.upAndDownMade / lastRound.upAndDownAttempted < 0.4) {
      return {
        section: "Short Game",
        reason: `${lastRound.upAndDownMade}/${lastRound.upAndDownAttempted} up-and-downs last round`
      };
    }
    if (lastRound.putts >= 36) {
      return { section: "Putting", reason: `${lastRound.putts} putts last round` };
    }
    if (lastRound.fairwaysHit > 0 && lastRound.fairwaysHit < 7) {
      return { section: "Driver", reason: `${lastRound.fairwaysHit} fairways last round` };
    }
    if (lastRound.gir > 0 && lastRound.gir < 6) {
      return { section: "Irons", reason: `${lastRound.gir} greens in regulation last round` };
    }
    return { section: "Wedges", reason: "ball-striking on target — sharpen scoring clubs" };
  }, [lastRound]);

  const syncGhin = async () => {
    if (!ghinEmail.trim() || !ghinPassword) {
      setGhinMessage({ tone: "danger", text: "Enter your GHIN email and password to sync." });
      return;
    }
    setGhinBusy(true);
    setGhinMessage(null);
    try {
      const response = await fetch("/api/ghin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: ghinEmail.trim(),
          password: ghinPassword,
          ghinNumber: settings.ghinNumber ?? DEFAULT_SETTINGS.ghinNumber
        })
      });
      const data = (await response.json()) as (GhinSyncResult & { error?: string }) | { error: string };
      if (!response.ok || "error" in data && data.error) {
        setGhinMessage({ tone: "danger", text: ("error" in data && data.error) || "GHIN sync failed." });
        return;
      }
      const result = data as GhinSyncResult;
      const syncedRounds = result.scores
        .filter((score) => score.holes === 18 && score.scoreType?.toUpperCase() !== "N")
        .map((score) => enrichRoundWithGrintStats(ghinScoreToRound(score)));
      const { rounds, added } = mergeGhinRounds(roundLogs, syncedRounds);
      setRoundLogs(rounds);
      if (result.handicapIndex) {
        setSettings((prev) => ({ ...prev, handicap: result.handicapIndex as string }));
      }
      setGhinSync({
        lastSynced: new Date().toISOString(),
        handicapIndex: result.handicapIndex,
        lowHandicapIndex: result.lowHandicapIndex
      });
      setGhinPassword("");
      if (result.scores.length === 0) {
        setGhinMessage({
          tone: "danger",
          text: `Login worked (index ${result.handicapIndex ?? "n/a"}) but GHIN returned no score history.${
            result.debug ? ` Diagnostics: ${result.debug.join(" · ")}` : ""
          }`
        });
      } else {
        setGhinMessage({
          tone: "green",
          text: `Synced ${result.scores.length} GHIN scores — ${added} new round${added === 1 ? "" : "s"} imported${
            result.handicapIndex ? ` · index ${result.handicapIndex}` : ""
          }.`
        });
      }
    } catch {
      setGhinMessage({ tone: "danger", text: "Network error reaching the GHIN sync service." });
    } finally {
      setGhinBusy(false);
    }
  };

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

  const deleteRound = (id: string) => {
    setRoundLogs((prev) => prev.filter((round) => round.id !== id));
  };

  const previewImport = () => {
    setImportMessage(null);
    const parsed = parseScorecard(importText);
    if ("error" in parsed) {
      setImportPreview(null);
      setImportMessage({ tone: "danger", text: parsed.error });
      return;
    }
    setImportPreview(parsed);
  };

  const saveImport = () => {
    if (!importPreview) {
      return;
    }
    const duplicate = roundLogs.some(
      (round) => round.date === importDate && round.score === importPreview.totalScore
    );
    if (duplicate) {
      setImportMessage({ tone: "danger", text: "A round with this date and score already exists." });
      return;
    }
    setRoundLogs((prev) => [
      {
        id: toId(),
        date: importDate,
        course: importCourse.trim() || settings.course,
        score: importPreview.totalScore,
        tees: "",
        fairwaysHit: 0,
        gir: 0,
        putts: importPreview.totalPutts ?? 0,
        penalties: 0,
        upAndDownMade: 0,
        upAndDownAttempted: 0,
        birdies: importPreview.birdies,
        doublesOrWorse: importPreview.doublesOrWorse,
        threePutts: importPreview.threePutts,
        soreness: 0,
        mentalGrade: 0,
        notes: `Imported scorecard · ${summarizeScorecard(importPreview)}`,
        source: "import",
        hasStats: true,
        front9: importPreview.front9,
        back9: importPreview.back9,
        eagles: importPreview.eagles
      },
      ...prev
    ]);
    setImportMessage({ tone: "green", text: `Saved: ${summarizeScorecard(importPreview)}` });
    setImportPreview(null);
    setImportText("");
  };

  const removeAllGhinRounds = () => {
    setRoundLogs((prev) => prev.filter((round) => round.source !== "ghin"));
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
      <header className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Eyebrow>Road to Gamble Sands</Eyebrow>
            <h1 className="mt-1.5 font-display text-[34px] font-semibold leading-none tracking-tight">
              Project Pinnacle
            </h1>
            <p className="mt-2 text-sm text-muted">Do today&apos;s work, {settings.preferredName}.</p>
          </div>
          <div className="well flex shrink-0 flex-col items-center rounded-2xl px-3.5 py-2.5">
            <span className="font-display text-2xl font-semibold leading-none text-sand">{countdown}</span>
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-faint">days out</span>
          </div>
        </div>
      </header>

      {activeTab === "today" ? (
        <div className="space-y-4">
          <Card hero className="rise-in">
            <Eyebrow>Daily Command</Eyebrow>
            <h2 className="mt-2 font-display text-2xl font-semibold leading-snug text-text">{todayPlan}</h2>
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
            <p className="mt-3 text-sm leading-relaxed text-muted">
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
            <button type="button" className={`${buttonClass} mt-4 w-full`} onClick={startTodaysPlan}>
              <Play size={15} className="mr-2 inline-block" />
              Start Today&apos;s Plan
            </button>
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
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <span>
                Index <strong className="text-sand">{settings.handicap}</strong>
                {ghinSync.lowHandicapIndex ? ` · low ${ghinSync.lowHandicapIndex}` : ""} → goal{" "}
                <strong className="text-turf">{settings.goalHandicap}</strong>
              </span>
              {lastRound ? (
                <span>
                  Last round <strong className="text-text">{lastRound.score}</strong> ·{" "}
                  {formatDate(lastRound.date)}
                </span>
              ) : null}
              {pbScore ? (
                <span>
                  PB <strong className="text-turf">{pbScore}</strong>
                  {pbNine ? (
                    <>
                      {" "}
                      · best 9: <strong className="text-turf">{pbNine}</strong>
                    </>
                  ) : null}
                </span>
              ) : null}
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
          {practiceFocus ? (
            <Card hero className="rise-in">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Eyebrow>Today&apos;s focus · from your last round</Eyebrow>
                  <h3 className="mt-1 font-display text-lg font-semibold">{practiceFocus.section}</h3>
                  <p className="mt-1 text-xs text-muted">{practiceFocus.reason}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDrillFilter(practiceFocus.section)}
                  className={buttonClass}
                >
                  <Target size={14} className="mr-2 inline-block" />
                  Show drills
                </button>
              </div>
            </Card>
          ) : null}
          <Card className="rise-in">
            <SectionTitle
              eyebrow="Pattern watch · GHIN"
              title="Your real misses"
              subtitle="From your GHIN shot patterns — aim practice at these."
            />
            <ul className="space-y-1.5">
              {GHIN_PATTERN_INSIGHTS.slice(0, 3).map((insight) => (
                <li key={insight} className="flex gap-2 text-xs leading-relaxed text-muted">
                  <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-sand/70" />
                  {insight}
                </li>
              ))}
            </ul>
          </Card>

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
          {lastRound && lastRound.hasStats !== false && lastRound.soreness >= 6 ? (
            <Card hero className="rise-in">
              <Eyebrow>Recovery priority</Eyebrow>
              <p className="mt-2 text-sm leading-relaxed text-text">
                You logged soreness {lastRound.soreness}/10 after your last round ({formatDate(lastRound.date)}).
                Prioritize the {settings.sorenessAreas.split(",")[0]?.trim().toLowerCase() ?? "back"} routine below
                and keep today&apos;s loading light.
              </p>
            </Card>
          ) : null}
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
                <p className="text-sm text-muted">
                  Log a round below or sync your GHIN history to draw the scoring trend.
                </p>
              </div>
            )}
          </Card>

          <CollapsibleCard
            title="GHIN + TheGrint sync"
            subtitle={
              ghinSync.lastSynced
                ? `Last synced ${new Date(ghinSync.lastSynced).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  })} · index ${ghinSync.handicapIndex ?? settings.handicap}`
                : "Pull your posted rounds and live handicap index into every tab."
            }
            defaultOpen={roundLogs.length === 0}
          >
            <div className="space-y-3">
              <div className="well rounded-xl p-3 text-xs leading-relaxed text-muted">
                <p>
                  <Link2 size={12} className="mr-1.5 inline-block text-sand" />
                  Rounds you post in <span className="text-text">TheGrint</span> flow to your GHIN record
                  automatically, so one GHIN sync captures both. Your password is sent once to GHIN to fetch
                  scores and is never stored.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs text-muted">
                  GHIN number
                  <input
                    className={`${textInputClass} mt-1`}
                    inputMode="numeric"
                    value={settings.ghinNumber ?? DEFAULT_SETTINGS.ghinNumber ?? ""}
                    onChange={(event) => setSettings((prev) => ({ ...prev, ghinNumber: event.target.value }))}
                  />
                </label>
                <label className="block text-xs text-muted">
                  GHIN email
                  <input
                    type="email"
                    autoComplete="username"
                    className={`${textInputClass} mt-1`}
                    value={ghinEmail}
                    onChange={(event) => setGhinEmail(event.target.value)}
                  />
                </label>
              </div>
              <label className="block text-xs text-muted">
                GHIN password
                <input
                  type="password"
                  autoComplete="current-password"
                  className={`${textInputClass} mt-1`}
                  value={ghinPassword}
                  onChange={(event) => setGhinPassword(event.target.value)}
                />
              </label>
              <button type="button" className={`${buttonClass} w-full`} onClick={syncGhin} disabled={ghinBusy}>
                <RefreshCw size={14} className={`mr-2 inline-block ${ghinBusy ? "animate-spin" : ""}`} />
                {ghinBusy ? "Syncing with GHIN..." : "Sync GHIN rounds"}
              </button>
              {ghinMessage ? (
                <p className={`text-xs ${ghinMessage.tone === "green" ? "text-turf" : "text-danger"}`}>
                  {ghinMessage.text}
                </p>
              ) : null}
              <p className="text-[10px] leading-relaxed text-faint">
                Synced rounds carry your score, date, course, and tees; GHIN only includes putts/fairways/greens
                when you entered them while posting. Score-only rounds feed the trend and averages without
                skewing the per-stat target meters.
              </p>
            </div>
          </CollapsibleCard>

          <CollapsibleCard
            title="Paste a scorecard"
            subtitle="TheGrint blocks automated access — but any scorecard page copies as text. Select-all on a GHIN or Grint scorecard, copy, paste here for full hole-by-hole stats."
          >
            <div className="space-y-3">
              <textarea
                className={`${textInputClass} min-h-28 font-mono text-xs`}
                placeholder={"Paste the copied scorecard here — include the PAR, SCORE, and PUTTS rows."}
                value={importText}
                onChange={(event) => {
                  setImportText(event.target.value);
                  setImportPreview(null);
                }}
              />
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs text-muted">
                  Date played
                  <input
                    type="date"
                    className={`${textInputClass} mt-1`}
                    value={importDate}
                    onChange={(event) => setImportDate(event.target.value)}
                  />
                </label>
                <label className="block text-xs text-muted">
                  Course
                  <input
                    className={`${textInputClass} mt-1`}
                    placeholder={settings.course}
                    value={importCourse}
                    onChange={(event) => setImportCourse(event.target.value)}
                  />
                </label>
              </div>
              {importPreview ? (
                <div className="well rounded-xl p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-turf">Parsed</p>
                  <p className="mt-1 text-sm text-text">{summarizeScorecard(importPreview)}</p>
                </div>
              ) : null}
              {importPreview ? (
                <button type="button" className={`${buttonClass} w-full`} onClick={saveImport}>
                  Save this round
                </button>
              ) : (
                <button type="button" className={`${buttonClass} w-full`} onClick={previewImport}>
                  Parse scorecard
                </button>
              )}
              {importMessage ? (
                <p className={`text-xs ${importMessage.tone === "green" ? "text-turf" : "text-danger"}`}>
                  {importMessage.text}
                </p>
              ) : null}
            </div>
          </CollapsibleCard>

          <Card className="rise-in">
            <SectionTitle
              eyebrow="GHIN 2024 season"
              title="Shot patterns"
              subtitle="From your GHIN advanced stats (5 rounds, patterns from the 2 stat-tracked). This is where strokes hide."
            />
            <div className="mb-4 grid grid-cols-3 gap-2">
              <StatCard label="Avg putts" value={GHIN_2024.avgPutts.toFixed(1)} tone="green" sub="stat-tracked rounds" />
              <StatCard label="Up & downs" value={GHIN_2024.upDownsPerRound.toFixed(1)} sub="per round" />
              <StatCard label="Par or better" value={`${GHIN_2024.parOrBetterPct}%`} sub="of holes" />
              <StatCard label="Par 3s" value={GHIN_2024.parAverages.par3.toFixed(2)} sub="avg score" />
              <StatCard label="Par 4s" value={GHIN_2024.parAverages.par4.toFixed(2)} sub="avg score" />
              <StatCard label="Par 5s" value={GHIN_2024.parAverages.par5.toFixed(2)} sub="avg score" />
            </div>
            <div className="space-y-4">
              <MissPatternBar title="Approach shots — where they end up" segments={GHIN_2024.approachMiss} />
              <MissPatternBar title="Tee shots — where they end up" segments={GHIN_2024.drivingMiss} />
            </div>
            <div className="well mt-4 rounded-xl p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sand">Read of the patterns</p>
              <ul className="mt-2 space-y-1.5">
                {GHIN_PATTERN_INSIGHTS.map((insight) => (
                  <li key={insight} className="flex gap-2 text-xs leading-relaxed text-muted">
                    <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-sand/70" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {!performanceStats ? (
            <Card className="rise-in">
              <SectionTitle
                eyebrow="TheGrint baseline"
                title="Where your game stands"
                subtitle={`Career baselines from your TheGrint account through ${formatDate(
                  GRINT_BASELINES.capturedAt
                )}. Sync GHIN above to replace these with live rounds.`}
              />
              <div className="mb-4 grid grid-cols-2 gap-2">
                <StatCard label="Avg score" value={String(GRINT_BASELINES.avgScore)} tone="sand" />
                <StatCard
                  label="Best score"
                  value={String(GRINT_BASELINES.bestScore)}
                  tone="green"
                  sub={GRINT_BASELINES.bestScoreCourse}
                />
                <StatCard label="Rounds posted" value={String(GRINT_BASELINES.roundsPlayed)} />
                <StatCard label="Handicap index" value={GRINT_BASELINES.handicapIndex} sub="USGA / GHIN" />
              </div>
              <div className="space-y-4">
                <TargetMeter
                  label="Fairways hit"
                  value={GRINT_BASELINES.avgFairwaysPerRound}
                  target={8}
                  max={14}
                />
                <TargetMeter label="Greens in regulation" value={GRINT_BASELINES.avgGirPerRound} target={7} max={18} />
                <TargetMeter label="Putts" value={GRINT_BASELINES.avgPutts} target={30} max={40} lowerIsBetter />
                <TargetMeter
                  label="Scrambling"
                  value={GRINT_BASELINES.scramblingPct}
                  target={40}
                  max={100}
                  format={(v) => `${v.toFixed(0)}%`}
                />
              </div>
              <a
                href={GRINT_TREND_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-sand/50 bg-sand/10 px-3 py-1.5 text-xs font-semibold text-sand transition hover:bg-sand/20"
              >
                <Link2 size={12} />
                Open TheGrint trends
              </a>
            </Card>
          ) : null}

          {performanceStats ? (
            <>
              <Card className="rise-in">
                <SectionTitle eyebrow="Averages" title="Performance dashboard" />
                <div className="grid grid-cols-2 gap-2">
                  <StatCard
                    label="Avg score"
                    value={performanceStats.avgScore}
                    tone="sand"
                    sub={`${performanceStats.rounds} regulation rounds`}
                  />
                  <StatCard label="Best round" value={String(performanceStats.bestRound)} tone="green" />
                  <StatCard
                    label="Three-putts"
                    value={performanceStats.avgThreePutts !== null ? performanceStats.avgThreePutts.toFixed(1) : "—"}
                    sub={performanceStats.avgThreePutts !== null ? "per round · target 0" : "log a round in-app to track"}
                  />
                  <StatCard
                    label="Soreness"
                    value={performanceStats.avgSoreness !== null ? performanceStats.avgSoreness.toFixed(1) : "—"}
                    sub={performanceStats.avgSoreness !== null ? "post-round avg" : "log a round in-app to track"}
                  />
                </div>
              </Card>

              <Card className="rise-in">
                <SectionTitle
                  eyebrow="Target card"
                  title="Tournament targets"
                  subtitle="Round averages vs. what a 79–84 round requires. Green fill = on target. Stats your synced rounds don't carry fall back to your TheGrint career baseline."
                />
                <div className="space-y-4">
                  <TargetMeter
                    label="Fairways hit"
                    value={performanceStats.avgFairways ?? GRINT_BASELINES.avgFairwaysPerRound}
                    target={8}
                    max={14}
                    caption={performanceStats.avgFairways === null ? "TheGrint career baseline" : undefined}
                  />
                  <TargetMeter
                    label="Greens in regulation"
                    value={performanceStats.avgGir ?? GRINT_BASELINES.avgGirPerRound}
                    target={7}
                    max={18}
                    caption={performanceStats.avgGir === null ? "TheGrint career baseline" : undefined}
                  />
                  <TargetMeter
                    label="Putts"
                    value={performanceStats.avgPutts ?? GRINT_BASELINES.avgPutts}
                    target={30}
                    max={40}
                    lowerIsBetter
                    caption={performanceStats.avgPutts === null ? "TheGrint career baseline" : undefined}
                  />
                  {performanceStats.avgPenalties !== null ? (
                    <TargetMeter
                      label="Penalty strokes"
                      value={performanceStats.avgPenalties}
                      target={1}
                      max={4}
                      lowerIsBetter
                    />
                  ) : null}
                  {performanceStats.avgDoubles !== null ? (
                    <TargetMeter
                      label="Doubles or worse"
                      value={performanceStats.avgDoubles}
                      target={1}
                      max={4}
                      lowerIsBetter
                    />
                  ) : null}
                  {performanceStats.avgBirdies !== null ? (
                    <TargetMeter label="Birdies" value={performanceStats.avgBirdies} target={2} max={6} />
                  ) : null}
                  <TargetMeter
                    label="Scrambling"
                    value={performanceStats.scramblingPct ?? GRINT_BASELINES.scramblingPct}
                    target={40}
                    max={100}
                    format={(v) => `${v.toFixed(0)}%`}
                    caption={performanceStats.scramblingPct === null ? "TheGrint career baseline" : undefined}
                  />
                </div>
                <p className="mt-3 text-[10px] leading-relaxed text-faint">
                  Penalties, doubles, and birdies appear once you log a round in the journal below — GHIN doesn&apos;t
                  carry them.
                </p>
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

          <Card className="rise-in">
            <SectionTitle
              eyebrow="GHIN trophy room · live"
              title="Full-history records"
              subtitle="Computed from your complete GHIN posting history plus in-app rounds — updates on every sync. Beat one before August 20 and it updates itself."
            />
            <div className="grid grid-cols-2 gap-2">
              {ghinRecords.map((record) => (
                <StatCard
                  key={record.label}
                  label={record.label}
                  value={record.value}
                  sub={record.sub}
                  tone={record.tone}
                />
              ))}
            </div>
          </Card>

          <CollapsibleCard
            title="TheGrint trophy room"
            subtitle="The complete Grint record book — Grint-posted rounds only (42 since 2023)."
          >
            <div className="space-y-4">
              {GRINT_TROPHIES.map((group) => (
                <div key={group.group}>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sand">
                    {group.group}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {group.records.map((record) => (
                      <StatCard key={record.label} label={record.label} value={record.value} sub={record.sub} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleCard>

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

          {roundLogs.length > 0 ? (
            <CollapsibleCard
              title={`Round history (${roundLogs.length})`}
              subtitle="Every stored round. Delete anything that shouldn't count."
            >
              <div className="space-y-2">
                {[...roundLogs]
                  .sort((a, b) => parseDateKey(b.date).getTime() - parseDateKey(a.date).getTime())
                  .map((round) => (
                    <div key={round.id} className="well flex items-center gap-3 rounded-xl px-3 py-2.5">
                      <span className="w-9 shrink-0 text-lg font-semibold text-sand">{round.score}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-text">{round.course}</p>
                        <p className="text-[10px] text-faint">
                          {formatDate(round.date)}
                          {round.source === "ghin" ? " · GHIN" : round.source === "import" ? " · scorecard import" : " · logged here"}
                          {!isRegulationRound(round) ? " · executive course (not in stats)" : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteRound(round.id)}
                        aria-label={`Delete round ${round.score} on ${formatDate(round.date)}`}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-faint transition hover:border-danger/50 hover:text-danger"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
              {roundLogs.some((round) => round.source === "ghin") ? (
                <button
                  type="button"
                  onClick={removeAllGhinRounds}
                  className="mt-3 w-full rounded-xl border border-danger/40 bg-danger/[0.08] px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/15"
                >
                  Remove all GHIN-synced rounds
                </button>
              ) : null}
            </CollapsibleCard>
          ) : null}
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
              <HandicapBadge handicap={youPlayer.handicap} label={settings.handicap} />
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
          <Card hero className="rise-in">
            <Eyebrow>{settings.tournamentName}</Eyebrow>
            <h2 className="mt-2 font-display text-2xl font-semibold leading-snug">{settings.course}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Pill tone="sand">{formatDate(settings.tournamentDate)}</Pill>
              <Pill tone="default">Tee time {settings.teeTime}</Pill>
              <Pill tone="green">Goal {settings.goalScore}</Pill>
              <Pill tone="default">HCP {settings.handicap}</Pill>
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
                  ["ghinNumber", "GHIN number", "text"],
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
