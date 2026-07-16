import { isRegulationRound } from "@/lib/ghin";
import { parseDateKey } from "@/lib/plan";
import { RoundLog } from "@/lib/types";

/*
  Live personal records computed from the full stored round history (GHIN
  syncs + in-app logs). Unlike the bundled TheGrint trophy snapshot, these
  update every time a round arrives. Regulation rounds only — executive
  courses would fake a "best score".
*/

export interface RecordTile {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "sand" | "green" | "danger";
}

const monthYear = (date: string) =>
  parseDateKey(date).toLocaleDateString(undefined, { month: "short", year: "numeric" });

/*
  Documented milestones cross-referenced from every posted source — GHIN
  scorecards (advanced stats) and TheGrint's stats pages. These are floors:
  the live computation below supersedes one only by beating it.

  Provenance:
  - GHIN View Scorecard, 80 (+8) on a 6,407-yd par 72: out 43 / in 37 with a
    birdie-eagle-birdie run on 13-15 (2 birdies + 1 eagle that TheGrint never
    saw — its eagle shield is empty and its best-over-par is +10). 31 putts
    (17/14) including a chip-in zero-putt on 6, five one-putts, 8 GIR.
  - TheGrint handicap chart: best differential 9.1 (imported round, Jul 2025).
  - TheGrint trophy room: 12 career birdies (Grint-posted rounds only), best
    3 birdies in a round, best F9 40; + the GHIN eagle round makes 14+
    documented career birdies.
*/
const KNOWN_GHIN = {
  bestScore: 80,
  bestScoreSub: "+8 · 43 out · 37 in · GHIN scorecard",
  bestNine: 37,
  bestNineSub: "back 9 · birdie-eagle-birdie on 13-15",
  bestDifferential: 9.1,
  bestDifferentialSub: "imported round · Jul 2025",
  /* GHIN 2024 advanced stats: 28.0 putts averaged across the tracked
     rounds — at least one round at 28 or better. */
  fewestPutts: 28,
  fewestPuttsSub: "GHIN 2024 · season avg was 28.0",
  eagles: 1,
  eaglesSub: "par-5 14th · mid birdie-eagle-birdie run",
  careerBirdies: 14,
  careerBirdiesSub: "12 Grint-tracked + 2 in the GHIN eagle round",
  bestBirdiesRound: 3,
  chipIns: 1,
  chipInsSub: "zero-putt hole on the 80 scorecard"
} as const;

function knownTiles(): RecordTile[] {
  return [
    { label: "Best score", value: String(KNOWN_GHIN.bestScore), sub: KNOWN_GHIN.bestScoreSub, tone: "green" },
    { label: "Best 9 holes", value: String(KNOWN_GHIN.bestNine), sub: KNOWN_GHIN.bestNineSub },
    { label: "Eagles", value: String(KNOWN_GHIN.eagles), sub: KNOWN_GHIN.eaglesSub, tone: "sand" },
    {
      label: "Birdies",
      value: `${KNOWN_GHIN.careerBirdies}+`,
      sub: KNOWN_GHIN.careerBirdiesSub,
      tone: "sand"
    },
    {
      label: "Most birdies (round)",
      value: String(KNOWN_GHIN.bestBirdiesRound),
      sub: "TheGrint record"
    },
    {
      label: "Best differential",
      value: KNOWN_GHIN.bestDifferential.toFixed(1),
      sub: KNOWN_GHIN.bestDifferentialSub
    },
    { label: "Fewest putts", value: String(KNOWN_GHIN.fewestPutts), sub: KNOWN_GHIN.fewestPuttsSub },
    { label: "Chip-ins", value: `${KNOWN_GHIN.chipIns}+`, sub: KNOWN_GHIN.chipInsSub },
    { label: "Up & downs", value: "3.0", sub: "per round · GHIN 2024" }
  ];
}

