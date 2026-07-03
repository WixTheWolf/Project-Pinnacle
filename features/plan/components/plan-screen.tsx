"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Countdown } from "@/components/ui/countdown";
import { ProgressBar } from "@/components/ui/progress-bar";
import { GAMBLE_SANDS } from "@/lib/constants";
import {
  getMissionSummary,
  getPeriodizationStatus,
  getWeeklyFocus,
  resolvePhaseId,
  WEEKLY_RHYTHM,
} from "@/lib/plan";
import { getCurrentPhaseName, getDaysUntil } from "@/lib/readiness";

export function PlanScreen() {
  const daysUntil = getDaysUntil(GAMBLE_SANDS.startDate);
  const phaseId = resolvePhaseId(daysUntil);
  const phaseName = getCurrentPhaseName(phaseId);
  const weeklyFocus = getWeeklyFocus(phaseId);
  const phases = getPeriodizationStatus(phaseId);
  const todayIndex = new Date().getDay();
  const todayRhythm = WEEKLY_RHYTHM[todayIndex === 0 ? 6 : todayIndex - 1];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-accent-gold">
          Road to Gamble Sands
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">{getMissionSummary(daysUntil)}</p>
      </div>

      <Countdown
        days={daysUntil}
        label="Tournament countdown"
        sublabel={`${GAMBLE_SANDS.location} · Aug 20–23`}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Current phase</CardTitle>
            <Badge variant="gold">{phaseName}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {phases.find((p) => p.active)?.description}
          </p>
          <ProgressBar
            value={((phases.findIndex((p) => p.active) + 1) / phases.length) * 100}
            label="Periodization progress"
            showValue={false}
            variant="gold"
            size="sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">This week&apos;s focus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-lg font-semibold">{weeklyFocus.title}</p>
          <ul className="space-y-2">
            {weeklyFocus.priorities.map((item) => (
              <li key={item} className="text-sm text-muted-foreground">
                · {item}
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="rounded-xl bg-background/50 p-3">
              <p className="text-xs text-muted-foreground">Practice</p>
              <p className="mt-1 text-sm font-medium">{weeklyFocus.practice}</p>
            </div>
            <div className="rounded-xl bg-background/50 p-3">
              <p className="text-xs text-muted-foreground">Recovery</p>
              <p className="mt-1 text-sm font-medium">{weeklyFocus.recovery}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today in the rhythm</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            <span className="font-semibold text-accent-gold">{todayRhythm.day}</span>
            <span className="text-muted-foreground"> — {todayRhythm.focus}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Periodization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {phases.map((phase) => (
            <div
              key={phase.id}
              className={`rounded-xl border p-3 ${
                phase.active
                  ? "border-accent-gold/40 bg-accent-gold/5"
                  : "border-border bg-background/30"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{phase.name}</p>
                <Badge variant={phase.active ? "gold" : phase.complete ? "green" : "muted"}>
                  {phase.active ? "Active" : phase.complete ? "Complete" : phase.weeks}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{phase.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
