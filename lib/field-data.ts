export const SKILL_CATEGORIES = [
  "driving",
  "approach",
  "wedges",
  "putting",
  "shortGame",
  "courseManagement",
  "mentalGame",
  "fitnessDurability"
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export type Handedness = "Left" | "Right" | "Unknown";

export interface PlayerProfile {
  id: string;
  name: string;
  isYou?: boolean;
  handicap: number;
  handedness: Handedness;
  strengths: string[];
  weaknesses: string[];
  playingStyle: string;
  notes: string;
  matchupInsight: string;
  currentFocus: string;
  skills: Record<SkillCategory, number>;
}

export const FIELD_PLAYERS: PlayerProfile[] = [
  {
    id: "matt-wixted",
    name: "Matthew Wixted",
    isYou: true,
    handicap: 12.4,
    handedness: "Left",
    strengths: ["Tempo and balance", "Rhythm under control", "Athletic setup"],
    weaknesses: ["Stalled body rotation", "High-right driver miss", "Wedge miss left/short"],
    playingStyle: "Rhythm player. Best when he commits to one shape and turns through.",
    notes:
      "Primary tournament goal is consistency: live in the 79-84 window and eliminate doubles.",
    matchupInsight:
      "Edge comes from durability and discipline: stay in tempo, avoid hero shots, and pressure the field with clean decisions.",
    currentFocus: "Turn through finish + durable body over 5 rounds",
    skills: {
      driving: 60,
      approach: 66,
      wedges: 62,
      putting: 68,
      shortGame: 64,
      courseManagement: 70,
      mentalGame: 69,
      fitnessDurability: 58
    }
  },
  {
    id: "nate-harper",
    name: "Nate Harper",
    handicap: 8.2,
    handedness: "Right",
    strengths: ["Aggressive off tee", "Birdie streak potential", "High-ball approach windows"],
    weaknesses: ["Can chase pins", "Penalty risk when pressing", "Late-round emotional drift"],
    playingStyle: "Momentum player. Tries to overpower short par-4s and reachable par-5s.",
    notes: "Dangerous when driver is in play. Scores in bunches.",
    matchupInsight:
      "Let him take on volatility. Stay center-green and force him to win with low mistakes.",
    currentFocus: "Limit penalties and keep decision quality late",
    skills: {
      driving: 76,
      approach: 68,
      wedges: 63,
      putting: 61,
      shortGame: 62,
      courseManagement: 58,
      mentalGame: 57,
      fitnessDurability: 66
    }
  },
  {
    id: "jason-reed",
    name: "Jason Reed",
    handicap: 10.1,
    handedness: "Right",
    strengths: ["Solid iron windows", "Reliable pace control on greens", "Low penalty profile"],
    weaknesses: ["Limited driving distance", "Conservative when trailing", "Slow starter"],
    playingStyle: "Fairway-and-middle player. Keeps the ball in front and waits for mistakes.",
    notes: "Usually beats himself only if putting cools off.",
    matchupInsight:
      "Apply steady pressure with approach proximity. Birdie chances can force him out of comfort zones.",
    currentFocus: "Convert more 8-15 foot putts",
    skills: {
      driving: 62,
      approach: 71,
      wedges: 67,
      putting: 72,
      shortGame: 66,
      courseManagement: 73,
      mentalGame: 70,
      fitnessDurability: 64
    }
  },
  {
    id: "eric-barnes",
    name: "Eric Barnes",
    handicap: 14.3,
    handedness: "Right",
    strengths: ["Strong scrambling", "Creative trajectories", "Good lag putting touch"],
    weaknesses: ["Inconsistent start lines with irons", "Streaky driving accuracy", "Can over-adjust swing"],
    playingStyle: "Shot-maker. Relies on feel and short-game recovery.",
    notes: "Can post surprise low stretches when short game catches fire.",
    matchupInsight:
      "Prioritize fairways and avoid giving away easy up-and-down opportunities around greens.",
    currentFocus: "Hit more greens in regulation",
    skills: {
      driving: 58,
      approach: 59,
      wedges: 70,
      putting: 65,
      shortGame: 72,
      courseManagement: 64,
      mentalGame: 62,
      fitnessDurability: 61
    }
  }
];

export const SKILL_LABELS: Record<SkillCategory, string> = {
  driving: "Driving",
  approach: "Approach",
  wedges: "Wedges",
  putting: "Putting",
  shortGame: "Short game",
  courseManagement: "Course management",
  mentalGame: "Mental game",
  fitnessDurability: "Fitness / durability"
};
