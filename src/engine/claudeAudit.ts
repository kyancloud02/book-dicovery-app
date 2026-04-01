// ─────────────────────────────────────────────────────────────
// engine/claudeAudit.ts
// Worldview Bridge — Claude API integration.
//
// Production:  calls POST /api/worldview-audit (Vercel Edge
//              Function) so the API key stays server-side.
// Development: falls back to a direct API call when an explicit
//              apiKey is passed (e.g. from VITE_CLAUDE_API_KEY).
//
// Audit results are cached in localStorage ("bda-audit-cache")
// so audits survive page reloads and don't re-bill the API for
// titles that have already been evaluated at the same discernment
// level.
// ─────────────────────────────────────────────────────────────

export interface WorldviewAudit {
  faith_score: number;            // 0–10
  redemptive_archetypes: string[]; // detected positive patterns
  concerns: string[];             // detected negative patterns
  reasoning: string;              // brief explanation
}

// ═══ Persistent Audit Cache (localStorage) ═══════════════════
//
// Cache key format: `${entryId}-d${discernment}`
// Stored as a plain JSON object in localStorage under "bda-audit-cache".
// The cache is loaded once on module init and written after each
// new entry is resolved.

const AUDIT_CACHE_KEY = "bda-audit-cache";

function loadCache(): Map<string, WorldviewAudit> {
  try {
    const raw = localStorage.getItem(AUDIT_CACHE_KEY);
    if (!raw) return new Map();
    const obj = JSON.parse(raw) as Record<string, WorldviewAudit>;
    return new Map(Object.entries(obj));
  } catch {
    return new Map();
  }
}

function saveCache(cache: Map<string, WorldviewAudit>): void {
  try {
    // Keep the cache size bounded — evict oldest entries beyond 500
    let entries = [...cache.entries()];
    if (entries.length > 500) {
      entries = entries.slice(entries.length - 500);
    }
    localStorage.setItem(AUDIT_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // localStorage may be full or unavailable (private browsing)
  }
}

// Initialise from localStorage — persists across page reloads
const auditCache: Map<string, WorldviewAudit> = loadCache();

// ═══ Prompt Builder ══════════════════════════════════════════

function buildAuditPrompt(
  title: string,
  synopsis: string,
  genres: string[],
  discernment: number
): string {
  const strictnessLabel =
    discernment <= 3 ? "lenient" : discernment <= 6 ? "moderate" : "strict";

  return `You are a faith-aligned content analyst. Your task is to evaluate an anime/manga synopsis for spiritual and moral alignment using a Christian worldview.

EVALUATION STRICTNESS: ${strictnessLabel} (discernment level ${discernment}/10)

TITLE: ${title}
GENRES: ${genres.join(", ")}
SYNOPSIS:
${synopsis}

SCORING GUIDELINES (0–10 scale):

Positive signals (increase score):
- Redemptive arcs: characters who sacrifice for others, find forgiveness, or are transformed by love
- Moral consequence: actions have real weight; evil is not glamorized
- Heroic virtue: courage, self-sacrifice, honesty, loyalty, protecting the weak
- Hope and beauty: the story affirms that goodness exists and matters
- Found family, community, healing from trauma through connection
- Justice tempered by mercy

Negative signals (decrease score):
- Occult rituals, witchcraft, or demonic entities portrayed as *positive, desirable, or empowering*
  (Note: the mere *presence* of dark forces is NOT automatically negative — many great stories depict evil in order to defeat it. Only penalize when darkness is normalized or celebrated.)
- Nihilism: the story argues nothing matters, cruelty is inevitable, hope is naive
- Gratuitous sexuality or fan-service as a core appeal
- Moral relativism where genuinely evil acts are framed as acceptable

STRICTNESS ADJUSTMENT:
- At lenient (0–3): Only penalize for the most egregious content. Most action/fantasy is fine.
- At moderate (4–6): Apply balanced judgment. Occult-positive content loses points. Ambiguous moral framing is noted but not heavily penalized.
- At strict (7–10): Apply rigorous standards. Even ambiguous portrayals of occult themes lose points. Strongly reward explicitly redemptive narratives. Content must demonstrate clear moral framework.

RESPOND WITH ONLY valid JSON, no markdown fences, no preamble:
{
  "faith_score": <number 0-10, one decimal>,
  "redemptive_archetypes": [<list of 0-4 short phrases identifying positive patterns>],
  "concerns": [<list of 0-3 short phrases identifying negative patterns, empty array if none>],
  "reasoning": "<2-3 sentence explanation>"
}`;
}

// ═══ Heuristic Fallback ══════════════════════════════════════

function fallbackAudit(genres: string[]): WorldviewAudit {
  const genreSet = new Set(genres.map((g) => g.toLowerCase()));

  let score = 5.0;
  const positives: string[] = [];
  const negatives: string[] = [];

  if (genreSet.has("slice of life")) { score += 1.0; positives.push("Everyday virtue"); }
  if (genreSet.has("adventure"))     { score += 0.5; positives.push("Heroic journey"); }
  if (genreSet.has("drama"))         { score += 0.5; positives.push("Moral weight"); }
  if (genreSet.has("sports"))        { score += 0.5; positives.push("Perseverance"); }
  if (genreSet.has("ecchi"))         { score -= 2.0; negatives.push("Sexual fan-service"); }
  if (genreSet.has("harem"))         { score -= 1.0; negatives.push("Harem dynamics"); }
  if (genreSet.has("horror"))        { score -= 0.5; negatives.push("Dark themes"); }

  return {
    faith_score: Math.max(0, Math.min(10, score)),
    redemptive_archetypes: positives,
    concerns: negatives,
    reasoning: "Heuristic estimate based on genre tags (Claude API unavailable).",
  };
}

// ═══ Via Edge Function (Production) ══════════════════════════

/**
 * Calls the Vercel Edge Function at /api/worldview-audit.
 * The Edge Function proxies the request to Claude server-side so
 * the API key is never exposed in the browser bundle.
 */
async function auditViaEdge(
  title: string,
  synopsis: string,
  genres: string[],
  discernment: number,
  entryId: string
): Promise<WorldviewAudit> {
  const cacheKey = `${entryId}-d${discernment}`;
  const cached = auditCache.get(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch("/api/worldview-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, synopsis, genres, discernment, entryId }),
    });

    if (!res.ok) return fallbackAudit(genres);

    const audit = (await res.json()) as WorldviewAudit;
    auditCache.set(cacheKey, audit);
    saveCache(auditCache);
    return audit;
  } catch {
    return fallbackAudit(genres);
  }
}

