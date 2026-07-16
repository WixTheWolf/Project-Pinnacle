/* Shared plan/date helpers used by the daily briefing landing page and the
   main tabbed app. */

export const READINESS_KEYS = [
  "sleep",
  "energy",
  "back",
  "hips",
  "shoulders",
  "wristsHands",
  "stress",
  "confidence"
] as const;

export type ReadinessKey = (typeof READINESS_KEYS)[number];

export const localDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseDateKey = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const formatDate = (value: string) =>
  parseDateKey(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export function readinessScore(draft: Record<ReadinessKey, number>) {
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

export function planIntensity(score: number) {
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

export function phaseForDate(tournamentDate: string) {
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

export function daysTo(tournamentDate: string) {
  const now = new Date();
  const target = new Date(tournamentDate);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

export function estimateDurationMinutes(plan: string) {
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

export function swingKeyForToday(keys: readonly string[]) {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  return keys[dayOfYear % keys.length];
}
