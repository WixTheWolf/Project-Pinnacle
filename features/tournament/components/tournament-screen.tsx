"use client";

import { useState, useEffect, useMemo, useReducer } from "react";
import { Trophy, Timer, Package, Utensils, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checklist } from "@/components/ui/checklist";
import { Countdown } from "@/components/ui/countdown";
import { Tabs } from "@/components/ui/tabs";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
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
  const { togglePackingItem, toggleNutritionItem, addJournalEntry } = usePinnacle();
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
        label="Days to tee off"
        sublabel={`${GAMBLE_SANDS.startDate} – ${GAMBLE_SANDS.endDate}`}
      />

      <Tabs tabs={TOURNAMENT_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "overview" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-5">
              <ProgressBar value={packingProgress} label="Packing progress" variant="gold" />
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
              <Button variant="outline" className="w-full" onClick={() => setActiveTab("packing")}>
                Open packing list
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Race week mindset</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>One thought per shot. Trust the prep.</p>
              <p>Fresh beats fried — protect sleep and hydration.</p>
              <p>Review swing fixes before each round, not during.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "packing" && (
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <Package className="h-4 w-4 text-accent-gold" />
            <CardTitle className="text-base">Packing list</CardTitle>
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

      {activeTab === "warmup" && <WarmupTimer />}

      {activeTab === "nutrition" && (
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <Utensils className="h-4 w-4 text-accent-gold" />
            <CardTitle className="text-base">Round day nutrition</CardTitle>
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
          <p className="text-sm text-muted-foreground">Emergency swing fixes for on-course use.</p>
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
        <JournalPanel
          entries={tournament.roundJournal}
          onAdd={(notes, roundNumber) =>
            addJournalEntry({
              date: new Date().toISOString().split("T")[0],
              roundNumber,
              postRoundNotes: notes,
              mood: 3,
            })
          }
        />
      )}
    </div>
  );
}

function JournalPanel({
  entries,
  onAdd,
}: {
  entries: { id: string; date: string; roundNumber: number; postRoundNotes?: string }[];
  onAdd: (notes: string, roundNumber: number) => void;
}) {
  const [notes, setNotes] = useState("");
  const [roundNumber, setRoundNumber] = useState(String(entries.length + 1));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <BookOpen className="h-4 w-4 text-accent-gold" />
          <CardTitle className="text-base">Round journal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            label="Round number"
            type="number"
            min={1}
            max={4}
            value={roundNumber}
            onChange={(e) => setRoundNumber(e.target.value)}
          />
          <Input
            label="Post-round notes"
            placeholder="What worked? What carries to tomorrow?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button
            className="w-full"
            disabled={!notes.trim()}
            onClick={() => {
              onAdd(notes.trim(), parseInt(roundNumber, 10) || 1);
              setNotes("");
              setRoundNumber(String(parseInt(roundNumber, 10) + 1 || entries.length + 2));
            }}
          >
            Save entry
          </Button>
        </CardContent>
      </Card>

      {entries.length > 0 && (
        <Card>
          <CardContent className="space-y-2 pt-5">
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-xl bg-background/50 p-3">
                <p className="text-sm font-medium">Round {entry.roundNumber}</p>
                <p className="text-xs text-muted-foreground">{entry.date}</p>
                {entry.postRoundNotes && <p className="mt-2 text-sm">{entry.postRoundNotes}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function WarmupTimer() {
  const stepSeconds = useMemo(() => WARMUP_STEPS.map((step) => step.minutes * 60), []);

  const [{ currentStep, secondsLeft, isRunning }, dispatch] = useReducer(
    (state: { currentStep: number; secondsLeft: number; isRunning: boolean }, action: "tick" | "toggle" | "reset") => {
      if (action === "reset") {
        return { currentStep: 0, secondsLeft: stepSeconds[0], isRunning: false };
      }
      if (action === "toggle") {
        return { ...state, isRunning: !state.isRunning };
      }

      if (!state.isRunning) return state;
      if (state.secondsLeft > 1) {
        return { ...state, secondsLeft: state.secondsLeft - 1 };
      }
      if (state.currentStep >= WARMUP_STEPS.length - 1) {
        return { ...state, secondsLeft: 0, isRunning: false };
      }
      const nextStep = state.currentStep + 1;
      return { currentStep: nextStep, secondsLeft: stepSeconds[nextStep], isRunning: true };
    },
    { currentStep: 0, secondsLeft: stepSeconds[0], isRunning: false },
  );

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => dispatch("tick"), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isComplete = currentStep === WARMUP_STEPS.length - 1 && secondsLeft === 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col items-center py-8">
          <Timer className="mb-4 h-8 w-8 text-accent-gold" />
          <p className="text-5xl font-bold tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {isComplete
              ? "Warmup complete"
              : `Step ${currentStep + 1}: ${WARMUP_STEPS[currentStep]?.label}`}
          </p>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => dispatch("toggle")} variant={isRunning ? "secondary" : "default"}>
              {isRunning ? "Pause" : isComplete ? "Done" : "Start"}
            </Button>
            <Button variant="ghost" onClick={() => dispatch("reset")}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Accordion>
        {WARMUP_STEPS.map((step, i) => (
          <AccordionItem
            key={step.label}
            title={`${step.minutes}m — ${step.label}`}
            defaultOpen={i === currentStep}
          >
            Complete this step before moving to the next. Focus on quality over speed.
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
