import { RoundLog } from "@/lib/types";

/*
  Snapshot of Matt's real TheGrint stats (thegrint.com/trend, captured
  2026-07-16). TheGrint has no public API and its trend page sits behind
  login, so these per-round stats are bundled and used to enrich rounds
  that arrive via GHIN sync (GHIN carries the score; TheGrint carried the
  putts/GIR/fairway detail). Matching is by play date.

  Fairways-hit counts are derived from TheGrint's accuracy percentage
  assuming 14 driving holes (13 at Pasatiempo per its layout).
*/

export const GRINT_TREND_URL = "https://thegrint.com/trend";

export const GRINT_BASELINES = {
  capturedAt: "2026-06-30",
  handicapIndex: "12.4",
  roundsPlayed: 42,
  avgScore: 89.7,
  bestScore: 82,
  bestScoreCourse: "Lakewood Country Club [White]",
  bestScoreDate: "2025-10-31",
  worstScore: 100,
  avgPutts: 35.4,
  avgGirPerRound: 6.8,
  girPct: 38,
  fairwayPct: 67,
  avgFairwaysPerRound: 9.4,
  scramblingPct: 19,
  par3AccuracyPct: 60.4
} as const;

/* TheGrint Trophy Room, captured in full (thegrint.com, member since 2023,
   42 posted rounds). Grint-posted rounds only — the live GHIN trophy room
   covers the complete posting history. */
export const GRINT_TROPHIES: ReadonlyArray<{
  group: string;
  records: ReadonlyArray<{ label: string; value: string; sub?: string }>;
}> = [
  {
    group: "Scoring",
    records: [
      { label: "Best score", value: "82", sub: "+10 · Lakewood · Oct 31, 2025" },
      { label: "Best net", value: "69", sub: "single round" },
      { label: "Best 9 holes", value: "40", sub: "front and back" },
      { label: "Avg score", value: "89.7", sub: "42 rounds · best course avg 88.9" },
      { label: "Rounds in the 80s", value: "11", sub: "plus 5 in the 90s" },
      { label: "Rounds posted", value: "42", sub: "35 attested · 6 courses" }
    ]
  },
  {
    group: "Single-round bests",
    records: [
      { label: "Fewest putts", value: "33", sub: "0 three-putts that day" },
      { label: "Fairways", value: "93%", sub: "accuracy record" },
      { label: "Greens", value: "56%", sub: "GIR record" },
      { label: "Grints", value: "56%", sub: "par-or-better holes" },
      { label: "Most pars", value: "10" },
      { label: "Most birdies", value: "3" },
      { label: "One-putts", value: "6" },
      { label: "Par saves", value: "3", sub: "plus 1 sand save" },
      { label: "Fewest bogeys+", value: "8", sub: "cleanest card" },
      { label: "Fewest penalties", value: "0.5", sub: "and 0 three-putts that day" }
    ]
  },
  {
    group: "Career totals",
    records: [
      { label: "Birdies", value: "12", sub: "1 back-to-back set" },
      { label: "3-putt-free rounds", value: "3" },
      { label: "Triple-bogey-free", value: "1", sub: "clean card rounds" },
      { label: "Par-3 accuracy", value: "60.4%", sub: "career average" }
    ]
  },
  {
    group: "Streaks",
    records: [
      { label: "3-putt free", value: "44", sub: "holes" },
      { label: "Fairways in a row", value: "13" },
      { label: "Double-bogey free", value: "10", sub: "holes" },
      { label: "Greens in a row", value: "4" },
      { label: "Grints in a row", value: "4" },
      { label: "Par-save putts", value: "3", sub: "in a row" }
    ]
  },
  {
    group: "Tough days to retire",
    records: [
      { label: "Worst score", value: "100", sub: "net 87" },
      { label: "Most putts", value: "41", sub: "5 three-putts" },
      { label: "Most penalties", value: "12.5", sub: "4 OB · 6 bunkers" },
      { label: "Worst greens", value: "17%", sub: "43% fairways that day" }
    ]
  }
] as const;

interface GrintRoundStats {
  course: string;
  putts: number | null;
  gir: number | null;
  fairwaysHit: number | null;
}

export const GRINT_ROUND_STATS: Record<string, GrintRoundStats> = {
  "2025-07-18": { course: "Coyote Hills Golf Course", putts: 36, gir: 5, fairwaysHit: 9 },
  "2025-08-01": { course: "Lakewood Country Club", putts: 35, gir: 7, fairwaysHit: 10 },
  "2025-08-07": { course: "Pasatiempo Golf Club", putts: 36, gir: 7, fairwaysHit: 9 },
  "2025-08-09": { course: "Bayonet Black Horse", putts: 35, gir: 8, fairwaysHit: 12 },
  "2025-08-22": { course: "Lakewood Country Club", putts: 33, gir: 9, fairwaysHit: 7 },
  "2025-10-31": { course: "Lakewood Country Club", putts: 33, gir: 7, fairwaysHit: 13 },
  "2025-11-21": { course: "Lakewood Country Club", putts: 35, gir: 5, fairwaysHit: 10 },
  "2025-12-19": { course: "Lakewood Country Club", putts: 36, gir: 7, fairwaysHit: 8 },
  "2026-01-19": { course: "Lakewood Country Club", putts: 41, gir: 3, fairwaysHit: 10 },
  "2026-04-03": { course: "Skylinks at Long Beach", putts: 33, gir: 8, fairwaysHit: 9 },
  "2026-05-15": { course: "Skylinks at Long Beach", putts: 35, gir: 6, fairwaysHit: 6 },
  "2026-05-22": { course: "Lakewood Country Club", putts: 36, gir: 7, fairwaysHit: 8 },
  "2026-06-12": { course: "Lakewood Country Club", putts: 36, gir: 10, fairwaysHit: 6 },
  "2026-06-19": { course: "Skylinks at Long Beach", putts: null, gir: null, fairwaysHit: 13 }
};

/* Fill stats into a GHIN-synced round when TheGrint snapshot has detail
   for the same play date. Never overwrites stats GHIN already provided. */
export function enrichRoundWithGrintStats(round: RoundLog): RoundLog {
  const snapshot = GRINT_ROUND_STATS[round.date];
  if (!snapshot) {
    return round;
  }
  const putts = round.putts > 0 ? round.putts : snapshot.putts ?? 0;
  const gir = round.gir > 0 ? round.gir : snapshot.gir ?? 0;
  const fairwaysHit = round.fairwaysHit > 0 ? round.fairwaysHit : snapshot.fairwaysHit ?? 0;
  const gained = putts > 0 || gir > 0 || fairwaysHit > 0;
  if (!gained) {
    return round;
  }
  return {
    ...round,
    putts,
    gir,
    fairwaysHit,
    hasStats: true,
    notes: round.notes.includes("TheGrint") ? round.notes : `${round.notes} · stats from TheGrint`.trim()
  };
}
