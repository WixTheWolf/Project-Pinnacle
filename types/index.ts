export type Handedness = "left" | "right";

export type TrainingPhaseId = "foundation" | "build" | "peak" | "tournament";

export type PracticeCategory =
  | "driver"
  | "irons"
  | "wedges"
  | "putting"
  | "short-game"
  | "bunker"
  | "custom";

export type RecoveryCategory =
  | "mobility"
  | "stretching"
  | "foam-rolling"
  | "massage-gun"
  | "sleep"
  | "hydration"
  | "strength";

export interface User {
  id: string;
  firstName: string;
  fullName: string;
  age: number;
  handedness: Handedness;
  handicap: number;
  goalHandicap: number;
  createdAt: string;
  updatedAt: string;
}

export interface Drill {
  id: string;
  category: PracticeCategory;
  name: string;
  instructions: string[];
  purpose: string;
  successMetric: string;
  durationMinutes: number;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface PracticeSession {
  id: string;
  drillId: string;
  category: PracticeCategory;
  drillName: string;
  date: string;
  durationMinutes: number;
  successMetricValue?: number;
  notes?: string;
  completed: boolean;
  createdAt: string;
}

export interface Round {
  id: string;
  date: string;
  course?: string;
  score: number;
  fairwaysHit: number;
  fairwaysTotal: number;
  gir: number;
  girTotal: number;
  putts: number;
  penalties: number;
  birdies: number;
  doubles: number;
  threePutts: number;
  upAndDowns: number;
  upAndDownAttempts: number;
  notes?: string;
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  packingList: PackingItem[];
  warmupMinutes: number;
  nutritionPlan: NutritionItem[];
  swingFixes: SwingFix[];
  roundJournal: RoundJournalEntry[];
}

export interface PackingItem {
  id: string;
  label: string;
  category: "clubs" | "apparel" | "gear" | "nutrition" | "other";
  packed: boolean;
}

export interface NutritionItem {
  id: string;
  timing: string;
  description: string;
  completed: boolean;
}

export interface SwingFix {
  id: string;
  issue: string;
  fix: string;
  priority: "high" | "medium" | "low";
}

export interface RoundJournalEntry {
  id: string;
  date: string;
  roundNumber: number;
  preRoundNotes?: string;
  postRoundNotes?: string;
  keyLearnings?: string;
  mood: 1 | 2 | 3 | 4 | 5;
}

export interface Workout {
  id: string;
  category: RecoveryCategory;
  name: string;
  description: string;
  durationMinutes: number;
  instructions: string[];
}

export interface RecoverySession {
  id: string;
  workoutId: string;
  category: RecoveryCategory;
  workoutName: string;
  date: string;
  durationMinutes: number;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface Readiness {
  date: string;
  score: number;
  mobility: number;
  practice: number;
  recovery: number;
  sleep: number;
  hydration: number;
  notes?: string;
}

export interface DailyTask {
  id: string;
  label: string;
  category: "mobility" | "practice" | "recovery" | "stats" | "tournament";
  completed: boolean;
  href?: string;
}

export interface Streak {
  id: string;
  label: string;
  category: RecoveryCategory | PracticeCategory | "general";
  current: number;
  best: number;
  lastCompletedDate?: string;
}

export interface Settings {
  theme: "dark" | "light" | "system";
  notificationsEnabled: boolean;
  currentPhaseId: TrainingPhaseId;
  units: "imperial" | "metric";
  updatedAt: string;
}

export interface PinnacleState {
  user: User;
  practiceSessions: PracticeSession[];
  recoverySessions: RecoverySession[];
  rounds: Round[];
  tournament: Tournament;
  dailyTasks: DailyTask[];
  readinessHistory: Readiness[];
  streaks: Streak[];
  settings: Settings;
  lastSyncedAt: string;
}