// ═══ Direct API Call (Local Dev / Server-side) ════════════════

/**
 * Calls the Claude API directly using an explicit API key.
 * Prefer auditViaEdge() for browser contexts — this is intended
 * for server-side use or local development with VITE_CLAUDE_API_KEY.
 *
 * @param apiKey - Anthropic API key. NEVER ship this in a public bundle.
 */
export async function auditWithClaude(
  apiKey: string,
  title: string,
  synopsis: string,
  genres: string[],
  discernment: number
): Promise<WorldviewAudit> {
  if (!synopsis || synopsis === "No synopsis available.") {
    return {
      faith_score: 5.0,
      redemptive_archetypes: [],
      concerns: ["No synopsis available for analysis"],
      reasoning: "Unable to evaluate — no synopsis provided.",
    };
  }

  const prompt = buildAuditPrompt(title, synopsis, genres, discernment);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error(`Claude API error: ${response.status}`);
      return fallbackAudit(genres);
    }

    const data = await response.json();
    const text = data.content
      ?.map((block: { type: string; text: string }) =>
        block.type === "text" ? block.text : ""
      )
      .join("")
      .trim();

    if (!text) return fallbackAudit(genres);

    const clean = text.replace(/```json\s?|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      faith_score: Math.max(0, Math.min(10, Number(parsed.faith_score) || 5)),
      redemptive_archetypes: parsed.redemptive_archetypes || [],
      concerns: parsed.concerns || [],
      reasoning: parsed.reasoning || "",
    };
  } catch (err) {
    console.error("Claude audit failed:", err);
    return fallbackAudit(genres);
  }
}

// ═══ Batch Audit with Cache ═══════════════════════════════════

/**
 * Audit multiple entries using the Worldview Bridge.
 *
 * Resolution order for each entry:
 *   1. localStorage cache (instant, no API call)
 *   2. /api/worldview-audit Edge Function (production, apiKey optional)
 *   3. Direct Claude API call (if apiKey is provided)
 *   4. Heuristic fallback (if all else fails)
 *
 * Requests are processed sequentially with a configurable delay
 * to stay within Claude's rate limits.
 */
export async function batchAudit(
  apiKey: string | undefined,
  entries: Array<{ id: string; title: string; synopsis: string; genres: string[] }>,
  discernment: number,
  delayMs = 500
): Promise<Map<string, WorldviewAudit>> {
  const results = new Map<string, WorldviewAudit>();

  for (const entry of entries) {
    const cacheKey = `${entry.id}-d${discernment}`;

    // 1. Check in-memory / localStorage cache
    if (auditCache.has(cacheKey)) {
      results.set(entry.id, auditCache.get(cacheKey)!);
      continue;
    }

    let audit: WorldviewAudit;

    // 2. Try the Edge Function (works in browser without exposing the key)
    if (typeof window !== "undefined") {
      audit = await auditViaEdge(
        entry.title,
        entry.synopsis,
        entry.genres,
        discernment,
        entry.id
      );
    } else if (apiKey) {
      // 3. Direct API call (server-side / local dev)
      audit = await auditWithClaude(
        apiKey,
        entry.title,
        entry.synopsis,
        entry.genres,
        discernment
      );
    } else {
      // 4. Heuristic fallback
      audit = fallbackAudit(entry.genres);
    }

    auditCache.set(cacheKey, audit);
    saveCache(auditCache);
    results.set(entry.id, audit);

    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  return results;
}

// ═══ Cache Utilities (exported for diagnostics / settings UI) ══

/** Returns the number of entries currently cached. */
export function getAuditCacheSize(): number {
  return auditCache.size;
}

/** Clears the in-memory and localStorage audit cache. */
export function clearAuditCache(): void {
  auditCache.clear();
  try {
    localStorage.removeItem(AUDIT_CACHE_KEY);
  } catch {
    // ignore
  }
}
