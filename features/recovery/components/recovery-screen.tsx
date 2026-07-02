"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Clock, Heart, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { getWorkoutsByCategory } from "@/lib/seed-data";
import { usePinnacle, useRecoveryHistory } from "@/hooks/use-pinnacle-data";
import type { RecoveryCategory, Workout } from "@/types";

const CATEGORIES: { id: RecoveryCategory; label: string }[] = [
  { id: "mobility", label: "Mobility" },
  { id: "stretching", label: "Stretching" },
  { id: "foam-rolling", label: "Foam Roll" },
  { id: "massage-gun", label: "Massage Gun" },
  { id: "sleep", label: "Sleep" },
  { id: "hydration", label: "Hydration" },
  { id: "strength", label: "Strength" },
];

export function RecoveryScreen() {
  const [activeCategory, setActiveCategory] = useState<RecoveryCategory>("mobility");
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const { logRecoverySession } = usePinnacle();
  const history = useRecoveryHistory();

  const workouts = getWorkoutsByCategory(activeCategory);
  const recentHistory = history.slice(0, 8);

  const handleComplete = (workout: Workout) => {
    logRecoverySession({
      workoutId: workout.id,
      category: workout.category,
      workoutName: workout.name,
      date: new Date().toISOString(),
      durationMinutes: workout.durationMinutes,
      completed: true,
    });
    setSelectedWorkout(null);
  };

  if (selectedWorkout) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedWorkout(null)} className="px-0">
          ← Back
        </Button>

        <div>
          <Badge variant="green" className="mb-2">{selectedWorkout.category}</Badge>
          <h1 className="text-2xl font-bold">{selectedWorkout.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{selectedWorkout.description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {selectedWorkout.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-green/15 text-xs font-bold text-accent-green">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Button
          onClick={() => handleComplete(selectedWorkout)}
          className="w-full"
          size="lg"
          variant="success"
        >
          <CheckCircle2 className="h-4 w-4" />
          Mark Complete ({selectedWorkout.durationMinutes} min)
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recovery</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Prepare the body. Protect the scorecard.
        </p>
      </div>

      <Tabs
        tabs={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
        activeTab={activeCategory}
        onTabChange={(id) => setActiveCategory(id as RecoveryCategory)}
      />

      <div className="space-y-3">
        {workouts.map((workout, i) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="cursor-pointer transition-colors hover:border-accent-green/30"
              onClick={() => setSelectedWorkout(workout)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="font-medium">{workout.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {workout.description}
                  </p>
                  <Badge variant="muted">
                    <Clock className="mr-1 h-3 w-3" />
                    {workout.durationMinutes}m
                  </Badge>
                </div>
                <Heart className="h-5 w-5 text-accent-green" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {recentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recovery History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentHistory.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-xl bg-background/50 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{session.workoutName}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.category} · {new Date(session.date).toLocaleDateString()}
                  </p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-accent-green" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
