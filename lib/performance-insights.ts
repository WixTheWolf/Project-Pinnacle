import { USER } from "@/lib/constants";
import type { Round } from "@/types";

export interface PerformanceInsight {
  id: string;
  title: string;
  detail: string;
  tone: "gold" | "green" | "muted" | "red";
}

export function getPerformanceInsights(rounds: Round[]): PerformanceInsight[] {
  if (rounds.length === 0) {
    return [
      {
        id: "empty",
        title: "Log your first round",
        detail: "Performance insights appear after you track a round. Focus on score, GIR, putts, and penalties.",
        tone: "gold",
      },
    ];
  }

  const insights: PerformanceInsight[] = [];
  const recent = rounds.slice(0, 5);
  const avgScore = recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
  const avgPutts = recent.reduce((sum, r) => sum + r.putts, 0) / recent.length;
  const avgGir =
    recent.reduce((sum, r) => sum + (r.girTotal > 0 ? r.gir / r.girTotal : 0), 0) / recent.length;
  const avgPenalties = recent.reduce((sum, r) => sum + r.penalties, 0) / recent.length;
  const avgDoubles = recent.reduce((sum, r) => sum + r.doubles, 0) / recent.length;

  const targetScore = USER.goalHandicap + 72;
  const scoreGap = avgScore - targetScore;
  insights.push({
    id: "score",
    title: scoreGap <= 2 ? "Scoring range is close" : "Scoring gap to target",
    detail:
      scoreGap <= 2
        ? `Recent avg ${avgScore.toFixed(1)} — within striking distance of your ${USER.goalHandicap} goal.`
        : `Recent avg ${avgScore.toFixed(1)}. Target ~${targetScore.toFixed(0)} for a ${USER.goalHandicap} handicap.`,
    tone: scoreGap <= 2 ? "green" : "gold",
  });

  if (avgPutts >= 32) {
    insights.push({
      id: "putts",
      title: "Putting is leaking strokes",
      detail: `${avgPutts.toFixed(1)} putts per round. Lag putting and 6ft make rate are the fastest fix.`,
      tone: "red",
    });
  } else if (avgPutts <= 30) {
    insights.push({
      id: "putts",
      title: "Putting is a strength",
      detail: `${avgPutts.toFixed(1)} putts per round — keep speed control sharp.`,
      tone: "green",
    });
  }

  if (avgGir < 0.4) {
    insights.push({
      id: "gir",
      title: "Approach play needs attention",
      detail: `${Math.round(avgGir * 100)}% GIR. Iron start line and wedge distance control should lead practice.`,
      tone: "red",
    });
  }

  if (avgPenalties >= 1.5 || avgDoubles >= 1) {
    insights.push({
      id: "blowups",
      title: "Eliminate blow-up holes",
      detail: "Penalties and doubles are costing more than missed birdies. Play for center of green off the tee.",
      tone: "red",
    });
  }

  if (rounds.length >= 3) {
    const older = rounds.slice(5, 10);
    if (older.length >= 2) {
      const olderAvg = older.reduce((sum, r) => sum + r.score, 0) / older.length;
      const delta = olderAvg - avgScore;
      if (delta >= 1) {
        insights.push({
          id: "trend",
          title: "Trending in the right direction",
          detail: `${delta.toFixed(1)} strokes better over your last five rounds vs prior block.`,
          tone: "green",
        });
      } else if (delta <= -1) {
        insights.push({
          id: "trend",
          title: "Recent scores have slipped",
          detail: `Up ${Math.abs(delta).toFixed(1)} strokes vs prior block. Check recovery and practice focus.`,
          tone: "gold",
        });
      }
    }
  }

  return insights.slice(0, 4);
}

export function getHandicapProgress(baseline: number, goal: number, rounds: Round[]): number {
  const totalDrop = baseline - goal;
  if (totalDrop <= 0) return 100;
  if (rounds.length === 0) return 0;

  const recent = rounds.slice(0, 5);
  const avgScore = recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
  const baselineScore = baseline + 72;
  const improvement = Math.max(0, baselineScore - avgScore);
  const estimatedDrop = improvement * 0.45;

  return Math.min(100, Math.round((estimatedDrop / totalDrop) * 100));
}
