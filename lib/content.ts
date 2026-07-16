import { Drill, Settings } from "@/lib/types";

const drillVideo = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

export const SWING_KEYS = [
  "Tempo wins.",
  "Turn through the finish.",
  "Commit to one shot shape.",
  "Trust the target."
];

export const DAILY_MOBILITY = [
  "Cat/Camel x10",
  "90/90 hip rotations x10 per side",
  "World's Greatest Stretch x5 per side",
  "Thoracic open books x10 per side",
  "Band pull-aparts x20",
  "Glute bridges x15",
  "Wrist CARs x10 each direction",
  "Shoulder CARs x10"
];

export const RECOVERY_CHECKLIST = [
  "Walk 5-10 minutes",
  "Hydrate 20-24 oz",
  "Add electrolytes",
  "Protein 30-40g",
  "Foam roll calves/quads/glutes/back",
  "Massage gun forearms/shoulders/hips",
  "Power Plate 5-10 minutes",
  "Legs elevated 5 minutes",
  "Sleep before 9:30 PM"
];

export const WEEKLY_TEMPLATE: Record<string, string[]> = {
  Monday: ["Strength A", "Hip mobility", "20-30 min putting"],
  Tuesday: ["Range session: Driver, irons, wedges", "Recovery protocol"],
  Wednesday: ["Walk 45 min", "Short game", "Mobility"],
  Thursday: ["Strength B", "Wedge matrix", "Putting"],
  Friday: ["Play 9-18 holes", "Track performance"],
  Saturday: ["Tournament simulation round"],
  Sunday: ["Recovery", "Stretching", "Foam rolling", "Weekly review"]
};

export const PERIODIZATION = [
  "Weeks 1-2 Foundation: mobility baseline, strike quality, light strength.",
  "Weeks 3-4 Build: increase strength, driver accuracy, wedge control, walking endurance.",
  "Weeks 5-6 Simulation: pressure reps, 18-hole tracking, back-to-back golf readiness.",
  "Week 7 Deload: reduce volume 40-50%, mobility and sleep focus, confidence only.",
  "Tournament Week: sharpen, hydrate, sleep, light practice, arrive fresh."
];

