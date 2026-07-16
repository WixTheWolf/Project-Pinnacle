/*
  Snapshot of Matt's GHIN Stats pages (ghin.com, filtered by season).
  GHIN blocks automated fetching, so season aggregates are bundled here;
  the GHIN sync still imports every posted score live.

  2024 season (5 rounds; advanced stats tracked on 2 of them):
  83A Los Amigos 08/30 · 92H Lakewood 05/25 · 90H Lakewood 05/10 ·
  86A Los Serranos North 03/15 · 87A Lakewood 03/08.
*/

export const GHIN_2024 = {
  season: "2024",
  rounds: 5,
  advancedStatRounds: 2,
  avgScore: (83 + 92 + 90 + 86 + 87) / 5,
  bestScore: 83,
  bestScoreSub: "Los Amigos · Aug 30, 2024 · diff 13.0",
  avgPutts: 28.0,
  onePuttPct: 31,
  twoPuttOrBetterPct: 91,
  threePuttPct: 9,
  upDownsPerRound: 3.0,
  girPct: 28,
  fairwayPct: 46,
  parOrBetterPct: 32,
  scoringMix: [
    { label: "Birdies+", pct: 4 },
    { label: "Pars", pct: 28 },
    { label: "Bogeys", pct: 46 },
    { label: "Doubles", pct: 19 },
    { label: "Triples+", pct: 3 }
  ],
  parAverages: { par3: 3.75, par4: 4.9, par5: 5.95 },
  approachMiss: [
    { label: "GIR", pct: 28, good: true },
    { label: "Short", pct: 22 },
    { label: "Left", pct: 17 },
    { label: "Other", pct: 14 },
    { label: "Right", pct: 11 },
    { label: "Long", pct: 8 }
  ],
  drivingMiss: [
    { label: "Fairway", pct: 46, good: true },
    { label: "Left", pct: 29 },
    { label: "Right", pct: 7 },
    { label: "Short", pct: 4 }
  ],
  roundLog: [
    { date: "2024-08-30", course: "Los Amigos Golf Course", score: 83, differential: 13.0, rating: "69.2/120", type: "Away" },
    { date: "2024-05-25", course: "Lakewood Country Club", score: 92, differential: 20.3, rating: "70.3/121", type: "Home" },
    { date: "2024-05-10", course: "Lakewood Country Club", score: 90, differential: 18.4, rating: "70.3/121", type: "Home" },
    { date: "2024-03-15", course: "Los Serranos Golf Club North", score: 86, differential: 14.2, rating: "70.3/125", type: "Away" },
    { date: "2024-03-08", course: "Lakewood Country Club", score: 87, differential: 15.6, rating: "70.3/121", type: "Away" }
  ]
} as const;

/* Practice-facing takeaways from the GHIN miss patterns. */
export const GHIN_PATTERN_INSIGHTS = [
  "22% of approach misses are short and only 8% long — take one more club and swing at 80%.",
  "Approach misses lean left (17%) over right (11%) — start-line gate work pays double.",
  "29% of tee shots miss left vs 7% right — the fairway-finder corridor drill targets your real miss.",
  "91% two-putt-or-better with 3.0 up-and-downs a round — short game is closer than the scores suggest."
] as const;
