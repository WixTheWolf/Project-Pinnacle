"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Flame, Target, Heart, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checklist } from "@/components/ui/checklist";
import { Countdown } from "@/components/ui/countdown";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ReadinessRing } from "@/components/ui/readiness-ring";
import { StatCard } from "@/components/ui/stat-card";
import { GAMBLE_SANDS } from "@/lib/constants";
import {
  getCurrentPhaseName,
  getDaysUntil,
  getHandicapProgress,
  getMotivationalMessage,
} from "@/lib/readiness";
import { usePinnacle, useStreaks, useUser } from "@/hooks/use-pinnacle-data";

const quickActions = [
  { href: "/practice", label: "Start Practice", icon: Target, color: "text-accent-gold" },
  { href: "/recovery", label: "Recovery", icon: Heart, color: "text-accent-green" },
  { href: "/stats", label: "Log Round", icon: BarChart3, color: "text-foreground" },
];

export function TodayScreen() {
  const { state, readiness, toggleTask } = usePinnacle();
  const user = useUser();
  const streaks = useStreaks();
  const daysUntil = getDaysUntil(GAMBLE_SANDS.startDate);
  const phaseName = getCurrentPhaseName(state.settings.currentPhaseId);
  const message = getMotivationalMessage(readiness, daysUntil);
  const handicapProgress = getHandicapProgress(user.handicap, user.goalHandicap);

  const checklistItems = state.dailyTasks.map((t) => ({
    id: t.id,
    label: t.label,
    completed: t.completed,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Good {getGreeting()}, {user.firstName}
        </h1>
      </motion.div>

      {/* Countdown */}
      <Countdown
        days={daysUntil}
        label="Gamble Sands"
        sublabel={`${GAMBLE_SANDS.location} · Aug 20–23`}
      />

      {/* Readiness + Phase */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col items-center justify-center py-4">
          <ReadinessRing score={readiness.score} size={100} strokeWidth={7} />
        </Card>
        <div className="space-y-3">
          <StatCard
            label="Training Phase"
            value={phaseName}
            subtext="Current block"
          />
          <StatCard
            label="Handicap"
            value={user.handicap}
            subtext={`Goal: ${user.goalHandicap}`}
            trend="neutral"
            trendValue={`${handicapProgress}% to goal`}
          />
        </div>
      </div>

      {/* Readiness Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Readiness Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ProgressBar value={readiness.mobility} label="Mobility" variant="green" size="sm" />
          <ProgressBar value={readiness.practice} label="Practice" variant="gold" size="sm" />
          <ProgressBar value={readiness.recovery} label="Recovery" variant="green" size="sm" />
          <ProgressBar value={readiness.sleep} label="Sleep" variant="default" size="sm" />
          <ProgressBar value={readiness.hydration} label="Hydration" variant="gold" size="sm" />
        </CardContent>
      </Card>

      {/* Coaching Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-accent-gold/20 bg-accent-gold/5 p-5"
      >
        <p className="text-xs font-medium uppercase tracking-wider text-accent-gold">Coach</p>
        <p className="mt-2 text-sm leading-relaxed text-foreground">{message}</p>
      </motion.div>

      {/* Today's Tasks */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Today&apos;s Tasks</CardTitle>
          <Badge variant="gold">
            {checklistItems.filter((t) => t.completed).length}/{checklistItems.length}
          </Badge>
        </CardHeader>
        <CardContent>
          <Checklist items={checklistItems} onToggle={toggleTask} />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button variant="secondary" className="h-auto w-full flex-col gap-2 py-4">
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <span className="text-xs">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Streaks */}
      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <Flame className="h-4 w-4 text-accent-gold" />
          <CardTitle className="text-base">Active Streaks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {streaks.map((streak) => (
              <div
                key={streak.id}
                className="rounded-xl bg-background/50 p-3 text-center"
              >
                <p className="text-2xl font-bold text-accent-gold">{streak.current}</p>
                <p className="text-xs text-muted-foreground">{streak.label}</p>
                {streak.best > 0 && (
                  <p className="mt-0.5 text-[10px] text-muted-foreground">Best: {streak.best}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
