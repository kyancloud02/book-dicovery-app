// ─────────────────────────────────────────────────────────────
// engine/claudeAudit.ts
// Uses the Anthropic Claude API to perform a "Worldview Audit"
// on anime/manga synopses, scoring them for faith alignment.
// ─────────────────────────────────────────────────────────────

export interface WorldviewAudit {
  faith_score: number;           // 0–10
  redemptive_archetypes: string[]; // detected positive patterns
  concerns: string[];            // detected negative patterns
  reasoning: string;             // brief explanation
}

// ─────── Prompt Template ───────

function buildAuditPrompt(
  title: string,
  synopsis: string,
  genres: string[],
  discernment: number // 0–10
): string {
  // Scale the strictness of evaluation with discernment level
  const strictnessLabel =
    discernment <= 3
      ? "lenient"
      : discernment <= 6
        ? "moderate"
        : "strict";

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

// ─────── API Call ───────

/**
 * Calls the Claude API to audit a synopsis.
 *
 * @param apiKey - Your Anthropic API key. In production, this should
 *   come from an environment variable or backend proxy, NEVER from
 *   the client bundle. For a Vite app, use a serverless function
 *   (Supabase Edge Function, Vercel API route, etc.) as a proxy.
 *
 * @param title - The title of the work
 * @param synopsis - The synopsis text to analyze
 * @param genres - Genre list for context
 * @param discernment - 0–10 discernment level
 */
export async function auditWithClaude(
  apiKey: string,
  title: string,
  synopsis: string,
  genres: string[],
  discernment: number
): Promise<WorldviewAudit> {
  // Skip audit for empty/missing synopses
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
      ?.map((block: any) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    if (!text) return fallbackAudit(genres);

    // Strip markdown fences if present
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

// ─────── Heuristic Fallback ───────

/**
 * When the Claude API is unavailable, use a simple genre-based
 * heuristic so the app degrades gracefully.
 */
function fallbackAudit(genres: string[]): WorldviewAudit {
  const genreSet = new Set(genres.map((g) => g.toLowerCase()));

  let score = 5.0; // neutral baseline
  const positives: string[] = [];
  const negatives: string[] = [];

  // Positive genre signals
  if (genreSet.has("slice of life")) { score += 1.0; positives.push("Everyday virtue"); }
  if (genreSet.has("adventure"))     { score += 0.5; positives.push("Heroic journey"); }
  if (genreSet.has("drama"))         { score += 0.5; positives.push("Moral weight"); }
  if (genreSet.has("sports"))        { score += 0.5; positives.push("Perseverance"); }

  // Negative genre signals
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

// ─────── Batch Audit with Caching ───────

const auditCache = new Map<string, WorldviewAudit>();

/**
 * Audit multiple entries with caching and rate limiting.
 * Claude's API has rate limits, so we process sequentially
 * with a delay between calls.
 */
export async function batchAudit(
  apiKey: string,
  entries: Array<{ id: string; title: string; synopsis: string; genres: string[] }>,
  discernment: number,
  delayMs = 500
): Promise<Map<string, WorldviewAudit>> {
  const results = new Map<string, WorldviewAudit>();

  for (const entry of entries) {
    // Check cache first
    const cacheKey = `${entry.id}-d${discernment}`;
    if (auditCache.has(cacheKey)) {
      results.set(entry.id, auditCache.get(cacheKey)!);
      continue;
    }

    const audit = await auditWithClaude(
      apiKey,
      entry.title,
      entry.synopsis,
      entry.genres,
      discernment
    );

    auditCache.set(cacheKey, audit);
    results.set(entry.id, audit);

    // Rate limit delay between calls
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  return results;
}
