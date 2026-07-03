import { GAMBLE_SANDS, TRAINING_PHASES, USER } from "@/lib/constants";
import type { TrainingPhaseId } from "@/types";

export interface WeeklyFocus {
  title: string;
  priorities: string[];
  practice: string;
  recovery: string;
}

const WEEKLY_FOCUS: Record<TrainingPhaseId, WeeklyFocus> = {
  foundation: {
    title: "Build the base",
    priorities: [
      "Daily 15-min mobility — non-negotiable",
      "Contact quality over distance",
      "Log every practice session",
    ],
    practice: "Irons + wedge clock system",
    recovery: "Hip flow + sleep prep routine",
  },
  build: {
    title: "Add pressure and patterns",
    priorities: [
      "One focused practice block daily",
      "Simulate on-course decisions in wedges",
      "Track fairways, GIR, and putts when you play",
    ],
    practice: "Random yardages + putting gate drill",
    recovery: "Foam roll + hydration target",
  },
  peak: {
    title: "Sharpen for competition",
    priorities: [
      "Shorter, sharper practice sessions",
      "Pre-shot routine on every ball",
      "Dial nutrition and sleep timing",
    ],
    practice: "Up & down 9 + driver alignment gate",
    recovery: "Massage gun + strength circuit",
  },
  tournament: {
    title: "Execute under pressure",
    priorities: [
      "Trust the prep — no major swing changes",
      "40-min warmup before each round",
      "One thought per shot",
    ],
    practice: "Short game only — feel and tempo",
    recovery: "Mobility + hydration + early sleep",
  },
};

const PHASE_DESCRIPTIONS: Record<TrainingPhaseId, string> = {
  foundation: "Groove contact, build mobility habit, establish baseline stats.",
  build: "Increase volume intelligently. Connect practice to scoring patterns.",
  peak: "Reduce volume, increase specificity. Tournament simulation.",
  tournament: "Race week. Fresh body, clear mind, execute the plan.",
};

export function getWeeklyFocus(phaseId: TrainingPhaseId): WeeklyFocus {
  return WEEKLY_FOCUS[phaseId] ?? WEEKLY_FOCUS.build;
}

export function getPhaseDescription(phaseId: TrainingPhaseId): string {
  return PHASE_DESCRIPTIONS[phaseId] ?? PHASE_DESCRIPTIONS.build;
}

export function resolvePhaseId(daysUntil: number): TrainingPhaseId {
  if (daysUntil <= 7) return "tournament";
  if (daysUntil <= 21) return "peak";
  if (daysUntil <= 42) return "build";
  return "foundation";
}

export function getPeriodizationStatus(currentPhaseId: TrainingPhaseId) {
  return TRAINING_PHASES.map((phase) => ({
    ...phase,
    description: getPhaseDescription(phase.id),
    active: phase.id === currentPhaseId,
    complete:
      TRAINING_PHASES.findIndex((p) => p.id === phase.id) <
      TRAINING_PHASES.findIndex((p) => p.id === currentPhaseId),
  }));
}

export function getMissionSummary(daysUntil: number): string {
  if (daysUntil <= 7) {
    return `${daysUntil} days to ${GAMBLE_SANDS.name}. Protect energy. Execute the game plan.`;
  }
  if (daysUntil <= 30) {
    return `${daysUntil} days out. Every session should move the scoring needle.`;
  }
  return `${USER.firstName} is building toward ${USER.goalHandicap} handicap at ${GAMBLE_SANDS.name}.`;
}

export const WEEKLY_RHYTHM = [
  { day: "Mon", focus: "Mobility + iron ladder" },
  { day: "Tue", focus: "Wedge work + recovery" },
  { day: "Wed", focus: "Full practice + strength" },
  { day: "Thu", focus: "Mobility + putting" },
  { day: "Fri", focus: "Short game + log stats" },
  { day: "Sat", focus: "Practice round or sim" },
  { day: "Sun", focus: "Recovery + plan review" },
] as const;
