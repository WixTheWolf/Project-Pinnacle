"use client";

import clsx from "clsx";
import Image from "next/image";
import { ReactNode } from "react";

/** Stylized Gamble Sands dune + fairway SVG — crisp at any size, theme-aware. */
export function LinksHorizon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("w-full", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="skyWash" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2a3a" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#243528" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#16201a" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="duneGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E2C178" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#BA8A28" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="fairwayGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4FA86B" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#2F7C46" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect width="360" height="120" fill="url(#skyWash)" />
      {/* Distant ridge */}
      <path
        d="M0 78 C40 62 70 70 110 58 C150 46 180 52 220 44 C270 34 310 48 360 40 L360 120 L0 120 Z"
        fill="#1c2a20"
        opacity="0.85"
      />
      {/* Mid dunes */}
      <path
        d="M0 92 C50 78 90 88 140 76 C190 64 230 78 280 70 C320 64 340 72 360 68 L360 120 L0 120 Z"
        fill="url(#duneGold)"
      />
      {/* Fairway ribbon */}
      <path
        d="M118 120 C150 96 175 78 205 68 C235 58 255 62 280 58 C300 55 320 60 340 70 L330 120 Z"
        fill="url(#fairwayGreen)"
      />
      {/* Flagstick */}
      <line x1="268" y1="34" x2="268" y2="62" stroke="#E2C178" strokeWidth="1.5" />
      <path d="M268 34 L286 40 L268 46 Z" fill="#E2C178" />
      {/* Soft sun */}
      <circle cx="300" cy="28" r="10" fill="#E2C178" opacity="0.35" />
      <circle cx="300" cy="28" r="5" fill="#E2C178" opacity="0.7" />
    </svg>
  );
}

/** Compact pin mark for list rows / accents. */
export function PinMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx("h-5 w-5", className)} aria-hidden="true" fill="none">
      <circle cx="12" cy="20" r="1.5" fill="currentColor" opacity="0.5" />
      <line x1="12" y1="5" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 5 L20 9 L12 13 Z" fill="currentColor" />
    </svg>
  );
}

export function SceneFrame({
  src,
  alt,
  priority = false,
  children,
  className,
  aspect = "wide"
}: {
  src: string;
  alt: string;
  priority?: boolean;
  children?: ReactNode;
  className?: string;
  aspect?: "wide" | "tall";
}) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl border border-sand/25 shadow-soft",
        aspect === "wide" ? "aspect-[16/10]" : "aspect-[4/5]",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 448px) 100vw, 448px"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080d0a]/95 via-[#080d0a]/35 to-transparent"
      />
      {children ? <div className="absolute inset-x-0 bottom-0 p-4">{children}</div> : null}
    </div>
  );
}

export function CountdownHero({
  days,
  phase,
  tournamentName,
  course,
  dateLabel,
  teeTime,
  goalScore,
  progress
}: {
  days: number;
  phase: string;
  tournamentName: string;
  course: string;
  dateLabel: string;
  teeTime: string;
  goalScore: string;
  progress: number;
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(Math.max(progress, 0), 100) / 100) * circumference;

  return (
    <section className="countdown-hero relative overflow-hidden rounded-2xl border border-sand/30 shadow-soft">
      <Image
        src="/imagery/gamble-sands-hero.jpg"
        alt="Gamble Sands dunes and fairway at golden hour"
        fill
        priority
        sizes="(max-width: 448px) 100vw, 448px"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[#080d0a]/55 via-[#080d0a]/72 to-[#080d0a]/95"
      />
      <div aria-hidden="true" className="countdown-shimmer absolute inset-0" />

      <div className="relative z-10 flex flex-col items-center px-4 pb-5 pt-6 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sand">{tournamentName}</p>
        <h2 className="mt-2 font-display text-[28px] font-semibold leading-none tracking-tight text-text">
          {course}
        </h2>
        <p className="mt-2 text-xs text-muted">
          {dateLabel} · Tee {teeTime} · Goal {goalScore}
        </p>

        <div className="relative mt-5" style={{ width: 148, height: 148 }}>
          <svg width="148" height="148" viewBox="0 0 148 148" aria-hidden="true" className="countdown-ring">
            <circle
              cx="74"
              cy="74"
              r={radius}
              fill="none"
              stroke="rgba(242,245,240,0.12)"
              strokeWidth="8"
            />
            <circle
              cx="74"
              cy="74"
              r={radius}
              fill="none"
              stroke="#E2C178"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${filled} ${circumference - filled}`}
              transform="rotate(-90 74 74)"
              className="ring-animate"
              style={{ "--ring-circumference": `${circumference}` } as React.CSSProperties}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[42px] font-semibold leading-none tracking-tight text-sand">
              {days}
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-faint">
              days to tee
            </span>
          </div>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-sand/40 bg-black/35 px-3 py-1.5 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-sand animate-pulse" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sand">{phase}</span>
        </div>
      </div>
    </section>
  );
}

export function DawnCommandBanner({
  plan,
  minutes,
  intensityLabel,
  intensityTone,
  onStart
}: {
  plan: string;
  minutes: number;
  intensityLabel: string;
  intensityTone: "default" | "sand" | "green" | "danger";
  onStart: () => void;
}) {
  const toneClass =
    intensityTone === "green"
      ? "border-turf/50 bg-turf/15 text-turf"
      : intensityTone === "danger"
        ? "border-danger/50 bg-danger/15 text-danger"
        : intensityTone === "sand"
          ? "border-sand/50 bg-sand/15 text-sand"
          : "border-white/20 bg-white/10 text-muted";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-sand/25 shadow-soft">
      <div className="relative aspect-[16/9] w-full">
        <Image
          src="/imagery/dawn-fairway.jpg"
          alt="Dawn fairway leading to the pin"
          fill
          priority
          sizes="(max-width: 448px) 100vw, 448px"
          className="object-cover object-[50%_40%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#080d0a] via-[#080d0a]/55 to-[#080d0a]/25"
        />
        <LinksHorizon className="absolute inset-x-0 bottom-0 opacity-40 mix-blend-screen" />
      </div>
      <div className="relative -mt-16 space-y-3 px-4 pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sand">Daily Command</p>
        <h2 className="font-display text-2xl font-semibold leading-snug text-text">{plan}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted backdrop-blur-sm">
            {minutes} min
          </span>
          <span
            className={clsx(
              "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm",
              toneClass
            )}
          >
            {intensityLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-xl border border-sand/60 bg-sand/20 px-4 py-2.5 text-sm font-semibold text-sand transition hover:bg-sand/30"
        >
          Start Today&apos;s Plan
        </button>
      </div>
    </section>
  );
}