export function computeGhinRecords(rounds: RoundLog[]): RecordTile[] {
  const regulation = rounds.filter(isRegulationRound);
  if (regulation.length === 0) {
    return knownTiles();
  }
  const chronological = [...regulation].sort(
    (a, b) => parseDateKey(a.date).getTime() - parseDateKey(b.date).getTime()
  );

  const tiles: RecordTile[] = [];

  const best = regulation.reduce((lead, r) => (r.score < lead.score ? r : lead));
  tiles.push(
    best.score <= KNOWN_GHIN.bestScore
      ? {
          label: "Best score",
          value: String(best.score),
          sub: `${best.course.split("|")[0].trim()} · ${monthYear(best.date)}`,
          tone: "green"
        }
      : { label: "Best score", value: String(KNOWN_GHIN.bestScore), sub: KNOWN_GHIN.bestScoreSub, tone: "green" }
  );

  const nines = regulation
    .flatMap((r) => [r.front9, r.back9])
    .filter((v): v is number => v !== null && v !== undefined && v > 20);
  const bestNine = Math.min(KNOWN_GHIN.bestNine, ...nines);
  tiles.push({
    label: "Best 9 holes",
    value: String(bestNine),
    sub: bestNine === KNOWN_GHIN.bestNine ? KNOWN_GHIN.bestNineSub : "front or back, all synced rounds"
  });

  /* max, not sum-plus-known: re-importing the known eagle round must not
     double-count it (dedupe is by date+score, labels can differ). */
  const importedEagles = regulation.reduce((total, r) => total + (r.eagles ?? 0), 0);
  tiles.push({
    label: "Eagles",
    value: String(Math.max(KNOWN_GHIN.eagles, importedEagles)),
    sub: importedEagles > KNOWN_GHIN.eagles ? "across imported scorecards" : KNOWN_GHIN.eaglesSub,
    tone: "sand"
  });

  const syncedBirdies = regulation.reduce((total, r) => total + Math.max(0, r.birdies), 0);
  tiles.push({
    label: "Birdies",
    value: `${Math.max(KNOWN_GHIN.careerBirdies, syncedBirdies)}+`,
    sub:
      syncedBirdies > KNOWN_GHIN.careerBirdies
        ? "tracked across synced + logged rounds"
        : KNOWN_GHIN.careerBirdiesSub,
    tone: "sand"
  });

  const birdieRoundBest = Math.max(KNOWN_GHIN.bestBirdiesRound, ...regulation.map((r) => r.birdies));
  tiles.push({
    label: "Most birdies (round)",
    value: String(birdieRoundBest),
    sub: birdieRoundBest === KNOWN_GHIN.bestBirdiesRound ? "TheGrint record" : "from your synced rounds"
  });

  tiles.push({ label: "Chip-ins", value: `${KNOWN_GHIN.chipIns}+`, sub: KNOWN_GHIN.chipInsSub });

  const diffs = regulation.map((r) => r.differential).filter((v): v is number => v !== null && v !== undefined);
  const bestDiff = Math.min(KNOWN_GHIN.bestDifferential, ...diffs);
  tiles.push({
    label: "Best differential",
    value: bestDiff.toFixed(1),
    sub: bestDiff === KNOWN_GHIN.bestDifferential ? KNOWN_GHIN.bestDifferentialSub : "single round, synced"
  });

  const puttsRounds = regulation.filter((r) => r.putts > 0);
  const fewestPutts = Math.min(KNOWN_GHIN.fewestPutts, ...puttsRounds.map((r) => r.putts));
  tiles.push({
    label: "Fewest putts",
    value: String(fewestPutts),
    sub: fewestPutts === KNOWN_GHIN.fewestPutts ? KNOWN_GHIN.fewestPuttsSub : "single round, synced"
  });

  const fairwayRounds = regulation.filter((r) => r.fairwaysHit > 0);
  if (fairwayRounds.length > 0) {
    tiles.push({ label: "Most fairways", value: String(Math.max(...fairwayRounds.map((r) => r.fairwaysHit))), sub: "single round" });
  }

  const girRounds = regulation.filter((r) => r.gir > 0);
  if (girRounds.length > 0) {
    tiles.push({ label: "Most greens", value: String(Math.max(...girRounds.map((r) => r.gir))), sub: "in regulation, single round" });
  }

  const eighties = regulation.filter((r) => r.score < 90).length;
  tiles.push({
    label: "Rounds in the 80s",
    value: String(regulation.filter((r) => r.score >= 80 && r.score < 90).length),
    sub: `${eighties} rounds under 90 of ${regulation.length}`
  });

  let bestStreak = 0;
  let streak = 0;
  for (const round of chronological) {
    streak = round.score < 90 ? streak + 1 : 0;
    bestStreak = Math.max(bestStreak, streak);
  }
  if (bestStreak >= 2) {
    tiles.push({ label: "Sub-90 streak", value: String(bestStreak), sub: "consecutive rounds" });
  }

  const courseCounts = new Map<string, number>();
  for (const round of regulation) {
    const key = round.course.split("|")[0].trim();
    courseCounts.set(key, (courseCounts.get(key) ?? 0) + 1);
  }
  const [topCourse, topCount] = [...courseCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  tiles.push({ label: "Most played", value: String(topCount), sub: `rounds at ${topCourse} · ${courseCounts.size} courses total` });

  const lastTen = chronological.slice(-10);
  const lastTenAvg = lastTen.reduce((total, r) => total + r.score, 0) / lastTen.length;
  const allAvg = regulation.reduce((total, r) => total + r.score, 0) / regulation.length;
  tiles.push({
    label: "Last 10 avg",
    value: lastTenAvg.toFixed(1),
    sub: `career ${allAvg.toFixed(1)} — ${lastTenAvg <= allAvg ? "trending better" : "trending above career"}`,
    tone: lastTenAvg <= allAvg ? "green" : "sand"
  });

  return tiles;
}
