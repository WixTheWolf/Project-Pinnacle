import { GAMBLE_SANDS, USER } from "@/lib/constants";
import { generateId } from "@/lib/utils";
import type {
  DailyTask,
  Drill,
  PackingItem,
  PinnacleState,
  Streak,
  SwingFix,
  Tournament,
  Workout,
} from "@/types";

export const DRILLS: Drill[] = [
  {
    id: "driver-gate",
    category: "driver",
    name: "Alignment Gate Drill",
    instructions: [
      "Place two alignment sticks creating a gate 3 feet ahead",
      "Focus on starting the ball through the gate",
      "Hit 10 drives maintaining smooth tempo",
    ],
    purpose: "Build consistent start line and face control off the tee",
    successMetric: "8/10 through the gate",
    durationMinutes: 20,
    difficulty: "intermediate",
  },
  {
    id: "driver-tempo",
    category: "driver",
    name: "3:1 Tempo Swings",
    instructions: [
      "Use a metronome at 72 BPM",
      "Count 3 on backswing, 1 on downswing",
      "Hit 15 balls focusing only on rhythm",
    ],
    purpose: "Eliminate rushing and improve strike consistency",
    successMetric: "15 consecutive tempo swings",
    durationMinutes: 15,
    difficulty: "beginner",
  },
  {
    id: "irons-ladder",
    category: "irons",
    name: "Distance Ladder",
    instructions: [
      "Hit 5 shots each with 7i, 8i, 9i",
      "Record carry distance for each",
      "Focus on crisp contact over distance",
    ],
    purpose: "Dial in iron gapping and contact quality",
    successMetric: "Consistent 10-yard gaps",
    durationMinutes: 30,
    difficulty: "intermediate",
  },
  {
    id: "irons-compression",
    category: "irons",
    name: "Towel Under Arms",
    instructions: [
      "Place towel under both armpits",
      "Make half swings keeping towel in place",
      "Progress to full swings with 7-iron",
    ],
    purpose: "Promote connected swing and better compression",
    successMetric: "20 connected strikes",
    durationMinutes: 20,
    difficulty: "beginner",
  },
  {
    id: "wedges-clock",
    category: "wedges",
    name: "Clock System",
    instructions: [
      "Hit 5 balls at 7 o'clock, 9 o'clock, and 11 o'clock",
      "Use same wedge for all distances",
      "Record landing spot for each",
    ],
    purpose: "Master wedge distance control without changing clubs",
    successMetric: "3 distinct landing zones",
    durationMinutes: 25,
    difficulty: "intermediate",
  },
  {
    id: "wedges-random",
    category: "wedges",
    name: "Random Yardage",
    instructions: [
      "Partner or app calls random yardages 40-100",
      "Select appropriate wedge and swing length",
      "Land within 10 feet of target",
    ],
    purpose: "Simulate on-course decision making",
    successMetric: "7/10 within 10 feet",
    durationMinutes: 30,
    difficulty: "advanced",
  },
  {
    id: "putting-gate",
    category: "putting",
    name: "Gate Drill 6ft",
    instructions: [
      "Set two tees creating a gate just wider than ball",
      "Make 20 putts from 6 feet through the gate",
      "Focus on starting line, not holing",
    ],
    purpose: "Improve putter face control at critical make distance",
    successMetric: "18/20 through gate",
    durationMinutes: 15,
    difficulty: "beginner",
  },
  {
    id: "putting-speed",
    category: "putting",
    name: "Lag Ladder",
    instructions: [
      "Place balls at 20, 30, 40, 50 feet",
      "Two putts from each distance",
      "Goal: within 3 feet of hole",
    ],
    purpose: "Eliminate three-putts with speed control",
    successMetric: "6/8 within 3 feet",
    durationMinutes: 20,
    difficulty: "intermediate",
  },
  {
    id: "short-game-9",
    category: "short-game",
    name: "Up & Down 9",
    instructions: [
      "Pick 9 different lies around the green",
      "Chip/pitch to a hole, then putt out",
      "Track up-and-down percentage",
    ],
    purpose: "Build scoring zone confidence from any lie",
    successMetric: "6/9 up and downs",
    durationMinutes: 30,
    difficulty: "intermediate",
  },
  {
    id: "bunker-basic",
    category: "bunker",
    name: "Line in Sand",
    instructions: [
      "Draw a line in the sand",
      "Hit 10 shots entering 2 inches behind line",
      "Focus on bounce, not digging",
    ],
    purpose: "Consistent bunker entry point and explosion",
    successMetric: "8/10 clean explosions",
    durationMinutes: 20,
    difficulty: "beginner",
  },
  {
    id: "custom-free",
    category: "custom",
    name: "Custom Session",
    instructions: [
      "Define your own focus area",
      "Set a clear success metric before starting",
      "Log results when complete",
    ],
    purpose: "Address specific weaknesses identified in recent rounds",
    successMetric: "Self-defined",
    durationMinutes: 30,
    difficulty: "intermediate",
  },
];

