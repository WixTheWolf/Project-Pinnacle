import { READINESS_WEIGHTS } from "@/lib/constants";
import type { PinnacleState, Readiness } from "@/types";

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function isSameDay(dateA: string, dateB: string): boolean {
  return dateA.split("T")[0] === dateB.split("T")[0];
}

function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(dateStr, yesterday.toISOString());
}

export function calculateReadiness(state: PinnacleState): Readiness {
  const today = todayISO();

  const todayTasks = state.dailyTasks;
  const completedTasks = todayTasks.filter((t) => t.completed).length;
  const taskScore = todayTasks.length > 0 ? (completedTasks / todayTasks.length) * 100 : 50;

  const todayRecovery = state.recoverySessions.filter((s) => isSameDay(s.date, today) && s.completed);
  const mobilityDone = todayRecovery.some((s) => s.category === "mobility");
  const recoveryDone = todayRecovery.length > 0;

  const todayPractice = state.practiceSessions.filter((s) => isSameDay(s.date, today) && s.completed);
  const practiceDone = todayPractice.length > 0;

  const hydrationDone = todayRecovery.some((s) => s.category === "hydration");
  const sleepDone = todayRecovery.some((s) => s.category === "sleep");

  const mobility = mobilityDone ? 100 : taskScore * 0.5;
  const practice = practiceDone ? 100 : 40;
  const recovery = recoveryDone ? 100 : 50;
  const sleep = sleepDone ? 100 : 70;
  const hydration = hydrationDone ? 100 : 60;

  const score = Math.round(
    mobility * READINESS_WEIGHTS.mobility +
      practice * READINESS_WEIGHTS.practice +
      recovery * READINESS_WEIGHTS.recovery +
      sleep * READINESS_WEIGHTS.sleep +
      hydration * READINESS_WEIGHTS.hydration
  );

  return {
    date: today,
    score: Math.min(100, Math.max(0, score)),
    mobility: Math.round(mobility),
    practice: Math.round(practice),
    recovery: Math.round(recovery),
    sleep: Math.round(sleep),
    hydration: Math.round(hydration),
  };
}

export function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function updateStreaks(state: PinnacleState): PinnacleState {
  const today = todayISO();
  const streaks = state.streaks.map((streak) => {
    let current = streak.current;

    if (streak.category === "mobility") {
      const done = state.recoverySessions.some(
        (s) => s.category === "mobility" && isSameDay(s.date, today) && s.completed
      );
      if (done) {
        current = streak.lastCompletedDate && isYesterday(streak.lastCompletedDate)
          ? streak.current + 1
          : 1;
      } else if (streak.lastCompletedDate && !isSameDay(streak.lastCompletedDate, today) && !isYesterday(streak.lastCompletedDate)) {
        current = 0;
      }
      if (done) return { ...streak, current, best: Math.max(streak.best, current), lastCompletedDate: today };
    }

    if (streak.id === "streak-practice") {
      const done = state.practiceSessions.some((s) => isSameDay(s.date, today) && s.completed);
      if (done) {
        current = streak.lastCompletedDate && isYesterday(streak.lastCompletedDate)
          ? streak.current + 1
          : 1;
      } else if (streak.lastCompletedDate && !isSameDay(streak.lastCompletedDate, today) && !isYesterday(streak.lastCompletedDate)) {
        current = 0;
      }
      if (done) return { ...streak, current, best: Math.max(streak.best, current), lastCompletedDate: today };
    }

    return streak;
  });

  return { ...state, streaks };
}

export function getMotivationalMessage(readiness: Readiness, daysUntil: number): string {
  if (daysUntil <= 7) {
    return "Race week energy. Trust the work. Execute one shot at a time.";
  }
  if (readiness.score >= 85) {
    return "You're dialed in. Maintain momentum and stay disciplined.";
  }
  if (readiness.score >= 65) {
    return "Solid foundation today. Complete your mobility and one focused practice block.";
  }
  if (readiness.practice < 50) {
    return "Get sticks in hand today. Even 20 minutes of intentional practice moves the needle.";
  }
  return "Start with mobility. A prepared body builds a prepared mind.";
}

export function getCurrentPhaseName(phaseId: string): string {
  const phases: Record<string, string> = {
    foundation: "Foundation",
    build: "Build",
    peak: "Peak",
    tournament: "Tournament",
  };
  return phases[phaseId] ?? "Build";
}

export function getHandicapProgress(current: number, goal: number): number {
  const totalDrop = current - goal;
  const currentDrop = 0;
  if (totalDrop <= 0) return 100;
  return Math.round((currentDrop / totalDrop) * 100);
}
