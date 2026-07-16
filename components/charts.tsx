"use client";

import { useId, useMemo, useState } from "react";
import { SKILL_CATEGORIES, SKILL_LABELS, SkillCategory } from "@/lib/field-data";

/*
  Chart color system (validated for CVD + contrast on the #131A15 card surface):
  gold #BA8A28 · turf #4FA86B · sky #4E90D1 · clay #D95F53.
  The lighter brand gold (#E2C178) is reserved for text accents, never for marks.
  Text on charts always wears ink tokens, never the series color.
*/
export const CHART = {
  gold: "#BA8A28",
  turf: "#4FA86B",
  sky: "#4E90D1",
  clay: "#D95F53",
  grid: "rgba(242, 245, 240, 0.08)",
  axis: "rgba(242, 245, 240, 0.14)",
  ink: "#F2F5F0",
  inkMuted: "#9AA89D",
  inkFaint: "#647065",
  surface: "#131A15",
  reference: "#77837A"
} as const;

function statusColor(score: number) {
  if (score >= 80) return CHART.turf;
  if (score >= 60) return CHART.gold;
  return CHART.clay;
}

/* ---------------------------------------------------------------- */
/* ProgressRing — radial gauge for readiness / countdown            */
/* ---------------------------------------------------------------- */

export function ProgressRing({
  value,
  max = 100,
  size = 116,
  stroke = 9,
  color,
  label,
  sublabel,
  centerValue
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: string;
  label: string;
  sublabel?: string;
  centerValue?: string;
}) {
  const clamped = Math.max(0, Math.min(value, max));
  const ringColor = color ?? statusColor((clamped / max) * 100);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (clamped / max) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(242, 245, 240, 0.09)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference - filled}`}
            strokeDashoffset={0}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="ring-animate"
            style={{ "--ring-circumference": `${circumference}` } as React.CSSProperties}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold leading-none text-text">
            {centerValue ?? Math.round(clamped)}
          </span>
          {sublabel ? <span className="mt-1 text-[10px] font-medium text-faint">{sublabel}</span> : null}
        </div>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* ScoreTrendChart — round scores over time with the 79–84 target   */
/* ---------------------------------------------------------------- */

export function ScoreTrendChart({
  scores,
  dates,
  targetLow = 79,
  targetHigh = 84
}: {
  scores: number[];
  dates: string[];
  targetLow?: number;
  targetHigh?: number;
}) {
  const gradientId = useId();
  const [active, setActive] = useState<number | null>(null);

  const width = 340;
  const height = 180;
  const pad = { top: 16, right: 14, bottom: 24, left: 34 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const { points, ticks, yFor } = useMemo(() => {
    const lo = Math.min(...scores, targetLow) - 2;
    const hi = Math.max(...scores, targetHigh) + 2;
    const min = Math.floor(lo / 5) * 5;
    const max = Math.ceil(hi / 5) * 5;
    const yScale = (v: number) => pad.top + plotH - ((v - min) / (max - min)) * plotH;
    const xScale = (i: number) =>
      scores.length === 1 ? pad.left + plotW / 2 : pad.left + (i / (scores.length - 1)) * plotW;
    const tickValues: number[] = [];
    for (let t = min; t <= max; t += 5) tickValues.push(t);
    return {
      points: scores.map((s, i) => ({ x: xScale(i), y: yScale(s), score: s, date: dates[i] })),
      ticks: tickValues,
      yFor: yScale
    };
  }, [scores, dates, targetLow, targetHigh, pad.left, pad.top, plotH, plotW]);

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const bestIdx = scores.indexOf(Math.min(...scores));
  const lastIdx = scores.length - 1;
  const activePoint = active !== null ? points[active] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label={`Score trend across ${scores.length} rounds. Latest ${scores[lastIdx]}, best ${scores[bestIdx]}. Target ${targetLow} to ${targetHigh}.`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.gold} stopOpacity="0.16" />
            <stop offset="100%" stopColor={CHART.gold} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Target band */}
        <rect
          x={pad.left}
          y={yFor(targetHigh)}
          width={plotW}
          height={yFor(targetLow) - yFor(targetHigh)}
          fill={CHART.turf}
          opacity="0.1"
        />
        <line
          x1={pad.left}
          x2={pad.left + plotW}
          y1={yFor(targetHigh)}
          y2={yFor(targetHigh)}
          stroke={CHART.turf}
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        <line
          x1={pad.left}
          x2={pad.left + plotW}
          y1={yFor(targetLow)}
          y2={yFor(targetLow)}
          stroke={CHART.turf}
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        <text
          x={pad.left + 4}
          y={yFor(targetHigh) - 4}
          textAnchor="start"
          fontSize="9"
          fill={CHART.inkMuted}
        >
          Target {targetLow}–{targetHigh}
        </text>

        {/* Gridlines + y ticks */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={pad.left + plotW} y1={yFor(t)} y2={yFor(t)} stroke={CHART.grid} strokeWidth="1" />
            <text x={pad.left - 6} y={yFor(t) + 3} textAnchor="end" fontSize="9" fill={CHART.inkFaint}>
              {t}
            </text>
          </g>
        ))}

        {/* Area wash + line */}
        {points.length > 1 ? (
          <>
            <path
              d={`${path} L${points[lastIdx].x},${pad.top + plotH} L${points[0].x},${pad.top + plotH} Z`}
              fill={`url(#${gradientId})`}
            />
            <path d={path} fill="none" stroke={CHART.gold} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          </>
        ) : null}

        {/* Dots with surface ring */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === lastIdx || i === active ? 5 : 4}
            fill={i === bestIdx ? CHART.turf : CHART.gold}
            stroke={CHART.surface}
            strokeWidth="2"
          />
        ))}

        {/* Selective direct labels: latest + best */}
        <text x={points[lastIdx].x} y={points[lastIdx].y - 9} textAnchor="middle" fontSize="10" fontWeight="600" fill={CHART.ink}>
          {scores[lastIdx]}
        </text>
        {bestIdx !== lastIdx ? (
          <text x={points[bestIdx].x} y={points[bestIdx].y - 9} textAnchor="middle" fontSize="10" fill={CHART.inkMuted}>
            {scores[bestIdx]}
          </text>
        ) : null}

        {/* Hover / tap hit targets */}
        {points.map((p, i) => (
          <circle
            key={`hit-${i}`}
            cx={p.x}
            cy={p.y}
            r={14}
            fill="transparent"
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onClick={() => setActive(active === i ? null : i)}
          />
        ))}
      </svg>

      {activePoint ? (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-white/10 bg-[#0c120e] px-2.5 py-1.5 text-center shadow-soft"
          style={{
            left: `${(activePoint.x / width) * 100}%`,
            top: `${(activePoint.y / height) * 100}%`,
            transform: "translate(-50%, -130%)"
          }}
        >
          <p className="text-sm font-semibold leading-none text-text">{activePoint.score}</p>
          <p className="mt-1 text-[10px] leading-none text-muted">{activePoint.date}</p>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* SkillRadar — you vs. field average across 8 skills               */
/* ---------------------------------------------------------------- */

export function SkillRadar({
  you,
  field,
  youLabel = "You",
  fieldLabel = "Field avg"
}: {
  you: Record<SkillCategory, number>;
  field: Record<SkillCategory, number>;
  youLabel?: string;
  fieldLabel?: string;
}) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2 + 4;
  const radius = 96;
  const n = SKILL_CATEGORIES.length;

  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pointFor = (i: number, v: number) => {
    const r = (Math.max(0, Math.min(100, v)) / 100) * radius;
    return [cx + r * Math.cos(angleFor(i)), cy + r * Math.sin(angleFor(i))] as const;
  };
  const polygon = (values: Record<SkillCategory, number>) =>
    SKILL_CATEGORIES.map((c, i) => pointFor(i, values[c]).map((v) => v.toFixed(1)).join(",")).join(" ");

  const shortLabels: Record<SkillCategory, string> = {
    driving: "Driving",
    approach: "Approach",
    wedges: "Wedges",
    putting: "Putting",
    shortGame: "Short game",
    courseManagement: "Course mgmt",
    mentalGame: "Mental",
    fitnessDurability: "Fitness"
  };

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${size} ${size - 24}`}
        className="w-full"
        role="img"
        aria-label={`Skill radar comparing ${youLabel} against ${fieldLabel} across ${n} categories.`}
      >
        {/* Rings */}
        {[25, 50, 75, 100].map((ring) => (
          <polygon
            key={ring}
            points={SKILL_CATEGORIES.map((_, i) => pointFor(i, ring).map((v) => v.toFixed(1)).join(",")).join(" ")}
            fill="none"
            stroke={CHART.grid}
            strokeWidth="1"
          />
        ))}
        {/* Spokes */}
        {SKILL_CATEGORIES.map((c, i) => {
          const [x, y] = pointFor(i, 100);
          return <line key={c} x1={cx} y1={cy} x2={x} y2={y} stroke={CHART.grid} strokeWidth="1" />;
        })}

        {/* Field average — neutral reference series */}
        <polygon points={polygon(field)} fill={CHART.reference} fillOpacity="0.10" stroke={CHART.reference} strokeWidth="2" strokeLinejoin="round" />
        {/* You — the story series */}
        <polygon points={polygon(you)} fill={CHART.gold} fillOpacity="0.16" stroke={CHART.gold} strokeWidth="2" strokeLinejoin="round" />
        {SKILL_CATEGORIES.map((c, i) => {
          const [x, y] = pointFor(i, you[c]);
          return <circle key={c} cx={x} cy={y} r="3.5" fill={CHART.gold} stroke={CHART.surface} strokeWidth="2" />;
        })}

        {/* Axis labels */}
        {SKILL_CATEGORIES.map((c, i) => {
          const [x, y] = pointFor(i, 126);
          const cos = Math.cos(angleFor(i));
          const anchor = Math.abs(cos) < 0.35 ? "middle" : cos > 0 ? "start" : "end";
          return (
            <text key={c} x={x} y={y + 3} textAnchor={anchor} fontSize="10" fill={CHART.inkMuted}>
              {shortLabels[c]}
            </text>
          );
        })}
      </svg>
      <figcaption className="mt-1 flex items-center justify-center gap-4 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: CHART.gold }} />
          {youLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: CHART.reference }} />
          {fieldLabel}
        </span>
      </figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------------- */
/* HabitHeatmap — last 8 weeks of mobility + practice habits        */
/* ---------------------------------------------------------------- */

export function HabitHeatmap({
  history,
  weeks = 8
}: {
  history: Record<string, { mobility: boolean; practice: boolean }>;
  weeks?: number;
}) {
  const { grid, monthMarks } = useMemo(() => {
    const cell = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${d}`;
      const entry = history[key];
      const count = entry ? Number(entry.mobility) + Number(entry.practice) : 0;
      return { key, count, label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) };
    };
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay()));
    const columns: { key: string; count: number; label: string }[][] = [];
    const marks: (string | null)[] = [];
    for (let w = weeks - 1; w >= 0; w--) {
      const col: { key: string; count: number; label: string }[] = [];
      let firstOfMonth: string | null = null;
      for (let d = 0; d < 7; d++) {
        const date = new Date(end);
        date.setDate(end.getDate() - w * 7 - (6 - d));
        if (date.getDate() === 1) {
          firstOfMonth = date.toLocaleDateString(undefined, { month: "short" });
        }
        col.push(cell(date));
      }
      columns.push(col);
      marks.push(firstOfMonth);
    }
    return { grid: columns, monthMarks: marks };
  }, [history, weeks]);

  /* Ordinal single-hue ramp: 0 → well, 1 → mid turf, 2 → full turf */
  const fills = ["rgba(242, 245, 240, 0.06)", "rgba(79, 168, 107, 0.42)", "#4FA86B"];
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  return (
    <div>
      <div className="flex justify-between gap-1">
        {grid.map((col, i) => (
          <div key={i} className="flex flex-1 flex-col items-stretch gap-1">
            <span className="h-3 text-center text-[9px] leading-3 text-faint">{monthMarks[i] ?? ""}</span>
            {col.map((day) => (
              <div
                key={day.key}
                title={`${day.label}: ${day.count}/2 habits`}
                className="aspect-square w-full rounded-[5px]"
                style={{
                  background: fills[day.count],
                  boxShadow: day.key === todayKey ? "inset 0 0 0 1.5px rgba(226, 193, 120, 0.8)" : undefined
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-faint">
        <span>{weeks} weeks · mobility + practice</span>
        <span className="inline-flex items-center gap-1">
          0
          {fills.map((f, i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-[3px]" style={{ background: f }} />
          ))}
          2 habits
        </span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* TargetMeter — average stat vs. tournament target                 */
/* ---------------------------------------------------------------- */

export function TargetMeter({
  label,
  value,
  target,
  max,
  lowerIsBetter = false,
  format = (v: number) => v.toFixed(1),
  caption
}: {
  label: string;
  value: number;
  target: number;
  max: number;
  lowerIsBetter?: boolean;
  format?: (v: number) => string;
  caption?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const targetPct = Math.max(0, Math.min(100, (target / max) * 100));
  const onTarget = lowerIsBetter ? value <= target : value >= target;
  const fill = onTarget ? CHART.turf : CHART.gold;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs text-muted">{label}</span>
        <span className="text-sm font-semibold text-text">
          {format(value)}
          <span className="ml-1.5 text-[10px] font-medium text-faint">
            target {lowerIsBetter ? "≤" : "≥"} {format(target)}
          </span>
        </span>
      </div>
      <div className="relative h-2 rounded-full" style={{ background: "rgba(242, 245, 240, 0.09)" }}>
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: fill }}
        />
        <div
          className="absolute -top-[3px] h-[14px] w-[2px] rounded-full"
          style={{ left: `calc(${targetPct}% - 1px)`, background: "rgba(242, 245, 240, 0.55)" }}
          title={`Target ${format(target)}`}
        />
      </div>
      {caption ? <p className="mt-1 text-right text-[9px] text-faint">{caption}</p> : null}
    </div>
  );
}
