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
  Known milestones from Matt's GHIN scorecards that predate what a fresh
  sync may carry (GHIN advanced stats only exist where they were entered).
  The live computation below takes over the moment a synced round beats one.
  Source: GHIN View Scorecard — 80 (43/37) on a 6,407-yard par 72 with a
  birdie-eagle-birdie run on 13-15, 31 putts, 8 GIR.
*/
const KNOWN_GHIN = {
  bestScore: 80,
  bestScoreSub: "43 out · 37 in · 31 putts",
  bestNine: 37,
  bestNineSub: "back 9 · birdie-eagle-birdie on 13-15",
  fewestPutts: 31,
  eagles: 1,
  eaglesSub: "par-5 14th · mid birdie-eagle-birdie run"
} as const;

export function computeGhinRecords(rounds: RoundLog[]): RecordTile[] {
  const regulation = rounds.filter(isRegulationRound);
  if (regulation.length === 0) {
    return [
      { label: "Best score", value: String(KNOWN_GHIN.bestScore), sub: KNOWN_GHIN.bestScoreSub, tone: "green" },
      { label: "Best 9 holes", value: String(KNOWN_GHIN.bestNine), sub: KNOWN_GHIN.bestNineSub },
      { label: "Fewest putts", value: String(KNOWN_GHIN.fewestPutts), sub: "single round" },
      { label: "Eagles", value: String(KNOWN_GHIN.eagles), sub: KNOWN_GHIN.eaglesSub, tone: "sand" }
    ];
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

  tiles.push({ label: "Eagles", value: String(KNOWN_GHIN.eagles), sub: KNOWN_GHIN.eaglesSub, tone: "sand" });

  const diffs = regulation.map((r) => r.differential).filter((v): v is number => v !== null && v !== undefined);
  if (diffs.length > 0) {
    tiles.push({ label: "Best differential", value: Math.min(...diffs).toFixed(1), sub: "single round" });
  }

  const puttsRounds = regulation.filter((r) => r.putts > 0);
  tiles.push({
    label: "Fewest putts",
    value: String(Math.min(KNOWN_GHIN.fewestPutts, ...puttsRounds.map((r) => r.putts))),
    sub: "single round"
  });

  const fairwayRounds = regulation.filter((r) => r.fairwaysHit > 0);
  if (fairwayRounds.length > 0) {
    tiles.push({ label: "Most fairways", value: String(Math.max(...fairwayRounds.map((r) => r.fairwaysHit))), sub: "single round" });
  }

  const girRounds = regulation.filter((r) => r.gir > 0);
  if (girRounds.length > 0) {
    tiles.push({ label: "Most greens", value: String(Math.max(...girRounds.map((r) => r.gir))), sub: "in regulation, single round" });
  }

  const birdieRounds = regulation.filter((r) => r.birdies > 0);
  if (birdieRounds.length > 0) {
    tiles.push({
      label: "Birdies",
      value: String(birdieRounds.reduce((total, r) => total + r.birdies, 0)),
      sub: `tracked across ${birdieRounds.length} rounds · best ${Math.max(...birdieRounds.map((r) => r.birdies))}`
    });
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
