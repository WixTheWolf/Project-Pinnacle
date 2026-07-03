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
  nickname: string;
  isYou?: boolean;
  handicap: number;
  handicapLabel?: string;
  handedness: Handedness;
  location?: string;
  grintId?: string;
  grintProfileUrl?: string;
  ghinClub?: string;
  bio: string;
  strengths: string[];
  weaknesses: string[];
  playingStyle: string;
  notes: string;
  matchupInsight: string;
  currentFocus: string;
  skills: Record<SkillCategory, number>;
}

export const STRAND_BRAND_ASSETS = {
  logoUrl: "https://strand-site.vercel.app/logo.png",
  heroImageUrl: "https://strand-site.vercel.app/hero.jpg"
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function skillsFromIndex(index: number, adjustment: Partial<Record<SkillCategory, number>> = {}) {
  const base = clamp(Math.round(95 - index * 2.1), 38, 88);
  const seed: Record<SkillCategory, number> = {
    driving: base - 2,
    approach: base,
    wedges: base - 1,
    putting: base - 1,
    shortGame: base - 1,
    courseManagement: base,
    mentalGame: base - 2,
    fitnessDurability: base - 3
  };

  return SKILL_CATEGORIES.reduce<Record<SkillCategory, number>>((acc, key) => {
    acc[key] = clamp(seed[key] + (adjustment[key] ?? 0), 35, 95);
    return acc;
  }, {} as Record<SkillCategory, number>);
}

export const FIELD_PLAYERS: PlayerProfile[] = [
  {
    id: "mager",
    name: "Andrew Mager",
    nickname: "MAGER",
    handicap: 5.2,
    handedness: "Unknown",
    location: "Southern California",
    ghinClub: "CS Southern California Golf Club",
    bio: "Strand veteran — at nearly every tournament — with low-handicap firepower and a calm, efficient game.",
    strengths: ["Low-handicap firepower", "Calm, efficient game", "Tournament experience"],
    weaknesses: ["No public weakness listed"],
    playingStyle: "Efficient low-index striker with controlled tempo.",
    notes: "GHIN index 5.2 out of CS Southern California Golf Club.",
    matchupInsight: "Respect his floor. Avoid giving away easy holes and force pressure putts.",
    currentFocus: "Sustain pressure with clean approaches",
    skills: skillsFromIndex(5.2, { approach: 7, courseManagement: 5, mentalGame: 4 })
  },
  {
    id: "comfort",
    name: "Brett Comfort",
    nickname: "BRETT",
    handicap: 24.5,
    handedness: "Unknown",
    location: "La Mirada, CA",
    grintId: "2350937",
    grintProfileUrl: "https://thegrint.com/profile/index/2350937",
    bio: "New dad, Clemson loyalist, and permanently down-for-whatever.",
    strengths: ["Flexible attitude", "Team chemistry"],
    weaknesses: ["No public weakness listed"],
    playingStyle: "Energy-driven player who can build momentum with confidence.",
    notes: "Profile linked on TheGrint.",
    matchupInsight: "Stay disciplined and make him earn pars from full shots.",
    currentFocus: "Convert short-game chances",
    skills: skillsFromIndex(24.5, { mentalGame: 2, shortGame: 2 })
  },
  {
    id: "kerns",
    name: "Brian Kerns",
    nickname: "KERNS",
    handicap: 18,
    handicapLabel: "17-19",
    handedness: "Unknown",
    location: "Colorado",
    grintId: "1150612",
    grintProfileUrl: "https://thegrint.com/profile/index/1150612",
    bio: "New to the Strand field — replacing Eric Therrien. Lives in Colorado, originally from Illinois.",
    strengths: ["Fresh field energy", "Unknown ceiling"],
    weaknesses: ["New to this field dynamic"],
    playingStyle: "Less-scouted profile with variable round-to-round rhythm.",
    notes: "Handicap surfaced as range-like index in live feed.",
    matchupInsight: "Apply early scoreboard pressure before he settles into pairings.",
    currentFocus: "Stabilize opening holes",
    skills: skillsFromIndex(18, { driving: 1, mentalGame: -1 })
  },
  {
    id: "geisinger",
    name: "Fred Geisinger",
    nickname: "FRED",
    handicap: 7.6,
    handedness: "Unknown",
    location: "Encinitas, CA",
    grintId: "363887",
    grintProfileUrl: "https://thegrint.com/profile/index/363887",
    bio: "Chief planner, spreadsheet artist, and annual guardian of tee times, dinners, and logistics.",
    strengths: ["Preparation discipline", "Operational consistency"],
    weaknesses: ["No public weakness listed"],
    playingStyle: "Prepared and methodical; minimizes self-inflicted errors.",
    notes: "Low index and high process discipline profile.",
    matchupInsight: "Outperform with aggressive but smart scoring-club execution.",
    currentFocus: "Turn preparation into birdie volume",
    skills: skillsFromIndex(7.6, { courseManagement: 7, mentalGame: 4 })
  },
  {
    id: "groot",
    name: "Jack Groot",
    nickname: "JACK",
    handicap: 15.8,
    handedness: "Unknown",
    location: "Palatine, IL",
    grintId: "678772",
    grintProfileUrl: "https://thegrint.com/profile/index/678772",
    bio: "First trip, zero rookie energy. Midwest golfer with instant chemistry.",
    strengths: ["Composure for first trip", "Easy team fit"],
    weaknesses: ["No public weakness listed"],
    playingStyle: "Settled presence with steady pace and partner-friendly rhythm.",
    notes: "First Strand trip, strong integration signal.",
    matchupInsight: "Force precision approaches; don't give easy momentum putts.",
    currentFocus: "Build scoring consistency across rounds",
    skills: skillsFromIndex(15.8, { mentalGame: 3, courseManagement: 2 })
  },
  {
    id: "olson",
    name: "Jason Olson",
    nickname: "JASON",
    handicap: 20.5,
    handedness: "Unknown",
    location: "Van Nuys, CA",
    grintId: "588935",
    grintProfileUrl: "https://thegrint.com/profile/index/588935",
    bio: "Steady, reliable, easygoing, and exactly the kind of rock-solid presence every golf trip needs.",
    strengths: ["Steady pace", "Reliable rhythm", "Calm presence"],
    weaknesses: ["No public weakness listed"],
    playingStyle: "Stable and low-drama; can outlast volatile opponents.",
    notes: "Reliability profile fits match-play team formats well.",
    matchupInsight: "Create separation on approach proximity before putting variance swings.",
    currentFocus: "Raise birdie conversion rate",
    skills: skillsFromIndex(20.5, { mentalGame: 4, courseManagement: 3 })
  },
  {
    id: "brodbeck",
    name: "Jordan Brodbeck",
    nickname: "GORD",
    handicap: 14.4,
    handedness: "Unknown",
    location: "Manhattan Beach, CA",
    grintId: "218633",
    grintProfileUrl: "https://thegrint.com/profile/index/218633",
    bio: "Heart-and-soul guy with elite vibes, strong low-net energy, and executive-committee usefulness.",
    strengths: ["Low-net upside", "Team energy", "Useful under pressure"],
    weaknesses: ["No public weakness listed"],
    playingStyle: "Momentum and net-pressure profile with social confidence.",
    notes: "Strong low-net signal in event copy.",
    matchupInsight: "Avoid giving him easy stroke holes; prioritize clean net math.",
    currentFocus: "Protect card from doubles",
    skills: skillsFromIndex(14.4, { mentalGame: 3, shortGame: 2, courseManagement: 2 })
  },
  {
    id: "uribe",
    name: "Justin Uribe",
    nickname: "J-BONE",
    handicap: 8.4,
    handedness: "Unknown",
    location: "Los Angeles, CA",
    grintId: "3575329",
    grintProfileUrl: "https://thegrint.com/profile/index/3575329",
    bio: "Former baseball standout turned golf alpha and fierce competitor.",
    strengths: ["Competitive edge", "Athletic transition", "Captain presence"],
    weaknesses: ["No public weakness listed"],
    playingStyle: "Assertive competitor who can drive team momentum.",
    notes: "Team captain opposite Matt Wixted.",
    matchupInsight: "Stay unemotional and keep pressure on with fairways + center greens.",
    currentFocus: "Convert pressure stretches into points",
    skills: skillsFromIndex(8.4, { driving: 5, mentalGame: 4, approach: 3 })
  },
  {
    id: "gordon",
    name: "Kevin Gordon",
    nickname: "KEV",
    handicap: 21.2,
    handicapLabel: "19-21",
    handedness: "Unknown",
    location: "San Francisco Bay Area, CA",
    ghinClub: "EClub North Bay",
    grintId: "2330390",
    grintProfileUrl: "https://thegrint.com/profile/index/2330390",
    bio: "Bay Area local with supreme post-round chill and high-handicap net-match upside.",
    strengths: ["Net-match upside", "Composed demeanor"],
    weaknesses: ["High handicap volatility"],
    playingStyle: "Chaos-to-clutch profile that can swing match points quickly.",
    notes: "GHIN index 21.2 out of EClub North Bay.",
    matchupInsight: "Keep him in gross pressure situations and avoid giving stroke holes away.",
    currentFocus: "Reduce penalty swings",
    skills: skillsFromIndex(21.2, { mentalGame: 2, courseManagement: -2 })
  },
  {
    id: "onorato",
    name: "Matt Onorato",
    nickname: "MATTY O.",
    handicap: 28,
    handedness: "Unknown",
    location: "Charlotte, NC",
    grintId: "1335470",
    grintProfileUrl: "https://thegrint.com/profile/index/1335470",
    bio: "Winningest man in Strand history with high style points and full-send commitment.",
    strengths: ["Proven Strand winner", "Competitive commitment"],
    weaknesses: ["No public weakness listed"],
    playingStyle: "Aggressive identity player with event-tested confidence.",
    notes: "History can outweigh index in pressure moments.",
    matchupInsight: "Control pace and make him hit extra pressure approaches.",
    currentFocus: "Stabilize scoring floor early in rounds",
    skills: skillsFromIndex(28, { mentalGame: 5, courseManagement: 3 })
  },
  {
    id: "schroeder",
    name: "Matt Schroeder",
    nickname: "TONY SCHROE",
    handicap: 13.3,
    handedness: "Unknown",
    location: "Redondo Beach, CA",
    grintId: "651324",
    grintProfileUrl: "https://thegrint.com/profile/index/651324",
    bio: "Walking rulebook, serious golf purist, and trip organizer with by-the-book instincts.",
    strengths: ["Rules precision", "Process discipline", "Organizer mindset"],
    weaknesses: ["No public weakness listed"],
    playingStyle: "Structured and by-the-book decision maker.",
    notes: "Excellent in formats requiring tight rules execution.",
    matchupInsight: "Win with execution quality, not variance-heavy hero lines.",
    currentFocus: "Convert structure into scoring separation",
    skills: skillsFromIndex(13.3, { courseManagement: 8, mentalGame: 4 })
  },
  {
    id: "wixted",
    name: "Matt Wixted",
    nickname: "WIX",
    isYou: true,
    handicap: 12.4,
    handedness: "Left",
    location: "Anaheim, CA",
    grintId: "1812465",
    grintProfileUrl: "https://thegrint.com/profile/index/1812465",
    bio: "Natural athlete, former Most Improved, and the creative hand behind the yearly Strand look.",
    strengths: ["Athletic base", "Creative problem-solving", "Improvement mindset"],
    weaknesses: ["Body-rotation stall under speed", "High-right driver miss pattern", "Wedge miss left/short"],
    playingStyle: "Rhythm-first player with high upside when tempo and rotation stay synced.",
    notes: "Captain for Team WIX and owner of Project Pinnacle prep flow.",
    matchupInsight: "Your edge is consistency and durability. Tempo plus decision quality beats volatility.",
    currentFocus: "Turn through finish and stay fresh for all 5 rounds",
    skills: skillsFromIndex(12.4, { putting: 4, courseManagement: 5, fitnessDurability: -2 })
  },
  {
    id: "kane",
    name: "Nick Kane",
    nickname: "KANE",
    handicap: 23,
    handicapLabel: "22-24",
    handedness: "Unknown",
    location: "Hermosa Beach, CA",
    grintId: "929053",
    grintProfileUrl: "https://thegrint.com/profile/index/929053",
    bio: "Southern flavor, golf obsession, and a swing built through pure stubbornness.",
    strengths: ["Golf obsession", "Persistence"],
    weaknesses: ["Swing built through stubbornness"],
    playingStyle: "Persistent grinder profile with emotional stubbornness in mechanics.",
    notes: "Range-like handicap in feed, normalized indexNum 23.",
    matchupInsight: "Stay patient and force him to adapt under scoreboard pressure.",
    currentFocus: "Simplify swing thoughts under pressure",
    skills: skillsFromIndex(23, { mentalGame: -2, shortGame: 1 })
  },
  {
    id: "sprowls",
    name: "Nick Sprowls",
    nickname: "NICK",
    handicap: 12.9,
    handedness: "Unknown",
    location: "Hermosa Beach, CA",
    grintId: "2962924",
    grintProfileUrl: "https://thegrint.com/profile/index/2962924",
    bio: "Resident funny man with emotional-volatility major-championship energy.",
    strengths: ["Competitive energy bursts", "Momentum potential"],
    weaknesses: ["Emotional volatility"],
    playingStyle: "Streaky momentum player with high emotional bandwidth.",
    notes: "Can spike quickly if confidence surges.",
    matchupInsight: "Dampen momentum swings with boring fairways and low-mistake tempo.",
    currentFocus: "Stabilize emotional variance",
    skills: skillsFromIndex(12.9, { mentalGame: -3, driving: 2, putting: 2 })
  },
  {
    id: "morse",
    name: "Pat Morse",
    nickname: "P-MO",
    handicap: 24.9,
    handedness: "Unknown",
    location: "Redondo Beach, CA",
    grintId: "1193408",
    grintProfileUrl: "https://thegrint.com/profile/index/1193408",
    bio: "Founding Pounder and proven bringer of good vibes, good company, and timely golf.",
    strengths: ["Timely golf moments", "Positive team energy"],
    weaknesses: ["No public weakness listed"],
    playingStyle: "Vibes-plus-timing profile that can swing key holes.",
    notes: "Foundational member with high chemistry value.",
    matchupInsight: "Stay focused on net math and avoid gifting momentum holes.",
    currentFocus: "Raise fairway and GIR consistency",
    skills: skillsFromIndex(24.9, { mentalGame: 2, courseManagement: 1 })
  },
  {
    id: "fahrney",
    name: "Rhett Fahrney",
    nickname: "RHETT",
    handicap: 25,
    handicapLabel: "24-26",
    handedness: "Unknown",
    location: "La Quinta, CA",
    grintId: "1392795",
    grintProfileUrl: "https://thegrint.com/profile/index/1392795",
    bio: "Not always textbook, often dangerous. Great hands and enough shotmaking chaos to keep every match alive.",
    strengths: ["Great hands", "Dangerous shotmaking"],
    weaknesses: ["Not always textbook", "Chaos profile"],
    playingStyle: "Creative chaos profile with recovery-shot upside.",
    notes: "Can flip holes unexpectedly with touch and improvisation.",
    matchupInsight: "Play percentage golf and make him win with low-probability shots repeatedly.",
    currentFocus: "Convert creativity into fewer big numbers",
    skills: skillsFromIndex(25, { shortGame: 5, wedges: 4, courseManagement: -2 })
  },
  {
    id: "darcy",
    name: "Ryan Darcy",
    nickname: "D'ARCY",
    handicap: 15,
    handicapLabel: "14-16",
    handedness: "Unknown",
    location: "Manhattan Beach, CA",
    grintId: "1162766",
    grintProfileUrl: "https://thegrint.com/profile/index/1162766",
    bio: "Innovative golf mind, former simulator-business leader, and proven captain.",
    strengths: ["Innovative golf mind", "Leadership profile", "Strategic awareness"],
    weaknesses: ["No public weakness listed"],
    playingStyle: "Strategic planner who can leverage format and matchup edges.",
    notes: "Proven captain profile in prior events.",
    matchupInsight: "Beat strategy with execution: center-line starts and stress-free pars.",
    currentFocus: "Convert planning edge into scoring edge",
    skills: skillsFromIndex(15, { courseManagement: 7, approach: 3, mentalGame: 2 })
  },
  {
    id: "blonski",
    name: "Sam Blonski",
    nickname: "BLONSKI",
    handicap: 24.6,
    handedness: "Unknown",
    location: "Plymouth, MI",
    grintId: "1572836",
    grintProfileUrl: "https://thegrint.com/profile/index/1572836",
    bio: "Detroit distance, Manhattan Beach energy, and effortless fit with the crew.",
    strengths: ["Distance profile", "Quick chemistry"],
    weaknesses: ["No public weakness listed"],
    playingStyle: "Distance-flash player with social confidence.",
    notes: "Distance callout suggests upside in long-hole scoring.",
    matchupInsight: "Keep him in approach precision battles, not pure distance contests.",
    currentFocus: "Tighten approach control after long tees",
    skills: skillsFromIndex(24.6, { driving: 5, approach: -1, shortGame: -1 })
  },
  {
    id: "eipper",
    name: "Shaun Eipper",
    nickname: "SHAUN",
    handicap: 20,
    handicapLabel: "19-21",
    handedness: "Unknown",
    location: "Redondo Beach, CA",
    grintId: "1240826",
    grintProfileUrl: "https://thegrint.com/profile/index/1240826",
    bio: "Easy energy, strong hang, quietly competitive, and one of those guys who makes the trip feel complete.",
    strengths: ["Quiet competitiveness", "Steady social energy"],
    weaknesses: ["No public weakness listed"],
    playingStyle: "Low-noise competitor who can stay in matches through consistency.",
    notes: "Stable temperament profile in team settings.",
    matchupInsight: "Build separation with approach quality and avoid cheap concession holes.",
    currentFocus: "Improve GIR and two-putt conversion",
    skills: skillsFromIndex(20, { mentalGame: 3, courseManagement: 2 })
  },
  {
    id: "hummel",
    name: "Tim Hummel",
    nickname: "HUMMEL",
    handicap: 18.8,
    handedness: "Unknown",
    location: "Hawthorne, CA",
    grintId: "758827",
    grintProfileUrl: "https://thegrint.com/profile/index/758827",
    bio: "Utility player of the trip. Helpful, funny, grill-capable, and always ready to keep the crew moving.",
    strengths: ["Utility consistency", "Composed trip presence"],
    weaknesses: ["No public weakness listed"],
    playingStyle: "Utility profile with low-maintenance decision making.",
    notes: "Stable team-role player in multi-round formats.",
    matchupInsight: "Pressure with scoring-club precision and avoid loose wedge gaps.",
    currentFocus: "Raise wedge proximity inside 110",
    skills: skillsFromIndex(18.8, { courseManagement: 3, mentalGame: 2 })
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
