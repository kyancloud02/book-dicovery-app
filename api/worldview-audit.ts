// ─────────────────────────────────────────────────────────────
// api/worldview-audit.ts
// Vercel Edge Function — Worldview Bridge proxy for Claude API.
//
// The ANTHROPIC_API_KEY lives server-side only; it is never
// shipped to the browser.  The frontend calls POST /api/worldview-audit
// with { title, synopsis, genres, discernment, entryId }.
// ─────────────────────────────────────────────────────────────

export const config = {
  runtime: "edge",
};

// ─────── Types ───────

interface AuditRequest {
  title: string;
  synopsis: string;
  genres: string[];
  discernment: number; // 0–10
  entryId?: string;
}

interface WorldviewAudit {
  faith_score: number;           // 0–10
  redemptive_archetypes: string[];
  concerns: string[];
  reasoning: string;
}

// ─────── Prompt Builder ───────

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
- Occult rituals, witchcraft, or demonic entities portrayed as positive, desirable, or empowering
  (Note: the mere presence of dark forces is NOT automatically negative — many great stories depict evil in order to defeat it. Only penalize when darkness is normalized or celebrated.)
- Nihilism: the story argues nothing matters, cruelty is inevitable, hope is naive
- Gratuitous sexuality or fan-service as a core appeal
- Moral relativism where genuinely evil acts are framed as acceptable

STRICTNESS ADJUSTMENT:
- At lenient (0–3): Only penalize for the most egregious content. Most action/fantasy is fine.
- At moderate (4–6): Apply balanced judgment. Occult-positive content loses points. Ambiguous moral framing is noted but not heavily penalized.
- At strict (7–10): Apply rigorous standards. Even ambiguous portrayals of occult themes lose points. Strongly reward explicitly redemptive narratives.

RESPOND WITH ONLY valid JSON, no markdown fences, no preamble:
{
  "faith_score": <number 0-10, one decimal>,
  "redemptive_archetypes": [<list of 0-4 short phrases identifying positive patterns>],
  "concerns": [<list of 0-3 short phrases identifying negative patterns, empty array if none>],
  "reasoning": "<2-3 sentence explanation>"
}`;
}

// ─────── Heuristic Fallback ───────

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

// ─────── Edge Function Handler ───────

export default async function handler(request: Request): Promise<Response> {
  // Handle CORS pre-flight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set");
    return new Response(
      JSON.stringify({
        error: "API key not configured",
        ...fallbackAudit([]),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  let body: AuditRequest;
  try {
    body = (await request.json()) as AuditRequest;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { title, synopsis, genres = [], discernment = 5 } = body;

  if (!synopsis || synopsis === "No synopsis available.") {
    const audit: WorldviewAudit = {
      faith_score: 5.0,
      redemptive_archetypes: [],
      concerns: ["No synopsis available for analysis"],
      reasoning: "Unable to evaluate — no synopsis provided.",
    };
    return new Response(JSON.stringify(audit), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const prompt = buildAuditPrompt(title, synopsis, genres, discernment);

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!upstream.ok) {
      console.error(`Anthropic API error: ${upstream.status}`);
      return new Response(JSON.stringify(fallbackAudit(genres)), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = (await upstream.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const text = data.content
      ?.map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    if (!text) {
      return new Response(JSON.stringify(fallbackAudit(genres)), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const clean = text.replace(/```json\s?|```/g, "").trim();
    const parsed = JSON.parse(clean) as Partial<WorldviewAudit>;

    const audit: WorldviewAudit = {
      faith_score: Math.max(0, Math.min(10, Number(parsed.faith_score) || 5)),
      redemptive_archetypes: parsed.redemptive_archetypes ?? [],
      concerns: parsed.concerns ?? [],
      reasoning: parsed.reasoning ?? "",
    };

    return new Response(JSON.stringify(audit), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    console.error("worldview-audit edge function error:", err);
    return new Response(JSON.stringify(fallbackAudit(genres)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
