/*
  Scorecard paste-importer.

  TheGrint has no API, blocks automated fetching (Cloudflare 403), and the
  Free tier has no export — but scorecard pages copy cleanly as text. This
  parses the copied text of a TheGrint or GHIN scorecard (PAR / SCORE /
  PUTTS table rows) and derives the hole-by-hole stats no sync can provide.
*/

export interface ParsedScorecard {
  holes: number;
  par: number[];
  score: number[];
  putts: number[] | null;
  totalScore: number;
  totalPar: number;
  totalPutts: number | null;
  front9: number | null;
  back9: number | null;
  eagles: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doublesOrWorse: number;
  threePutts: number;
  onePutts: number;
  zeroPutts: number;
}

/* Pull hole values from every row labeled PAR / SCORE / PUTTS. Scorecards
   are often split into Front 9 / Back 9 tables, so the same label appears
   twice — values from each occurrence are concatenated. Subtotals (OUT/IN/
   TOTAL) are filtered by per-hole plausibility bounds. */
function extractRow(
  lines: string[],
  labels: string[],
  min: number,
  max: number,
  expected: number
): number[] | null {
  const values: number[] = [];
  const matchesLabel = (line: string) =>
    labels.some((label) => line === label || line.startsWith(`${label} `) || line.startsWith(`${label}\t`) || line.startsWith(`${label}:`));

  for (let i = 0; i < lines.length && values.length < expected; i++) {
    const upper = lines[i].trim().toUpperCase();
    if (!matchesLabel(upper)) {
      continue;
    }
    /* Collect from the label line and following number-bearing lines until
       the next lettered row label. Each occurrence contributes at most 9
       values when the card is split front/back. */
    const collected: number[] = [];
    for (let j = i; j < Math.min(i + 30, lines.length) && collected.length < expected - values.length; j++) {
      const raw = j === i ? lines[j].replace(/^[^\d]*/, "") : lines[j].trim();
      if (j > i && /^[A-Za-z]/.test(raw)) {
        break;
      }
      for (const token of raw.split(/[^\d]+/)) {
        if (token === "") {
          continue;
        }
        const value = Number(token);
        if (value >= min && value <= max) {
          collected.push(value);
        }
      }
    }
    /* A front/back table row carries 9 holes plus a plausible subtotal that
       slipped the bounds filter; cap each occurrence at 9 when we're
       assembling an 18-hole card from two tables. */
    if (expected === 18 && collected.length > 9 && collected.length < 18) {
      values.push(...collected.slice(0, 9));
    } else {
      values.push(...collected);
    }
  }
  if (values.length >= 18) {
    return values.slice(0, 18);
  }
  if (values.length === 9) {
    return values;
  }
  return values.length > 0 ? null : null;
}

export function parseScorecard(text: string): ParsedScorecard | { error: string } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

  const par = extractRow(lines, ["PAR"], 3, 6, 18);
  if (!par) {
    return { error: "Couldn't find a PAR row. Copy the whole scorecard table, including the PAR line." };
  }
  const holes = par.length >= 18 ? 18 : 9;
  const parRow = par.slice(0, holes);

  /* Prefer the raw SCORE row; ADJ. SCORE only as fallback (they diverge on
     ESC-adjusted holes). Matching is prefix-based, so "ADJ. SCORE" never
     collides with "SCORE". */
  const score =
    extractRow(lines, ["SCORE"], 1, 15, holes) ?? extractRow(lines, ["ADJ. SCORE", "ADJ SCORE", "GROSS"], 1, 15, holes);
  if (!score) {
    return { error: "Couldn't find a SCORE row. Copy the whole scorecard table, including the SCORE line." };
  }
  const scoreRow = score.slice(0, holes);

  const puttsRaw = extractRow(lines, ["PUTTS"], 0, 6, holes);
  const puttsRow = puttsRaw && puttsRaw.length === holes ? puttsRaw : null;

  const totalScore = scoreRow.reduce((total, v) => total + v, 0);
  const totalPar = parRow.reduce((total, v) => total + v, 0);
  const deltas = scoreRow.map((s, i) => s - parRow[i]);

  return {
    holes,
    par: parRow,
    score: scoreRow,
    putts: puttsRow,
    totalScore,
    totalPar,
    totalPutts: puttsRow ? puttsRow.reduce((total, v) => total + v, 0) : null,
    front9: holes === 18 ? scoreRow.slice(0, 9).reduce((total, v) => total + v, 0) : null,
    back9: holes === 18 ? scoreRow.slice(9).reduce((total, v) => total + v, 0) : null,
    eagles: deltas.filter((d) => d <= -2).length,
    birdies: deltas.filter((d) => d === -1).length,
    pars: deltas.filter((d) => d === 0).length,
    bogeys: deltas.filter((d) => d === 1).length,
    doublesOrWorse: deltas.filter((d) => d >= 2).length,
    threePutts: puttsRow ? puttsRow.filter((p) => p >= 3).length : 0,
    onePutts: puttsRow ? puttsRow.filter((p) => p === 1).length : 0,
    zeroPutts: puttsRow ? puttsRow.filter((p) => p === 0).length : 0
  };
}

export function summarizeScorecard(card: ParsedScorecard): string {
  const toPar = card.totalScore - card.totalPar;
  const parts = [
    `${card.totalScore} (${toPar >= 0 ? "+" : ""}${toPar}) on a par ${card.totalPar}`,
    card.front9 !== null ? `out ${card.front9} · in ${card.back9}` : null,
    card.totalPutts !== null ? `${card.totalPutts} putts` : null,
    card.eagles > 0 ? `${card.eagles} eagle${card.eagles > 1 ? "s" : ""}` : null,
    `${card.birdies} birdie${card.birdies === 1 ? "" : "s"}`,
    `${card.pars} pars`,
    `${card.doublesOrWorse} double+`,
    card.putts ? `${card.threePutts} three-putt${card.threePutts === 1 ? "" : "s"}` : null,
    card.zeroPutts > 0 ? `${card.zeroPutts} chip-in${card.zeroPutts > 1 ? "s" : ""}` : null
  ];
  return parts.filter(Boolean).join(" · ");
}
