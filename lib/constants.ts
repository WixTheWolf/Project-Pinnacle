export const COLORS = {
  background: "#0E1111",
  card: "#1F2937",
  accentGold: "#D6B56D",
  accentGreen: "#2E7D32",
  white: "#F9FAFB",
  muted: "#9CA3AF",
  red: "#DC2626",
} as const;

export const APP = {
  name: "Project Pinnacle",
  subtitle: "Road to Gamble Sands",
} as const;

export const USER = {
  firstName: "Matt",
  fullName: "Matthew Wixted",
  age: 38,
  handedness: "left" as const,
  handicap: 12.4,
  goalHandicap: 3,
} as const;

export const GAMBLE_SANDS = {
  name: "Gamble Sands",
  location: "Brewster, WA",
  startDate: "2026-08-20",
  endDate: "2026-08-23",
} as const;

export const TRAINING_PHASES = [
  { id: "foundation", name: "Foundation", weeks: "Weeks 1-4" },
  { id: "build", name: "Build", weeks: "Weeks 5-8" },
  { id: "peak", name: "Peak", weeks: "Weeks 9-12" },
  { id: "tournament", name: "Tournament", weeks: "Race Week" },
] as const;

export const NAV_ITEMS = [
  { href: "/today", label: "Today", icon: "Sun" },
  { href: "/plan", label: "Plan", icon: "Map" },
  { href: "/practice", label: "Practice", icon: "Target" },
  { href: "/recovery", label: "Recovery", icon: "Heart" },
  { href: "/performance", label: "Perf", icon: "TrendingUp" },
  { href: "/tournament", label: "Event", icon: "Trophy" },
] as const;

export const READINESS_WEIGHTS = {
  mobility: 0.2,
  practice: 0.25,
  recovery: 0.2,
  sleep: 0.2,
  hydration: 0.15,
} as const;

export const STREAK_THRESHOLDS = {
  mobility: 7,
  practice: 5,
  recovery: 7,
} as const;