export const PRACTICE_DRILLS: Drill[] = [
  {
    section: "Driver",
    name: "Fairway Finder 30",
    purpose: "Reduce high-right slice and build tournament tee shot.",
    time: "35-45 min",
    reps: "30 drives",
    metric: "Goal 21/30 playable | Great 24/30+",
    instructions: [
      "Pick a target fairway.",
      "Use 80-90% tempo.",
      "Score 1 point per playable/in-fairway ball.",
      "Focus on full rotation and balanced finish."
    ],
    tutorial:
      "Pick one fairway target and hit 30 drives at 80-90% speed, prioritizing start line and balanced finish.",
    tips: ["Use one consistent pre-shot routine.", "Commit to your shot shape before takeaway."],
    tricks: ["If driver leaks right, rehearse chest-to-target finish before each rep."],
    videoUrl: drillVideo("driver accuracy fairway finder drill tutorial")
  },
  {
    section: "Irons",
    name: "Towel Low-Point Drill",
    purpose: "Stop fat shots and improve ball-first contact.",
    time: "30 min",
    reps: "40 balls",
    metric: "Goal 36/40 clean",
    instructions: [
      "Place towel 4 inches behind the ball.",
      "Avoid hitting towel.",
      "Rotate through the finish."
    ],
    tutorial:
      "Place a towel just behind the ball and strike 40 balls without touching it to train forward low point.",
    tips: ["Start with short irons before moving to longer clubs.", "Keep pressure centered to lead side through impact."],
    tricks: ["Hit 5 slow-motion rehearsals every 10 balls to reset contact quality."],
    videoUrl: drillVideo("towel drill low point irons tutorial")
  },
  {
    section: "Irons",
    name: "Start-Line Gate",
    purpose: "Reduce thin push fade and pull.",
    time: "30 min",
    reps: "30 balls",
    metric: "Goal 20/30 online or slightly left for lefty pattern",
    instructions: [
      "Pick a start line.",
      "Create gate 10 yards ahead with sticks if available.",
      "Score direction start quality."
    ],
    tutorial:
      "Create a start-line gate and score how many shots start through it to improve face/path control.",
    tips: ["Use one intermediate target a few feet ahead of the ball.", "Evaluate start line first, curve second."],
    tricks: ["If pulls show up, slow transition and hold finish for 2 seconds."],
    videoUrl: drillVideo("start line gate iron drill tutorial")
  },
  {
    section: "Wedges",
    name: "Wedge Matrix Ladder",
    purpose: "Build scoring distances and proximity control.",
    time: "30-40 min",
    reps: "5 balls x 50, 70, 90, 110 yards",
    metric: "Goal avg inside 20 ft | Great inside 15 ft",
    instructions: [
      "Use 50 degree and add higher lofted wedges if available.",
      "Record carry or estimated proximity."
    ],
    tutorial:
      "Hit 5 balls to each distance with each wedge and log carry/proximity to build repeatable scoring yardages.",
    tips: ["Use same ball type for consistent spin.", "Land each shot to a specific window, not just total distance."],
    tricks: ["If misses go left/short, shorten finish and keep chest rotating."],
    videoUrl: drillVideo("wedge matrix ladder drill tutorial")
  },
  {
    section: "Putting",
    name: "50 Straight",
    purpose: "Become automatic from 3 feet.",
    time: "20-30 min",
    reps: "Make 50 in a row",
    metric: "Goal 50/50",
    instructions: ["Restart at 0 on any miss."],
    tutorial: "Set a 3-foot station and make 50 consecutive putts to build automatic short-putt execution.",
    tips: ["Use the same setup and tempo every rep.", "Keep eyes soft and head still through impact."],
    tricks: ["Use a chalk line or gate for first 10 reps to calibrate face alignment."],
    videoUrl: drillVideo("3 foot putting drill make 50 in a row tutorial")
  },
  {
    section: "Putting",
    name: "6-Foot Pressure Set",
    purpose: "Improve scoring putts.",
    time: "15-20 min",
    reps: "20 putts",
    metric: "Goal 14/20 | Great 16/20+",
    instructions: ["Track makes and pressure response."],
    tutorial: "Hit 20 putts from 6 feet, logging makes to simulate real scoring pressure putts.",
    tips: ["Reset routine fully between each rep.", "Read putt from behind and trust first look."],
    tricks: ["Do final 5 putts as must-make to mimic late-round pressure."],
    videoUrl: drillVideo("6 foot pressure putting drill tutorial")
  },
  {
    section: "Putting",
    name: "Ladder Lag",
    purpose: "Control speed from 20-50 feet.",
    time: "20 min",
    reps: "5 balls from 20, 30, 40, 50 feet",
    metric: "Goal 16/20 inside 3 feet",
    instructions: ["Use a 3-foot scoring circle."],
    tutorial: "Putt from increasing distances and score how many finish inside a 3-foot circle.",
    tips: ["Focus on pace first, line second for long putts.", "Use one rehearsal stroke that matches intended speed."],
    tricks: ["Leave all lag putts below the hole whenever possible."],
    videoUrl: drillVideo("lag putting ladder drill tutorial")
  },
  {
    section: "Short Game",
    name: "Up-and-Down Challenge",
    purpose: "Transfer chipping/pitching into scoring.",
    time: "30 min",
    reps: "10 balls from varied lies",
    metric: "Goal 4/10 | Great 6/10+",
    instructions: ["Chip/pitch and hole out each ball."],
    tutorial:
      "Drop 10 balls in mixed lies and play each out to measure true up-and-down scoring ability.",
    tips: ["Pick conservative landing spots and commit to trajectory.", "Read chip + putt as one combined scoring problem."],
    tricks: ["If contact is inconsistent, narrow stance and reduce wrist action."],
    videoUrl: drillVideo("up and down challenge short game drill tutorial")
  },
  {
    section: "Bunker",
    name: "Splash and Save",
    purpose: "Build reliable bunker escape and 2-putt save.",
    time: "20 min",
    reps: "15 bunker shots + putt out",
    metric: "Goal 12/15 out + 5 saves",
    instructions: [
      "Open stance and focus on thump point.",
      "Score quality exits and save conversions."
    ],
    tutorial:
      "Practice 15 bunker shots with splash contact and finish each hole-out to train save percentage.",
    tips: ["Enter sand 1-2 inches behind the ball.", "Keep speed through the strike with stable lower body."],
    tricks: ["Draw a line in sand to rehearse entry point before hitting balls."],
    videoUrl: drillVideo("greenside bunker splash shot tutorial")
  },
  {
    section: "Custom Drill",
    name: "Create your own drill",
    purpose: "Target one issue from your latest round.",
    time: "15-25 min",
    reps: "Flexible",
    metric: "Define a simple pass/fail score",
    instructions: [
      "Keep it specific and measurable.",
      "Log the result immediately after."
    ],
    tutorial:
      "Build one focused drill from your latest miss pattern and set a numeric score target before starting.",
    tips: ["Use one swing cue only for the whole set.", "Limit drill duration to keep feedback fresh."],
    tricks: ["Write your pass/fail rule first so results stay objective."],
    videoUrl: drillVideo("create your own golf practice drill framework")
  }
];

