"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, Timer, Package, Utensils, Wrench, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checklist } from "@/components/ui/checklist";
import { Countdown } from "@/components/ui/countdown";
import { Tabs } from "@/components/ui/tabs";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { ProgressBar } from "@/components/ui/progress-bar";
import { GAMBLE_SANDS } from "@/lib/constants";
import { getDaysUntil } from "@/lib/readiness";
import { usePinnacle, useTournament } from "@/hooks/use-pinnacle-data";

const TOURNAMENT_TABS = [
  { id: "overview", label: "Overview" },
  { id: "packing", label: "Packing" },
  { id: "warmup", label: "Warmup" },
  { id: "nutrition", label: "Nutrition" },
  { id: "fixes", label: "Fixes" },
  { id: "journal", label: "Journal" },
];

const WARMUP_STEPS = [
  { label: "Dynamic stretching", minutes: 5 },
  { label: "Wedge distance control (30-60-90)", minutes: 10 },
  { label: "Putting gate drill 6ft", minutes: 5 },
  { label: "Driver alignment gate", minutes: 10 },
  { label: "Visualization & breathing", minutes: 5 },
  { label: "Final 3 holes simulation", minutes: 10 },
];

export function TournamentScreen() {
  const [activeTab, setActiveTab] = useState("overview");
  const tournament = useTournament();
  const { togglePackingItem, toggleNutritionItem } = usePinnacle();
  const daysUntil = getDaysUntil(GAMBLE_SANDS.startDate);

  const packedCount = tournament.packingList.filter((i) => i.packed).length;
  const packingProgress = (packedCount / tournament.packingList.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-accent-gold" />
          <h1 className="text-3xl font-bold tracking-tight">Tournament</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {tournament.name} · {tournament.location}
        </p>
      </div>

      <Countdown
        days={daysUntil}
        label="Days to Tee Off"
        sublabel={`${GAMBLE_SANDS.startDate} – ${GAMBLE_SANDS.endDate}`}
      />

      <Tabs tabs={TOURNAMENT_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "overview" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <ProgressBar value={packingProgress} label="Packing Progress" variant="gold" />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-background/50 p-3 text-center">
                  <p className="text-2xl font-bold text-accent-gold">{tournament.warmupMinutes}</p>
                  <p className="text-xs text-muted-foreground">Warmup min</p>
                </div>
                <div className="rounded-xl bg-background/50 p-3 text-center">
                  <p className="text-2xl font-bold text-accent-gold">{tournament.swingFixes.length}</p>
                  <p className="text-xs text-muted-foreground">Swing fixes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pre-Tournament Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Confirm tee times and course layout</p>
              <p>✓ Review Gamble Sands course guide</p>
              <p>✓ Pack clubs night before</p>
              <p>✓ Set nutrition plan for each round</p>
              <p>✓ Review emergency swing fixes</p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "packing" && (
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <Package className="h-4 w-4 text-accent-gold" />
            <CardTitle className="text-base">Packing List</CardTitle>
          </CardHeader>
          <CardContent>
            <Checklist
              items={tournament.packingList.map((i) => ({
                id: i.id,
                label: i.label,
                completed: i.packed,
              }))}
              onToggle={togglePackingItem}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === "warmup" && <WarmupTimer totalMinutes={tournament.warmupMinutes} />}

      {activeTab === "nutrition" && (
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <Utensils className="h-4 w-4 text-accent-gold" />
            <CardTitle className="text-base">Round Day Nutrition</CardTitle>
          </CardHeader>
          <CardContent>
            <Checklist
              items={tournament.nutritionPlan.map((i) => ({
                id: i.id,
                label: `${i.timing}: ${i.description}`,
                completed: i.completed,
              }))}
              onToggle={toggleNutritionItem}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === "fixes" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-4 w-4 text-accent-gold" />
            <p className="text-sm text-muted-foreground">Emergency swing fixes for on-course use</p>
          </div>
          {tournament.swingFixes.map((fix) => (
            <Card key={fix.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{fix.issue}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{fix.fix}</p>
                  </div>
                  <Badge variant={fix.priority === "high" ? "red" : fix.priority === "medium" ? "gold" : "muted"}>
                    {fix.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "journal" && (
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <BookOpen className="h-4 w-4 text-accent-gold" />
            <CardTitle className="text-base">Round Journal</CardTitle>
          </CardHeader>
          <CardContent>
            {tournament.roundJournal.length > 0 ? (
              tournament.roundJournal.map((entry) => (
                <div key={entry.id} className="mb-3 rounded-xl bg-background/50 p-3">
                  <p className="text-sm font-medium">Round {entry.roundNumber}</p>
                  <p className="text-xs text-muted-foreground">{entry.date}</p>
                  {entry.postRoundNotes && (
                    <p className="mt-2 text-sm">{entry.postRoundNotes}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Journal entries will appear here during the tournament.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function WarmupTimer({ totalMinutes }: { totalMinutes: number }) {
  const [secondsLeft, setSecondsLeft] = useState(totalMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const tick = useCallback(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        setIsRunning(false);
        return 0;
      }
      return prev - 1;
    });
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col items-center py-8">
          <Timer className="h-8 w-8 text-accent-gold mb-4" />
          <p className="text-5xl font-bold tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Step {currentStep + 1}: {WARMUP_STEPS[currentStep]?.label}
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              variant={isRunning ? "secondary" : "default"}
            >
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsRunning(false);
                setSecondsLeft(totalMinutes * 60);
                setCurrentStep(0);
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Accordion>
        {WARMUP_STEPS.map((step, i) => (
          <AccordionItem key={i} title={`${step.minutes}m — ${step.label}`} defaultOpen={i === 0}>
            Complete this step before moving to the next. Focus on quality over speed.
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
