"use client";

import { useMemo } from "react";
import Image from "next/image";
import { ChevronDown, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USER } from "@/lib/constants";
import {
  FIELD_PLAYERS,
  SKILL_CATEGORIES,
  SKILL_LABELS,
  STRAND_BRAND_ASSETS,
  type PlayerProfile,
  type SkillCategory,
} from "@/lib/field-data";

function HandicapBadge({ handicap, label }: { handicap: number; label?: string }) {
  return (
    <Badge variant="gold" className="shrink-0 px-3 py-1 text-sm font-semibold">
      HCP {label ?? handicap.toFixed(1)}
    </Badge>
  );
}

function SkillBars({
  skills,
  compact = false,
}: {
  skills: Record<SkillCategory, number>;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      {SKILL_CATEGORIES.map((category) => (
        <div key={category}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{SKILL_LABELS[category]}</span>
            <span className="font-medium">{skills[category]}</span>
          </div>
          <div className="h-1.5 rounded-full bg-background/60">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-accent-gold to-accent-green transition-all duration-300"
              style={{ width: `${Math.max(3, Math.min(100, skills[category]))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function topSkillLabels(skills: Record<SkillCategory, number>) {
  return [...SKILL_CATEGORIES]
    .sort((a, b) => skills[b] - skills[a])
    .slice(0, 2)
    .map((category) => SKILL_LABELS[category]);
}

function formatDelta(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function PlayerProfileCard({ player, index }: { player: PlayerProfile; index: number }) {
  return (
    <details
      className="field-card-enter group rounded-2xl border border-border bg-card p-4 shadow-sm [&_summary::-webkit-details-marker]:hidden"
      style={{ animationDelay: `${(index + 1) * 45}ms` }}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">
            {player.name}{" "}
            <span className="text-accent-gold">({player.nickname})</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            {player.handedness === "Unknown"
              ? "Handedness not listed"
              : `${player.handedness}-handed`}{" "}
            · {player.playingStyle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <HandicapBadge handicap={player.handicap} label={player.handicapLabel} />
          <ChevronDown
            size={16}
            className="text-muted-foreground transition group-open:rotate-180 group-open:text-accent-gold"
          />
        </div>
      </summary>

      <div className="mt-3 space-y-3">
        <div className="rounded-xl border border-border bg-background/40 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Profile snapshot</p>
          <p className="mt-1 text-sm">{player.bio}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {player.location ? <span>Location: {player.location}</span> : null}
            {player.ghinClub ? <span>GHIN club: {player.ghinClub}</span> : null}
            {player.grintProfileUrl ? (
              <a
                href={player.grintProfileUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`TheGrint profile for ${player.name}`}
                className="rounded-full border border-accent-gold/45 px-2 py-0.5 text-accent-gold hover:bg-accent-gold/10"
              >
                TheGrint profile
              </a>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl border border-border bg-background/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Strengths</p>
            <ul className="mt-2 space-y-1 text-accent-green">
              {player.strengths.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-background/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Weaknesses</p>
            <ul className="mt-2 space-y-1 text-accent-gold">
              {player.weaknesses.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/40 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Skill profile</p>
          <div className="mt-2">
            <SkillBars skills={player.skills} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/40 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
          <p className="mt-1 text-sm">{player.notes}</p>
        </div>

        <div className="rounded-xl border border-accent-gold/30 bg-accent-gold/5 p-3">
          <p className="text-xs uppercase tracking-wide text-accent-gold">Matchup insight</p>
          <p className="mt-1 text-sm">{player.matchupInsight}</p>
        </div>
      </div>
    </details>
  );
}

export function FieldScreen() {
  const fieldByHandicap = useMemo(
    () => [...FIELD_PLAYERS].sort((a, b) => a.handicap - b.handicap),
    []
  );
  const youPlayer = useMemo(
    () => fieldByHandicap.find((player) => player.isYou) ?? fieldByHandicap[0],
    [fieldByHandicap]
  );
  const opponents = useMemo(
    () => fieldByHandicap.filter((player) => player.id !== youPlayer.id),
    [fieldByHandicap, youPlayer.id]
  );

  const fieldSkillAverages = useMemo(() => {
    const source = opponents.length > 0 ? opponents : fieldByHandicap;
    return SKILL_CATEGORIES.reduce<Record<SkillCategory, number>>((acc, category) => {
      acc[category] = Math.round(
        source.reduce((sum, player) => sum + player.skills[category], 0) / source.length
      );
      return acc;
    }, {} as Record<SkillCategory, number>);
  }, [fieldByHandicap, opponents]);

  const yourSkillEdges = useMemo(() => {
    return SKILL_CATEGORIES.map((category) => ({
      category,
      label: SKILL_LABELS[category],
      delta: Math.round(youPlayer.skills[category] - fieldSkillAverages[category]),
    })).sort((a, b) => b.delta - a.delta);
  }, [fieldSkillAverages, youPlayer.skills]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6 text-accent-gold" />
        <h1 className="text-3xl font-bold tracking-tight">Field</h1>
      </div>

      <Card
        className="field-hero-gradient overflow-hidden border-accent-gold/35"
        style={{
          backgroundImage: `linear-gradient(145deg, rgba(17, 24, 39, 0.9), rgba(15, 23, 42, 0.88)), url('${STRAND_BRAND_ASSETS.heroImageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <CardContent className="p-5">
          <Image
            src={STRAND_BRAND_ASSETS.logoUrl}
            alt="The Strand Invitational logo"
            width={160}
            height={36}
            className="h-8 w-auto opacity-90"
          />
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-accent-gold">
            Gamble Sands Field
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight">
            Know the group. Prepare the edge.
          </h2>
          <p className="mt-2 max-w-[34ch] text-sm text-muted-foreground">
            Sourced from the current public Strand roster and handicap feed snapshot.
          </p>
        </CardContent>
      </Card>

      <Card className="field-card-enter border-accent-gold/45">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-accent-gold">Featured player</p>
              <h3 className="mt-1 text-2xl font-semibold">
                {youPlayer.name}{" "}
                <span className="text-accent-gold">({youPlayer.nickname})</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                You ·{" "}
                {youPlayer.handedness === "Unknown"
                  ? "Handedness not listed"
                  : `${youPlayer.handedness}-handed`}
              </p>
            </div>
            <HandicapBadge handicap={youPlayer.handicap} label={youPlayer.handicapLabel} />
          </div>

          <div className="rounded-xl border border-border bg-background/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Current focus</p>
            <p className="mt-1 text-sm">{youPlayer.currentFocus}</p>
            <p className="mt-2 text-xs text-accent-gold">Goal handicap: {USER.goalHandicap}</p>
            <p className="mt-2 text-xs text-muted-foreground">{youPlayer.bio}</p>
          </div>

          <SkillBars skills={youPlayer.skills} compact />
        </CardContent>
      </Card>

      <Card className="field-card-enter">
        <CardHeader>
          <CardTitle className="text-base">Field comparison</CardTitle>
          <p className="text-sm text-muted-foreground">Simple scouting view. No leaderboard noise.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {[youPlayer, ...opponents].map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">
                  {player.name}{" "}
                  <span className="text-accent-gold">({player.nickname})</span>
                  {player.isYou ? <span className="text-accent-gold"> · You</span> : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  Top skills: {topSkillLabels(player.skills).join(" · ")}
                </p>
              </div>
              <HandicapBadge handicap={player.handicap} label={player.handicapLabel} />
            </div>
          ))}

          <div className="rounded-xl border border-border bg-background/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {USER.firstName} edge map
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {yourSkillEdges.slice(0, 2).map((edge) => (
                <li
                  key={edge.category}
                  className={edge.delta >= 0 ? "text-accent-green" : "text-destructive"}
                >
                  {formatDelta(edge.delta)} in {edge.label}
                </li>
              ))}
              {yourSkillEdges[yourSkillEdges.length - 1] ? (
                <li className="text-accent-gold">
                  Focus today: {yourSkillEdges[yourSkillEdges.length - 1].label} (
                  {formatDelta(yourSkillEdges[yourSkillEdges.length - 1].delta)} vs field)
                </li>
              ) : null}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Player profiles</h2>
          <p className="text-sm text-muted-foreground">
            Who you are playing with, and what to know.
          </p>
        </div>
        {opponents.map((player, idx) => (
          <PlayerProfileCard key={player.id} player={player} index={idx} />
        ))}
      </div>
    </div>
  );
}
