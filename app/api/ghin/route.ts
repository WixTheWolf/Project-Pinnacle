import { NextResponse } from "next/server";
import type { GhinScore, GhinSyncResult } from "@/lib/ghin";

/*
  Server-side proxy for GHIN sync.

  GHIN exposes no public API; these are the JSON endpoints the official GHIN
  app and ghin.com use. The proxy exists because api2.ghin.com does not send
  CORS headers, so the browser cannot call it directly. Credentials pass
  through for a single login call and are never persisted or logged.
*/

const GHIN_API = "https://api2.ghin.com/api/v1";
const SOURCE = "GHINcom";

interface SyncRequestBody {
  email?: string;
  password?: string;
  ghinNumber?: string;
}

export async function POST(request: Request) {
  let body: SyncRequestBody;
  try {
    body = (await request.json()) as SyncRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password;
  const ghinNumber = body.ghinNumber?.replace(/\D/g, "");

  if (!email || !password) {
    return NextResponse.json({ error: "GHIN email and password are required." }, { status: 400 });
  }

  try {
    const loginResponse = await fetch(`${GHIN_API}/golfer_login.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "nonblank",
        user: { email_or_ghin: email, password, remember_me: false },
        source: SOURCE
      }),
      cache: "no-store"
    });

    if (loginResponse.status === 401 || loginResponse.status === 403) {
      return NextResponse.json({ error: "GHIN rejected the email or password." }, { status: 401 });
    }
    if (!loginResponse.ok) {
      return NextResponse.json(
        { error: `GHIN login failed (HTTP ${loginResponse.status}). GHIN may be down — try again later.` },
        { status: 502 }
      );
    }

    const loginData = (await loginResponse.json()) as Record<string, unknown>;
    const golferUser = (loginData.golfer_user ?? loginData) as Record<string, unknown>;
    const token =
      (golferUser.golfer_user_token as string | undefined) ??
      (loginData.token as string | undefined) ??
      ((loginData.user as Record<string, unknown> | undefined)?.token as string | undefined);

    if (!token) {
      return NextResponse.json(
        { error: "GHIN login succeeded but no session token was returned. The GHIN API may have changed." },
        { status: 502 }
      );
    }

    const golfers = (golferUser.golfers as Array<Record<string, unknown>> | undefined) ?? [];
    const golfer =
      golfers.find((g) => String(g.ghin_number ?? g.id ?? "") === ghinNumber) ?? golfers[0] ?? null;
    const resolvedGhin = ghinNumber || String(golfer?.ghin_number ?? golfer?.id ?? "");

    if (!resolvedGhin) {
      return NextResponse.json({ error: "Could not resolve a GHIN number for this account." }, { status: 502 });
    }

    const scoresResponse = await fetch(
      `${GHIN_API}/golfers/${resolvedGhin}/scores.json?source=${SOURCE}&per_page=100&page=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      }
    );

    if (!scoresResponse.ok) {
      return NextResponse.json(
        { error: `Logged in, but fetching scores failed (HTTP ${scoresResponse.status}).` },
        { status: 502 }
      );
    }

    const scoresData = (await scoresResponse.json()) as Record<string, unknown>;
    const rawScores =
      (scoresData.scores as Array<Record<string, unknown>> | undefined) ??
      (scoresData.Scores as Array<Record<string, unknown>> | undefined) ??
      [];

    const scores: GhinScore[] = rawScores
      .map((raw): GhinScore | null => {
        const gross = numberOrNull(raw.adjusted_gross_score ?? raw.gross_score ?? raw.score);
        const date = stringOrNull(raw.played_at ?? raw.date_played ?? raw.score_date);
        if (gross === null || !date) {
          return null;
        }
        const statistics = (raw.statistics ?? {}) as Record<string, unknown>;
        return {
          id: String(raw.id ?? `${date}-${gross}`),
          date: date.slice(0, 10),
          courseName: stringOrNull(raw.course_display_value ?? raw.course_name ?? raw.facility_name) ?? "Unknown course",
          teeName: stringOrNull(raw.tee_name ?? raw.tee_set_id) ?? "",
          score: gross,
          holes: numberOrNull(raw.number_of_holes) ?? 18,
          differential: numberOrNull(raw.differential ?? raw.adjusted_differential),
          usedInIndex: Boolean(raw.used ?? false),
          stats: {
            putts: numberOrNull(statistics.putts_total ?? statistics.putts),
            fairwaysHit: numberOrNull(statistics.fairways_hit ?? statistics.fairway_hits),
            gir: numberOrNull(statistics.gir_total ?? statistics.greens_in_regulation)
          }
        };
      })
      .filter((score): score is GhinScore => score !== null);

    const result: GhinSyncResult = {
      handicapIndex:
        stringOrNull(golfer?.handicap_index ?? golfer?.hi_value ?? golfer?.display_handicap_index) ?? null,
      lowHandicapIndex: stringOrNull(golfer?.low_hi ?? golfer?.low_hi_value) ?? null,
      golferName:
        stringOrNull(golfer?.player_name) ??
        ([stringOrNull(golfer?.first_name), stringOrNull(golfer?.last_name)].filter(Boolean).join(" ") || null),
      scores
    };

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Could not reach GHIN: ${message}` }, { status: 502 });
  }
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function stringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const str = String(value).trim();
  return str.length > 0 ? str : null;
}