export const WORKOUTS: Workout[] = [
  {
    id: "mobility-hips",
    category: "mobility",
    name: "Hip Mobility Flow",
    description: "Open hips for better rotation and reduced lower back strain",
    durationMinutes: 15,
    instructions: [
      "90/90 hip switches — 10 each side",
      "World's greatest stretch — 5 each side",
      "Deep squat hold — 60 seconds",
      "Hip circles — 10 each direction",
    ],
  },
  {
    id: "mobility-tspine",
    category: "mobility",
    name: "Thoracic Rotation",
    description: "Improve backswing turn and shoulder health",
    durationMinutes: 12,
    instructions: [
      "Quadruped rotations — 10 each side",
      "Open book stretch — 8 each side",
      "Cat-cow — 10 reps",
      "Thread the needle — 8 each side",
    ],
  },
  {
    id: "stretch-full",
    category: "stretching",
    name: "Full Body Stretch",
    description: "Post-round or post-practice recovery stretch",
    durationMinutes: 20,
    instructions: [
      "Hamstring stretch — 45s each leg",
      "Figure-4 glute stretch — 45s each side",
      "Lat stretch — 30s each side",
      "Chest opener — 45s",
    ],
  },
  {
    id: "foam-back",
    category: "foam-rolling",
    name: "Back & Glute Roll",
    description: "Release tension from rotational stress",
    durationMinutes: 10,
    instructions: [
      "Upper back roll — 60 seconds",
      "Lat roll — 45s each side",
      "Glute roll — 45s each side",
      "IT band — 30s each side",
    ],
  },
  {
    id: "massage-shoulders",
    category: "massage-gun",
    name: "Shoulder & Forearm",
    description: "Target golf-specific muscle groups",
    durationMinutes: 8,
    instructions: [
      "Rotator cuff — 30s each side",
      "Trapezius — 45s each side",
      "Forearm flexors — 30s each arm",
      "Forearm extensors — 30s each arm",
    ],
  },
  {
    id: "sleep-prep",
    category: "sleep",
    name: "Sleep Prep Routine",
    description: "Wind down for optimal recovery sleep",
    durationMinutes: 15,
    instructions: [
      "No screens 30 min before bed",
      "Light stretching — 5 minutes",
      "Box breathing — 4-4-4-4 for 5 minutes",
      "Target: 7.5+ hours sleep",
    ],
  },
  {
    id: "hydration-daily",
    category: "hydration",
    name: "Daily Hydration",
    description: "Maintain performance and recovery hydration",
    durationMinutes: 1,
    instructions: [
      "Target: 100oz water daily",
      "Add electrolytes during practice rounds",
      "Log each bottle consumed",
    ],
  },
  {
    id: "strength-golf",
    category: "strength",
    name: "Golf Strength Circuit",
    description: "Build power and injury resilience",
    durationMinutes: 30,
    instructions: [
      "Goblet squats — 3x12",
      "Single-leg RDL — 3x10 each",
      "Medicine ball rotations — 3x10 each side",
      "Plank — 3x45 seconds",
    ],
  },
];

const DEFAULT_PACKING_LIST: PackingItem[] = [
  { id: "p1", label: "Driver", category: "clubs", packed: false },
  { id: "p2", label: "3 Wood", category: "clubs", packed: false },
  { id: "p3", label: "Hybrid", category: "clubs", packed: false },
  { id: "p4", label: "Irons (4-PW)", category: "clubs", packed: false },
  { id: "p5", label: "Wedges (52, 56, 60)", category: "clubs", packed: false },
  { id: "p6", label: "Putter", category: "clubs", packed: false },
  { id: "p7", label: "Golf shoes", category: "apparel", packed: false },
  { id: "p8", label: "Rain gear", category: "apparel", packed: false },
  { id: "p9", label: "Sunscreen", category: "gear", packed: false },
  { id: "p10", label: "Range finder", category: "gear", packed: false },
  { id: "p11", label: "Glove (3x)", category: "gear", packed: false },
  { id: "p12", label: "Teess & markers", category: "gear", packed: false },
  { id: "p13", label: "Protein bars", category: "nutrition", packed: false },
  { id: "p14", label: "Electrolyte packets", category: "nutrition", packed: false },
  { id: "p15", label: "Backup balls (2 dozen)", category: "gear", packed: false },
];

