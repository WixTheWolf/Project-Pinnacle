"use client";

/*
  Miniature training diagrams for the Practice drill library.
  Decorative teaching aids — every diagram is paired with the drill's
  written instructions, so they are aria-hidden illustrations.
*/

const INK = "#9AA89D";
const FAINT = "#647065";
const GOLD = "#E2C178";
const GOLD_DEEP = "#BA8A28";
const TURF = "#4FA86B";
const TURF_DEEP = "#2F7C46";
const CLAY = "#D95F53";
const SURFACE = "#0C120E";

function Frame({ children, viewBox = "0 0 320 128" }: { children: React.ReactNode; viewBox?: string }) {
  return (
    <svg viewBox={viewBox} className="w-full" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

/* Driver — Fairway Finder: corridor with dispersion */
function DriverDiagram() {
  return (
    <Frame>
      {/* Rough */}
      <rect x="0" y="0" width="320" height="128" rx="10" fill={TURF_DEEP} opacity="0.12" />
      {/* Fairway corridor, tee at left */}
      <path d="M24 64 L120 34 L296 22 L296 106 L120 94 Z" fill={TURF} opacity="0.2" />
      <path d="M24 64 L120 34 L296 22 M24 64 L120 94 L296 106" stroke={TURF} strokeOpacity="0.45" strokeWidth="1.5" fill="none" />
      {/* Center target line */}
      <line x1="24" y1="64" x2="296" y2="64" stroke={INK} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 5" />
      {/* Tee */}
      <circle cx="24" cy="64" r="5" fill={GOLD} stroke={SURFACE} strokeWidth="2" />
      {/* Playable balls */}
      {[
        [172, 52],
        [206, 70],
        [238, 44],
        [256, 78],
        [282, 60]
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={TURF} stroke={SURFACE} strokeWidth="1.5" />
      ))}
      {/* Misses in the rough */}
      <circle cx="196" cy="16" r="4" fill={CLAY} stroke={SURFACE} strokeWidth="1.5" />
      <circle cx="228" cy="116" r="4" fill={CLAY} stroke={SURFACE} strokeWidth="1.5" />
      <text x="292" y="118" textAnchor="end" fontSize="9" fill={INK}>
        1 pt per playable ball
      </text>
      <text x="30" y="84" fontSize="9" fill={INK}>
        80–90% tempo
      </text>
    </Frame>
  );
}

/* Irons — Towel Low-Point: side view */
function IronsDiagram() {
  return (
    <Frame>
      {/* Ground */}
      <line x1="12" y1="96" x2="308" y2="96" stroke={INK} strokeOpacity="0.4" strokeWidth="1.5" />
      {/* Towel behind ball */}
      <rect x="118" y="88" width="44" height="8" rx="3" fill={GOLD_DEEP} opacity="0.85" />
      <text x="140" y="112" textAnchor="middle" fontSize="9" fill={INK}>
        towel
      </text>
      {/* Ball */}
      <circle cx="186" cy="90" r="6" fill="#F2F5F0" stroke={SURFACE} strokeWidth="1.5" />
      <text x="186" y="112" textAnchor="middle" fontSize="9" fill={INK}>
        ball
      </text>
      {/* Swing arc: low point after the ball */}
      <path d="M60 22 Q150 108 268 34" fill="none" stroke={TURF} strokeWidth="2" strokeLinecap="round" />
      {/* Low point marker ahead of ball */}
      <circle cx="204" cy="97" r="3" fill={TURF} stroke={SURFACE} strokeWidth="1.5" />
      <text x="212" y="122" textAnchor="middle" fontSize="9" fill={TURF}>
        low point ahead
      </text>
      {/* Direction arrow */}
      <path d="M244 52 L262 40 L256 56 Z" fill={TURF} />
      <text x="64" y="14" fontSize="9" fill={INK}>
        ball-first strike — miss the towel
      </text>
    </Frame>
  );
}

/* Irons — Start-Line Gate (used for gate-style drills) */
function GateDiagram() {
  return (
    <Frame>
      <rect x="0" y="0" width="320" height="128" rx="10" fill={TURF_DEEP} opacity="0.1" />
      {/* Ball */}
      <circle cx="36" cy="64" r="6" fill="#F2F5F0" stroke={SURFACE} strokeWidth="1.5" />
      {/* Start line */}
      <line x1="46" y1="64" x2="284" y2="64" stroke={INK} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 5" />
      {/* Gate sticks */}
      <rect x="128" y="30" width="4" height="26" rx="2" fill={GOLD} />
      <rect x="128" y="72" width="4" height="26" rx="2" fill={GOLD} />
      <text x="130" y="118" textAnchor="middle" fontSize="9" fill={INK}>
        gate at 10 yds
      </text>
      {/* Shot traces */}
      <path d="M42 64 Q130 58 282 44" fill="none" stroke={TURF} strokeWidth="2" strokeLinecap="round" />
      <path d="M42 64 Q130 64 284 64" fill="none" stroke={TURF} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M42 66 Q120 92 268 106" fill="none" stroke={CLAY} strokeWidth="2" strokeLinecap="round" opacity="0.8" strokeDasharray="4 4" />
      <text x="284" y="36" textAnchor="end" fontSize="9" fill={TURF}>
        started online
      </text>
      <text x="272" y="120" textAnchor="end" fontSize="9" fill={CLAY}>
        missed the gate
      </text>
    </Frame>
  );
}

/* Wedges — distance ladder arcs */
function WedgesDiagram() {
  return (
    <Frame viewBox="0 0 320 136">
      {/* Player at bottom center */}
      <circle cx="160" cy="124" r="5" fill={GOLD} stroke={SURFACE} strokeWidth="2" />
      {/* Distance arcs */}
      {[
        { r: 28, label: "50" },
        { r: 52, label: "70" },
        { r: 76, label: "90" },
        { r: 100, label: "110" }
      ].map(({ r, label }) => (
        <g key={label}>
          <path
            d={`M ${160 - r} 124 A ${r} ${r} 0 0 1 ${160 + r} 124`}
            fill="none"
            stroke={TURF}
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
          <text x={160 + r - 2} y="120" textAnchor="end" fontSize="9" fill={INK}>
            {label}
          </text>
        </g>
      ))}
      {/* Landing clusters */}
      {[
        [150, 98],
        [166, 96],
        [172, 74],
        [152, 72],
        [161, 49],
        [155, 26]
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill={GOLD_DEEP} stroke={SURFACE} strokeWidth="1.5" />
      ))}
      <text x="14" y="16" fontSize="9" fill={INK}>
        5 balls per distance · track proximity
      </text>
    </Frame>
  );
}

