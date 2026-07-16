export type TabKey = "today" | "practice" | "recovery" | "performance" | "field" | "tournament";

export type Phase =
  | "Foundation"
  | "Build"
  | "Simulation"
  | "Deload"
  | "Tournament Week";

export interface Settings {
  name: string;
  preferredName: string;
  handicap: string;
  ghinNumber?: string;
  goalHandicap: string;
  goalScore: string;
  tournamentDate: string;
  tournamentName: string;
  course: string;
  teeTime: string;
  weeklySchedule: Record<string, string>;
  drillTargets: Record<string, string>;
  wedgeDistances: string;
  clubsInBag: string;
  sorenessAreas: string;
  strengthDays: string;
  practiceAvailability: string;
}

export interface ReadinessEntry {
  date: string;
  sleep: number;
  energy: number;
  back: number;
  hips: number;
  shoulders: number;
  wristsHands: number;
  stress: number;
  confidence: number;
  score: number;
}

export interface PracticeLog {
  id: string;
  date: string;
  section: string;
  drillName: string;
  result: string;
  notes: string;
}

export interface RoundLog {
  id: string;
  date: string;
  course: string;
  score: number;
  tees: string;
  fairwaysHit: number;
  gir: number;
  putts: number;
  penalties: number;
  upAndDownMade: number;
  upAndDownAttempted: number;
  birdies: number;
  doublesOrWorse: number;
  threePutts: number;
  soreness: number;
  mentalGrade: number;
  notes: string;
  /* "ghin" = imported via GHIN sync; absent/manual = logged in-app */
  source?: "ghin" | "manual";
  /* false = score-only import; excluded from per-stat averages */
  hasStats?: boolean;
  /* USGA course rating from GHIN — used to exclude executive/par-3 courses
     (rating < 66) from regulation scoring stats */
  courseRating?: number | null;
}

export interface ChecklistState {
  date: string;
  completed: Record<string, boolean>;
}

export interface Drill {
  section: string;
  name: string;
  purpose: string;
  time: string;
  reps: string;
  metric: string;
  instructions: string[];
  tutorial: string;
  tips: string[];
  tricks: string[];
  videoUrl: string;
}

export interface CoachingGuide {
  tutorial: string;
  tip: string;
  trick: string;
  videoUrl: string;
}
