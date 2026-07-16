import { RoundLog } from "@/lib/types";

/*
  GHIN integration types + normalization.

  GHIN has no public API; the app proxies the same JSON endpoints the official
  GHIN app uses (api2.ghin.com) through /api/ghin so the browser never hits
  GHIN cross-origin. TheGrint auto-posts rounds to GHIN, so a GHIN sync also
  captures rounds logged in TheGrint. Credentials are forwarded once per sync
  and never stored — client or server.
*/

export interface GhinSyncResult {
  handicapIndex: string | null;
  lowHandicapIndex: string | null;
  golferName: string | null;
  scores: GhinScore[];
}

export interface GhinScore {
  id: string;
  date: string; // YYYY-MM-DD
  courseName: string;
  teeName: string;
  score: number;
  holes: number;
  differential: number | null;
  usedInIndex: boolean;
  stats: {
    putts: number | null;
    fairwaysHit: number | null;
    gir: number | null;
  };
}

export const GHIN_ROUND_PREFIX = "ghin-";

/* Convert a synced GHIN score into the app's RoundLog shape. Rounds without
   entered statistics keep score-only fidelity: hasStats=false excludes them
   from per-stat averages while their scores still feed the trend/averages. */
export function ghinScoreToRound(score: GhinScore): RoundLog {
  const hasStats = score.stats.putts !== null || score.stats.fairwaysHit !== null || score.stats.gir !== null;
  return {
    id: `${GHIN_ROUND_PREFIX}${score.id}`,
    date: score.date,
    course: score.courseName,
    score: score.score,
    tees: score.teeName,
    fairwaysHit: score.stats.fairwaysHit ?? 0,
    gir: score.stats.gir ?? 0,
    putts: score.stats.putts ?? 0,
    penalties: 0,
    upAndDownMade: 0,
    upAndDownAttempted: 0,
    birdies: 0,
    doublesOrWorse: 0,
    threePutts: 0,
    soreness: 0,
    mentalGrade: 0,
    notes: `Synced from GHIN${hasStats ? "" : " (score only)"}`,
    source: "ghin",
    hasStats
  };
}

/* Merge synced rounds into the existing log without clobbering manual entries
   or previously-synced rounds the user has since edited. */
export function mergeGhinRounds(existing: RoundLog[], synced: RoundLog[]): { rounds: RoundLog[]; added: number } {
  const known = new Set(existing.map((round) => round.id));
  const manualKeys = new Set(
    existing.filter((round) => round.source !== "ghin").map((round) => `${round.date}|${round.score}`)
  );
  const fresh = synced.filter(
    (round) => !known.has(round.id) && !manualKeys.has(`${round.date}|${round.score}`)
  );
  return { rounds: [...fresh, ...existing], added: fresh.length };
}
