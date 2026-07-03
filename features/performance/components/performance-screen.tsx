"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { usePinnacle, useRounds } from "@/hooks/use-pinnacle-data";
import { getPerformanceInsights } from "@/lib/performance-insights";

interface RoundForm {
  date: string;
  course: string;
  score: string;
  fairwaysHit: string;
  fairwaysTotal: string;
  gir: string;
  girTotal: string;
  putts: string;
  penalties: string;
  birdies: string;
  doubles: string;
  threePutts: string;
  upAndDowns: string;
  upAndDownAttempts: string;
  notes: string;
}

const emptyForm: RoundForm = {
  date: new Date().toISOString().split("T")[0],
  course: "",
  score: "",
  fairwaysHit: "",
  fairwaysTotal: "14",
  gir: "",
  girTotal: "18",
  putts: "",
  penalties: "",
  birdies: "",
  doubles: "",
  threePutts: "",
  upAndDowns: "",
  upAndDownAttempts: "",
  notes: "",
};

const insightVariant: Record<string, "gold" | "green" | "red" | "muted"> = {
  gold: "gold",
  green: "green",
  red: "red",
  muted: "muted",
};

export function PerformanceScreen() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RoundForm>(emptyForm);
  const { logRound } = usePinnacle();
  const rounds = useRounds();
  const insights = useMemo(() => getPerformanceInsights(rounds), [rounds]);

  const chartData = [...rounds]
    .reverse()
    .slice(-10)
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: r.score,
    }));

  const latestRound = rounds[0];
  const avgScore =
    rounds.length > 0
      ? Math.round(rounds.reduce((sum, r) => sum + r.score, 0) / rounds.length)
      : null;

  const handleSubmit = () => {
    if (!form.score) return;
    logRound({
      date: form.date,
      course: form.course || undefined,
      score: parseInt(form.score, 10),
      fairwaysHit: parseInt(form.fairwaysHit, 10) || 0,
      fairwaysTotal: parseInt(form.fairwaysTotal, 10) || 14,
      gir: parseInt(form.gir, 10) || 0,
      girTotal: parseInt(form.girTotal, 10) || 18,
      putts: parseInt(form.putts, 10) || 0,
      penalties: parseInt(form.penalties, 10) || 0,
      birdies: parseInt(form.birdies, 10) || 0,
      doubles: parseInt(form.doubles, 10) || 0,
      threePutts: parseInt(form.threePutts, 10) || 0,
      upAndDowns: parseInt(form.upAndDowns, 10) || 0,
      upAndDownAttempts: parseInt(form.upAndDownAttempts, 10) || 0,
      notes: form.notes || undefined,
    });
    setForm(emptyForm);
    setShowForm(false);
  };

  const updateField = (field: keyof RoundForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (showForm) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setShowForm(false)} className="px-0">
          ← Back
        </Button>
        <h1 className="text-2xl font-bold">Log Round</h1>

        <Input label="Date" type="date" value={form.date} onChange={(e) => updateField("date", e.target.value)} />
        <Input label="Course" placeholder="Course name" value={form.course} onChange={(e) => updateField("course", e.target.value)} />
        <Input label="Score" type="number" placeholder="82" value={form.score} onChange={(e) => updateField("score", e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Fairways Hit" type="number" value={form.fairwaysHit} onChange={(e) => updateField("fairwaysHit", e.target.value)} />
          <Input label="Fairways Total" type="number" value={form.fairwaysTotal} onChange={(e) => updateField("fairwaysTotal", e.target.value)} />
          <Input label="GIR" type="number" value={form.gir} onChange={(e) => updateField("gir", e.target.value)} />
          <Input label="GIR Total" type="number" value={form.girTotal} onChange={(e) => updateField("girTotal", e.target.value)} />
          <Input label="Putts" type="number" value={form.putts} onChange={(e) => updateField("putts", e.target.value)} />
          <Input label="Penalties" type="number" value={form.penalties} onChange={(e) => updateField("penalties", e.target.value)} />
          <Input label="Birdies" type="number" value={form.birdies} onChange={(e) => updateField("birdies", e.target.value)} />
          <Input label="Doubles+" type="number" value={form.doubles} onChange={(e) => updateField("doubles", e.target.value)} />
          <Input label="3-Putts" type="number" value={form.threePutts} onChange={(e) => updateField("threePutts", e.target.value)} />
          <Input label="Up & Downs" type="number" value={form.upAndDowns} onChange={(e) => updateField("upAndDowns", e.target.value)} />
        </div>

        <Input label="Notes" placeholder="Key takeaways..." value={form.notes} onChange={(e) => updateField("notes", e.target.value)} />

        <Button onClick={handleSubmit} className="w-full" size="lg">
          Save Round
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Patterns, weaknesses, and progress toward 3.
          </p>
        </div>
        <Button size="icon" onClick={() => setShowForm(true)} aria-label="Log new round">
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.map((insight) => (
            <div key={insight.id} className="rounded-xl border border-border bg-background/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{insight.title}</p>
                <Badge variant={insightVariant[insight.tone]}>{insight.tone}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{insight.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {rounds.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Last score" value={latestRound?.score ?? "—"} subtext={latestRound?.course} />
          <StatCard label="Average" value={avgScore ?? "—"} subtext={`${rounds.length} rounds`} />
        </div>
      )}

      {chartData.length > 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent scoring</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "12px",
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="#D6B56D" strokeWidth={2} dot={{ fill: "#D6B56D" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {rounds.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Round log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rounds.slice(0, 8).map((round) => (
              <div
                key={round.id}
                className="flex items-center justify-between rounded-xl bg-background/50 px-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {round.course ?? "Round"} — {round.score}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(round.date).toLocaleDateString()} · {round.putts} putts · {round.gir}/{round.girTotal} GIR
                  </p>
                </div>
                {round.doubles > 0 && <Badge variant="red">{round.doubles} double+</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Log a round to unlock performance insights.</p>
            <Button onClick={() => setShowForm(true)} className="mt-4" variant="outline">
              Log round
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
