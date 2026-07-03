"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checklist } from "@/components/ui/checklist";
import { ReadinessRing } from "@/components/ui/readiness-ring";
import { usePinnacle, useRounds, useStreaks, useUser } from "@/hooks/use-pinnacle-data";
import { GAMBLE_SANDS } from "@/lib/constants";
import { getHandicapProgress } from "@/lib/performance-insights";
import { getWeeklyFocus, resolvePhaseId } from "@/lib/plan";
import {
  getCurrentPhaseName,
  getDaysUntil,
  getMotivationalMessage,
} from "@/lib/readiness";

export function TodayScreen() {
  const { state, readiness, toggleTask } = usePinnacle();
  const user = useUser();
  const streaks = useStreaks();
  const rounds = useRounds();
  const daysUntil = getDaysUntil(GAMBLE_SANDS.startDate);
  const phaseId = resolvePhaseId(daysUntil);
  const phaseName = getCurrentPhaseName(phaseId);
  const message = getMotivationalMessage(readiness, daysUntil);
  const handicapProgress = getHandicapProgress(user.handicap, user.goalHandicap, rounds);
  const weeklyFocus = getWeeklyFocus(phaseId);

  const checklistItems = state.dailyTasks.map((t) => ({
    id: t.id,
    label: t.label,
    completed: t.completed,
    href: t.href,
  }));

  const nextTask = state.dailyTasks.find((t) => !t.completed);
  const completedCount = checklistItems.filter((t) => t.completed).length;
  const topStreak = [...streaks].sort((a, b) => b.current - a.current)[0];

  return (
    <div className="space-y-5">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Good {getGreeting()}, {user.firstName}
        </h1>
        <p className="text-sm text-muted-foreground">
          {daysUntil} days to {GAMBLE_SANDS.name} · {phaseName} phase
        </p>
      </motion.header>

      {nextTask ? (
        <Card className="border-accent-gold/30 bg-gradient-to-br from-card to-background">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-accent-gold">
                  Do this first
                </p>
                <p className="mt-2 text-lg font-semibold leading-snug">{nextTask.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{message}</p>
              </div>
              <ReadinessRing score={readiness.score} size={88} strokeWidth={6} />
            </div>
            {nextTask.href ? (
              <Link href={nextTask.href} className="block">
                <Button className="w-full" size="lg">
                  Start
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button className="w-full" size="lg" onClick={() => toggleTask(nextTask.id)}>
                Mark complete
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-accent-green/30">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-accent-green">
                Today is complete
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Rest, review the plan, or get an extra rep if you feel sharp.
              </p>
            </div>
            <ReadinessRing score={readiness.score} size={88} strokeWidth={6} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Today&apos;s mission</CardTitle>
          <Badge variant="gold">
            {completedCount}/{checklistItems.length}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <Checklist items={checklistItems} onToggle={toggleTask} />
          <div className="rounded-xl border border-border/60 bg-background/40 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">This week: {weeklyFocus.title}</p>
            <p className="mt-1">{weeklyFocus.priorities[0]}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Handicap path</p>
            <p className="mt-1 text-2xl font-bold">{user.handicap}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Goal {user.goalHandicap}
              {rounds.length > 0 ? ` · ${handicapProgress}% progress` : " · log rounds to track"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="h-3 w-3 text-accent-gold" />
              Top streak
            </p>
            <p className="mt-1 text-2xl font-bold text-accent-gold">{topStreak?.current ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">{topStreak?.label ?? "Start today"}</p>
          </CardContent>
        </Card>
      </div>

      <Link href="/plan" className="block">
        <Button variant="outline" className="w-full">
          View full plan
        </Button>
      </Link>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