/* Putting — pressure circle around the hole */
function PuttingDiagram() {
  return (
    <Frame>
      <rect x="0" y="0" width="320" height="128" rx="10" fill={TURF_DEEP} opacity="0.12" />
      {/* Hole */}
      <circle cx="160" cy="64" r="7" fill={SURFACE} stroke={INK} strokeOpacity="0.6" strokeWidth="1.5" />
      {/* 3ft + 6ft rings */}
      <circle cx="160" cy="64" r="34" fill="none" stroke={TURF} strokeOpacity="0.5" strokeWidth="1.5" />
      <circle cx="160" cy="64" r="58" fill="none" stroke={INK} strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3 5" />
      <text x="160" y="24" textAnchor="middle" fontSize="9" fill={TURF}>
        3 ft — automatic zone
      </text>
      <text x="240" y="118" fontSize="9" fill={INK}>
        6 ft — scoring zone
      </text>
      {/* Balls stationed around the circle */}
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x = 160 + 34 * Math.cos(rad);
        const y = 64 + 34 * Math.sin(rad);
        return <circle key={deg} cx={x} cy={y} r="4" fill="#F2F5F0" stroke={SURFACE} strokeWidth="1.5" />;
      })}
      {/* Made-putt path */}
      <line x1="194" y1="64" x2="169" y2="64" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
    </Frame>
  );
}