const DEFAULT_SWING_FIXES: SwingFix[] = [
  {
    id: "sf1",
    issue: "Push fade off tee",
    fix: "Feel closed clubface at top, strengthen grip half turn",
    priority: "high",
  },
  {
    id: "sf2",
    issue: "Thin iron shots",
    fix: "Ball slightly forward, maintain spine angle through impact",
    priority: "high",
  },
  {
    id: "sf3",
    issue: "Three-putts from 20-30ft",
    fix: "Die it at the hole, pick a 3ft circle not the cup",
    priority: "medium",
  },
  {
    id: "sf4",
    issue: "Bunker anxiety",
    fix: "Open face, hit 2 inches behind ball, finish high",
    priority: "medium",
  },
];

function createDefaultTournament(): Tournament {
  return {
    id: "gamble-sands-2026",
    name: GAMBLE_SANDS.name,
    location: GAMBLE_SANDS.location,
    startDate: GAMBLE_SANDS.startDate,
    endDate: GAMBLE_SANDS.endDate,
    packingList: DEFAULT_PACKING_LIST,
    warmupMinutes: 45,
    nutritionPlan: [
      { id: "n1", timing: "2 hours before", description: "Oatmeal + banana + coffee", completed: false },
      { id: "n2", timing: "On course (hole 4)", description: "Protein bar + electrolyte", completed: false },
      { id: "n3", timing: "On course (hole 9)", description: "Half sandwich + fruit", completed: false },
      { id: "n4", timing: "On course (hole 14)", description: "Trail mix + water", completed: false },
      { id: "n5", timing: "Post-round", description: "Protein shake within 30 min", completed: false },
    ],
    swingFixes: DEFAULT_SWING_FIXES,
    roundJournal: [],
  };
}

function createDefaultDailyTasks(): DailyTask[] {
  const today = new Date().toISOString().split("T")[0];
  const tasks: DailyTask[] = [
    { id: generateId(), label: "Hip mobility flow (15 min)", category: "mobility", completed: false, href: "/recovery" },
    { id: generateId(), label: "Wedge clock system drill", category: "practice", completed: false, href: "/practice" },
    { id: generateId(), label: "Log yesterday's round stats", category: "stats", completed: false, href: "/stats" },
    { id: generateId(), label: "Hydration check — 100oz target", category: "recovery", completed: false, href: "/recovery" },
    { id: generateId(), label: "Review Gamble Sands course notes", category: "tournament", completed: false, href: "/tournament" },
  ];
  return tasks.map((t) => ({ ...t, id: `${today}-${t.category}` }));
}

function createDefaultStreaks(): Streak[] {
  return [
    { id: "streak-mobility", label: "Mobility", category: "mobility", current: 0, best: 0 },
    { id: "streak-practice", label: "Practice", category: "driver", current: 0, best: 0 },
    { id: "streak-recovery", label: "Recovery", category: "stretching", current: 0, best: 0 },
    { id: "streak-hydration", label: "Hydration", category: "hydration", current: 0, best: 0 },
  ];
}

export function createDefaultState(): PinnacleState {
  const now = new Date().toISOString();
  return {
    user: {
      id: "user-matt",
      firstName: USER.firstName,
      fullName: USER.fullName,
      age: USER.age,
      handedness: USER.handedness,
      handicap: USER.handicap,
      goalHandicap: USER.goalHandicap,
      createdAt: now,
      updatedAt: now,
    },
    practiceSessions: [],
    recoverySessions: [],
    rounds: [],
    tournament: createDefaultTournament(),
    dailyTasks: createDefaultDailyTasks(),
    readinessHistory: [],
    streaks: createDefaultStreaks(),
    settings: {
      theme: "dark",
      notificationsEnabled: true,
      currentPhaseId: "build",
      units: "imperial",
      updatedAt: now,
    },
    lastSyncedAt: now,
  };
}

export function getDrillsByCategory(category: string): Drill[] {
  return DRILLS.filter((d) => d.category === category);
}

export function getWorkoutsByCategory(category: string): Workout[] {
  return WORKOUTS.filter((w) => w.category === category);
}

export function getDrillById(id: string): Drill | undefined {
  return DRILLS.find((d) => d.id === id);
}

export function getWorkoutById(id: string): Workout | undefined {
  return WORKOUTS.find((w) => w.id === id);
}