export const ROUTINES = {
  Hips: [
    "90/90 switches",
    "Couch stretch",
    "Pigeon stretch",
    "Hip flexor lunge",
    "Glute bridge",
    "Lateral band walk"
  ],
  Back: [
    "Cat/Camel",
    "Child's pose breathing",
    "Open books",
    "Dead bugs",
    "Bird dogs",
    "Side plank"
  ],
  Shoulders: [
    "Band pull-aparts",
    "Wall slides",
    "Shoulder CARs",
    "Scap pushups",
    "External rotation band work"
  ],
  "Wrists/Forearms": [
    "Wrist CARs",
    "Prayer stretch",
    "Reverse prayer stretch",
    "Forearm extensor stretch",
    "Farmer carry",
    "Towel squeeze"
  ]
};

export const STRENGTH_A = [
  "Goblet Squat 3x8",
  "Romanian Deadlift 3x8",
  "Split Squat 3x8 each",
  "Single-arm Row 3x10",
  "Pallof Press 3x12 each",
  "Farmer Carry 3x40 yards",
  "Side Plank 3x30 sec"
];

export const STRENGTH_B = [
  "Single-leg RDL 3x8 each",
  "Pushup 3x10",
  "Pull-up or assisted pull-up 3 sets",
  "Half-kneeling Dumbbell Press 3x8 each",
  "Cable/Band Wood Chop 3x10 each",
  "Dead Bug 3x10 each",
  "Suitcase Carry 3x40 yards"
];

export const TOURNAMENT_TIMELINE = [
  "Wake 3 hours before tee time",
  "Drink 20-24 oz water + electrolytes",
  "Breakfast: 30-40g protein, carbs, fruit",
  "Arrive 60-75 min early",
  "40-min warmup",
  "Snack every 4-5 holes",
  "Sip water every hole",
  "Electrolytes every 9 holes",
  "Recovery meal within 60 minutes",
  "Evening mobility",
  "Sleep before 9:30 PM"
];

export const WARMUP_40 = [
  "0-10 min: walk, bands, dynamic hips/shoulders",
  "10-20 min: chips and pitches",
  "20-30 min: wedges, 9 iron, 7 iron",
  "30-35 min: driver (max 8 balls)",
  "35-40 min: putting 3, 20, and 40 footers"
];

export const EMERGENCY_FIXES: Record<string, string[]> = {
  "Driver slice": [
    "80% tempo",
    "Turn through finish",
    "Chest to target",
    "Swing to left field for lefty",
    "Commit"
  ],
  "Fat iron": ["Pressure lead side", "Rotate through", "Ball first", "No scooping"],
  "Thin push": ["Stay in posture", "Rotate around spine", "Smooth transition"],
  Pull: ["Slow transition", "No arm yank", "Finish balanced"],
  "Wedge left/short": [
    "Hands slightly ahead",
    "Chest keeps turning",
    "Shorter finish",
    "Accelerate"
  ]
};

export const PACKING_LIST = [
  "Clubs",
  "Golf shoes",
  "Backup shoes",
  "Gloves x5+",
  "Balls",
  "Tees",
  "Rangefinder",
  "Sunscreen",
  "Hat",
  "Sunglasses",
  "Rain gear",
  "Athletic tape",
  "Electrolytes",
  "Protein bars",
  "Jerky/nuts/bananas",
  "Massage gun",
  "Foam roller if traveling",
  "Stretch band",
  "Ibuprofen/Tylenol if medically safe",
  "Water bottle",
  "Phone charger",
  "Portable battery"
];

export const DEFAULT_SETTINGS: Settings = {
  name: "Matthew Wixted",
  preferredName: "Matt",
  handicap: "12.4",
  ghinNumber: "11634237",
  goalHandicap: "3",
  goalScore: "79-84",
  tournamentDate: "2026-08-20",
  tournamentName: "The Strand Invitational",
  course: "Gamble Sands, Brewster WA",
  teeTime: "08:00",
  weeklySchedule: {
    Monday: "Strength A + Hip mobility + 20-30 min putting",
    Tuesday: "Range session + Recovery protocol",
    Wednesday: "Walk 45 min + Short game + Mobility",
    Thursday: "Strength B + Wedge matrix + Putting",
    Friday: "Play 9-18 holes + Track performance",
    Saturday: "Tournament simulation round",
    Sunday: "Recovery + Stretching + Foam rolling + Weekly review"
  },
  drillTargets: {
    "Fairway Finder 30": "21/30 playable",
    "Towel Low-Point Drill": "36/40 clean",
    "Wedge Matrix Ladder": "Avg inside 20 feet",
    "50 Straight": "50/50",
    "6-Foot Pressure Set": "14/20",
    "Ladder Lag": "16/20 inside 3 feet"
  },
  wedgeDistances: "50, 70, 90, 110 yards",
  clubsInBag: "Driver, 3W, 4H, 5-9i, PW, 50, 56, 60, Putter",
  sorenessAreas: "Lower back, hips, shoulders, wrists, forearms, hands",
  strengthDays: "Monday and Thursday",
  practiceAvailability: "After work Monday-Thursday, open Friday-Sunday"
};