/* Short game — up-and-down flight + roll */
function ShortGameDiagram() {
  return (
    <Frame>
      {/* Green */}
      <ellipse cx="228" cy="86" rx="82" ry="34" fill={TURF} opacity="0.18" />
      <ellipse cx="228" cy="86" rx="82" ry="34" fill="none" stroke={TURF} strokeOpacity="0.4" strokeWidth="1.5" />
      {/* Pin */}
      <line x1="252" y1="52" x2="252" y2="84" stroke={INK} strokeWidth="1.5" />
      <path d="M252 52 L266 58 L252 64 Z" fill={GOLD} />
      <circle cx="252" cy="86" r="3.5" fill={SURFACE} stroke={INK} strokeOpacity="0.6" strokeWidth="1.5" />
      {/* Ball in rough */}
      <circle cx="34" cy="104" r="5" fill="#F2F5F0" stroke={SURFACE} strokeWidth="1.5" />
      <text x="24" y="122" fontSize="9" fill={INK}>
        varied lies
      </text>
      {/* Flight arc */}
      <path d="M38 100 Q120 18 190 74" fill="none" stroke={GOLD_DEEP} strokeWidth="2" strokeLinecap="round" />
      {/* Landing + rollout dots */}
      <circle cx="190" cy="74" r="3.5" fill={GOLD_DEEP} stroke={SURFACE} strokeWidth="1.5" />
      {[204, 218, 232].map((x, i) => (
        <circle key={x} cx={x} cy={78 + i * 2} r="2" fill={GOLD_DEEP} opacity={0.7 - i * 0.18} />
      ))}
      <text x="150" y="30" fontSize="9" fill={INK}>
        land it, then release to the hole
      </text>
    </Frame>
  );
}

/* Bunker — splash behind the ball */
function BunkerDiagram() {
  return (
    <Frame>
      {/* Sand */}
      <path d="M16 96 Q100 76 160 92 T308 90 L308 124 L16 124 Z" fill={GOLD} opacity="0.16" />
      <path d="M16 96 Q100 76 160 92 T308 90" fill="none" stroke={GOLD} strokeOpacity="0.45" strokeWidth="1.5" />
      {/* Ball */}
      <circle cx="168" cy="86" r="6" fill="#F2F5F0" stroke={SURFACE} strokeWidth="1.5" />
      {/* Thump point behind the ball */}
      <circle cx="148" cy="93" r="3.5" fill={CLAY} stroke={SURFACE} strokeWidth="1.5" />
      <text x="118" y="114" fontSize="9" fill={CLAY}>
        thump 2&quot; behind
      </text>
      {/* Club path entering sand */}
      <path d="M84 24 Q126 62 150 92" fill="none" stroke={TURF} strokeWidth="2" strokeLinecap="round" />
      {/* Splash + ball flight */}
      <path d="M172 80 Q210 34 262 26" fill="none" stroke={GOLD_DEEP} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 6" />
      {[
        [182, 68],
        [192, 60],
        [178, 56]
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill={GOLD} opacity="0.7" />
      ))}
      <text x="236" y="16" fontSize="9" fill={INK}>
        open face · splash it out
      </text>
    </Frame>
  );
}

/* Custom — simple target focus */
function CustomDiagram() {
  return (
    <Frame>
      <circle cx="160" cy="64" r="44" fill="none" stroke={INK} strokeOpacity="0.25" strokeWidth="1.5" />
      <circle cx="160" cy="64" r="28" fill="none" stroke={GOLD} strokeOpacity="0.5" strokeWidth="1.5" />
      <circle cx="160" cy="64" r="12" fill={TURF} opacity="0.35" />
      <circle cx="160" cy="64" r="4" fill={TURF} stroke={SURFACE} strokeWidth="1.5" />
      <text x="160" y="122" textAnchor="middle" fontSize="9" fill={INK}>
        one issue · one measurable target
      </text>
    </Frame>
  );
}

const DIAGRAMS: Record<string, () => React.ReactElement> = {
  Driver: DriverDiagram,
  Irons: IronsDiagram,
  Wedges: WedgesDiagram,
  Putting: PuttingDiagram,
  "Short Game": ShortGameDiagram,
  Bunker: BunkerDiagram,
  "Custom Drill": CustomDiagram
};

/* Drill-specific overrides where the generic section visual is wrong */
const DRILL_OVERRIDES: Record<string, () => React.ReactElement> = {
  "Start-Line Gate": GateDiagram
};

export function DrillDiagram({ section, drillName }: { section: string; drillName?: string }) {
  const Diagram = (drillName && DRILL_OVERRIDES[drillName]) || DIAGRAMS[section];
  if (!Diagram) {
    return null;
  }
  return (
    <div className="well overflow-hidden rounded-xl p-2">
      <Diagram />
    </div>
  );
}
