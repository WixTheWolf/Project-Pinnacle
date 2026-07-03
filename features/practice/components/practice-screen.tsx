"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Clock, Target, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { getDrillsByCategory } from "@/lib/seed-data";
import { usePinnacle, usePracticeHistory } from "@/hooks/use-pinnacle-data";
import type { Drill, PracticeCategory } from "@/types";

const CATEGORIES: { id: PracticeCategory; label: string }[] = [
  { id: "driver", label: "Driver" },
  { id: "irons", label: "Irons" },
  { id: "wedges", label: "Wedges" },
  { id: "putting", label: "Putting" },
  { id: "short-game", label: "Short Game" },
  { id: "bunker", label: "Bunker" },
  { id: "custom", label: "Custom" },
];

export function PracticeScreen() {
  const [activeCategory, setActiveCategory] = useState<PracticeCategory>("driver");
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [notes, setNotes] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const { logPracticeSession } = usePinnacle();
  const history = usePracticeHistory();

  const drills = getDrillsByCategory(activeCategory);
  const categoryHistory = history.filter((s) => s.category === activeCategory).slice(0, 5);

  const handleLogSession = () => {
    if (!selectedDrill) return;
    logPracticeSession({
      drillId: selectedDrill.id,
      category: selectedDrill.category,
      drillName: selectedDrill.name,
      date: new Date().toISOString(),
      durationMinutes: selectedDrill.durationMinutes,
      successMetricValue: metricValue ? parseFloat(metricValue) : undefined,
      notes: notes || undefined,
      completed: true,
    });
    setSelectedDrill(null);
    setNotes("");
    setMetricValue("");
  };

  if (selectedDrill) {
    return (
      <DrillDetail
        drill={selectedDrill}
        notes={notes}
        metricValue={metricValue}
        onNotesChange={setNotes}
        onMetricChange={setMetricValue}
        onLog={handleLogSession}
        onBack={() => setSelectedDrill(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Practice</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Intentional reps. Measurable progress.
        </p>
      </div>

      <Tabs
        tabs={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
        activeTab={activeCategory}
        onTabChange={(id) => setActiveCategory(id as PracticeCategory)}
      />

      <div className="space-y-3">
        {drills.map((drill, i) => (
          <motion.div
            key={drill.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="cursor-pointer transition-colors hover:border-accent-gold/30"
              onClick={() => setSelectedDrill(drill)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="font-medium">{drill.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{drill.purpose}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="muted">
                      <Clock className="mr-1 h-3 w-3" />
                      {drill.durationMinutes}m
                    </Badge>
                    <Badge variant="gold">{drill.difficulty}</Badge>
                  </div>
                </div>
                <Target className="h-5 w-5 text-accent-gold" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {categoryHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categoryHistory.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-xl bg-background/50 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{session.drillName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(session.date).toLocaleDateString()}
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

interface DrillDetailProps {
  drill: Drill;
  notes: string;
  metricValue: string;
  onNotesChange: (v: string) => void;
  onMetricChange: (v: string) => void;
  onLog: () => void;
  onBack: () => void;
}

function DrillDetail({
  drill,
  notes,
  metricValue,
  onNotesChange,
  onMetricChange,
  onLog,
  onBack,
}: DrillDetailProps) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="px-0">
        ← Back
      </Button>

      <div>
        <Badge variant="gold" className="mb-2">{drill.category}</Badge>
        <h1 className="text-2xl font-bold">{drill.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{drill.purpose}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {drill.instructions.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-gold/15 text-xs font-bold text-accent-gold">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Success Metric</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium text-accent-gold">{drill.successMetric}</p>
          <div className="mt-4">
            <Input
              label="Your Result (optional)"
              placeholder="e.g. 8/10"
              value={metricValue}
              onChange={(e) => onMetricChange(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Input
        label="Notes"
        placeholder="What did you learn?"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
      />

      <Button onClick={onLog} className="w-full" size="lg">
        <CheckCircle2 className="h-4 w-4" />
        Log Session ({drill.durationMinutes} min)
      </Button>
    </div>
  );
}
