// ─────────────────────────────────────────────────────────────
// engine/scoringEngine.ts
// The core recommendation engine. Merges local Spirit Books
// with Jikan API results, applies maturity filtering, computes
// taste-match and faith-alignment scores, and produces the
// final ranked recommendation feed.
// ─────────────────────────────────────────────────────────────

import {
  SPIRIT_BOOKS,
  filterByMaturity as filterSpiritByMaturity,
  type SpiritBook,
} from "../db/spiritBooks";
import {
  searchJikan,
  fetchTopEntries,
  mapMaturity,
  type NormalizedEntry,
} from "../api/jikan";
import {
  auditWithClaude,
  batchAudit,
  type WorldviewAudit,
} from "./claudeAudit";

// ─────── Types ───────

export interface UserSettings {
  discernment: number;  // 0–10 (internal scale)
  maturity: number;     // 0=All Ages, 1=Teen, 2=Young Adult, 3=Mature
}

export interface UserTasteProfile {
  favoriteGenres: string[];   // e.g. ["Fantasy", "Drama", "Sci-Fi"]
  favoriteTags: string[];     // e.g. ["Redemption", "Found Family"]
  dislikedGenres: string[];   // e.g. ["Harem", "Ecchi"]
}

export interface ScoredRecommendation {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  type: string;
  synopsis: string;
  genres: string[];
  tags: string[];
  year: number;
  cover_url: string;
  episodes?: number;
  volumes?: number;
  pages?: number;
  source: "spirit-books" | "jikan";
  mal_score: number;

  // ── Scoring breakdown ──
  matchScore: number;           // 0–100, the final displayed score
  tasteMatch: number;           // 0–100
  faithScore: number;           // 0–10
  logicChips: string[];         // 3–4 reasons for the match
  audit?: WorldviewAudit;       // full audit if Claude was used

  // ── Filter metadata ──
  maturity_level: number;
}

// ─────── Taste Matching ───────

/**
 * Computes a 0–100 taste match based on genre/tag overlap
 * between the user's profile and the entry.
 */
function computeTasteMatch(
  entryGenres: string[],
  entryTags: string[],
  profile: UserTasteProfile
): number {
  const entrySet = new Set(
    [...entryGenres, ...entryTags].map((s) => s.toLowerCase())
  );

  // Positive: how many of the user's favorites appear?
  const favoriteHits = [
    ...profile.favoriteGenres,
    ...profile.favoriteTags,
  ].filter((f) => entrySet.has(f.toLowerCase()));

  const totalFavorites = profile.favoriteGenres.length + profile.favoriteTags.length;
  const positiveScore = totalFavorites > 0
    ? (favoriteHits.length / totalFavorites) * 100
    : 50; // neutral if no profile set

  // Negative: penalize disliked genres
  const dislikeHits = profile.dislikedGenres.filter((d) =>
    entrySet.has(d.toLowerCase())
  );
  const penalty = dislikeHits.length * 20; // -20 per disliked genre

  return Math.max(0, Math.min(100, positiveScore - penalty));
}

// ─────── Logic Chip Generation ───────

/**
 * Generates 3–4 human-readable "logic chips" that explain
 * *why* this entry was recommended.
 */
function generateLogicChips(
  tasteMatch: number,
  faithScore: number,
  audit: WorldviewAudit | undefined,
  entryTags: string[],
  profile: UserTasteProfile,
  discernment: number
): string[] {
  const chips: string[] = [];

  // Taste-based chips
  const matchedFavorites = [
    ...profile.favoriteGenres,
    ...profile.favoriteTags,
  ].filter((f) =>
    entryTags.some((t) => t.toLowerCase() === f.toLowerCase())
  );
  if (matchedFavorites.length > 0) {
    chips.push(matchedFavorites[0]); // e.g. "Fantasy"
    if (matchedFavorites.length > 1) {
      chips.push(matchedFavorites[1]); // e.g. "Redemption"
    }
  }

  // Faith-based chips (only if discernment > 0)
  if (discernment > 0 && audit) {
    if (audit.redemptive_archetypes.length > 0) {
      chips.push(audit.redemptive_archetypes[0]); // e.g. "Sacrificial Love"
    }
    if (faithScore >= 7) {
      chips.push("High Faith Alignment");
    }
  }

  // Quality chip
  if (tasteMatch >= 85) chips.push("Strong Taste Match");

  // Ensure 3–4 chips
  const fallbackChips = [
    "Highly Rated",
    "Well-Crafted Narrative",
    "Rich World-Building",
    "Compelling Characters",
    "Emotional Depth",
  ];
  let i = 0;
  while (chips.length < 3 && i < fallbackChips.length) {
    if (!chips.includes(fallbackChips[i])) {
      chips.push(fallbackChips[i]);
    }
    i++;
  }

  return chips.slice(0, 4);
}

// ─────── Maturity Filter ───────

function filterByMaturity<T extends { maturity_level: number }>(
  entries: T[],
  maxLevel: number
): T[] {
  return entries.filter((e) => e.maturity_level <= maxLevel);
}

// ─────── Spirit Book → Unified Shape ───────

function spiritBookToUnified(book: SpiritBook): ScoredRecommendation {
  const maturityMap = {
    "all-ages": 0,
    teen: 1,
    "young-adult": 2,
    mature: 3,
  } as const;

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    type: book.type,
    synopsis: book.synopsis,
    genres: book.genres,
    tags: book.tags,
    year: book.year,
    cover_url: book.cover_url || "",
    pages: book.pages,
    volumes: book.volumes,
    source: "spirit-books",
    mal_score: book.faith_score, // use faith_score as quality proxy
    matchScore: 0,   // computed later
    tasteMatch: 0,
    faithScore: book.faith_score,
    logicChips: [],
    maturity_level: maturityMap[book.maturity_rating],
  };
}

// ─────── Jikan → Unified Shape ───────

function jikanToUnified(entry: NormalizedEntry): ScoredRecommendation {
  return {
    id: entry.id,
    title: entry.title,
    subtitle: entry.subtitle,
    author: entry.author,
    type: entry.type,
    synopsis: entry.synopsis,
    genres: entry.genres,
    tags: entry.tags,
    year: entry.year,
    cover_url: entry.cover_url,
    episodes: entry.episodes,
    volumes: entry.volumes,
    source: "jikan",
    mal_score: entry.score,
    matchScore: 0,
    tasteMatch: 0,
    faithScore: 5, // neutral default, updated by Claude audit
    logicChips: [],
    maturity_level: entry.maturity_level,
  };
}

// ─────── Main Scoring Formula ───────

/**
 * THE CORE SCORING LOGIC
 *
 * If Discernment = 0:
 *   matchScore = tasteMatch (pure genre/trope similarity)
 *
 * If Discernment > 0:
 *   matchScore = (tasteMatch × 0.5) + (claudeWorldviewAudit × 0.5)
 *   where claudeWorldviewAudit is faith_score mapped to 0–100
 *
 * The discernment level (0–10) also controls how strictly
 * the Claude audit evaluates content.
 */
function computeFinalScore(
  tasteMatch: number,
  faithScore: number,
  discernment: number
): number {
  if (discernment === 0) {
    return Math.round(tasteMatch);
  }

  // Map faith_score (0–10) to 0–100
  const faithComponent = (faithScore / 10) * 100;

  // Blend: 50/50 taste vs faith
  const raw = tasteMatch * 0.5 + faithComponent * 0.5;

  return Math.round(Math.max(0, Math.min(100, raw)));
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

export interface RecommendationRequest {
  query: string;
  settings: UserSettings;
  profile: UserTasteProfile;
  claudeApiKey?: string;     // optional — falls back to heuristic
  jikanType?: "anime" | "manga";
  limit?: number;
}

export interface RecommendationResponse {
  results: ScoredRecommendation[];
  meta: {
    spiritBookCount: number;
    jikanCount: number;
    filteredOut: number;
    claudeAudited: boolean;
  };
}

/**
 * The main entry point. Fetches from both sources, merges,
 * filters, scores, and returns a ranked list.
 */
export async function getRecommendations(
  request: RecommendationRequest
): Promise<RecommendationResponse> {
  const {
    query,
    settings,
    profile,
    claudeApiKey,
    jikanType = "anime",
    limit = 20,
  } = request;

  // ── 1. Fetch from both sources in parallel ──

  const [jikanResults, spiritResults] = await Promise.all([
    query
      ? searchJikan({ query, type: jikanType, limit: Math.min(limit, 25) })
      : fetchTopEntries(jikanType, Math.min(limit, 25)),
    Promise.resolve(
      query
        ? SPIRIT_BOOKS.filter(
            (b) =>
              b.title.toLowerCase().includes(query.toLowerCase()) ||
              b.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
              b.genres.some((g) => g.toLowerCase().includes(query.toLowerCase()))
          )
        : SPIRIT_BOOKS
    ),
  ]);

  // ── 2. Normalize to unified shape ──

  let unified: ScoredRecommendation[] = [
    ...spiritResults.map(spiritBookToUnified),
    ...jikanResults.map(jikanToUnified),
  ];

  // Deduplicate by title (prefer spirit-books version)
  const seen = new Map<string, boolean>();
  unified = unified.filter((entry) => {
    const key = entry.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seen.has(key)) return false;
    seen.set(key, true);
    return true;
  });

  const totalBeforeFilter = unified.length;

  // ── 3. Apply Maturity Guard (strict filter) ──

  unified = filterByMaturity(unified, settings.maturity);

  const filteredOut = totalBeforeFilter - unified.length;

  // ── 4. Compute taste match for all entries ──

  unified.forEach((entry) => {
    entry.tasteMatch = computeTasteMatch(entry.genres, entry.tags, profile);
  });

  // ── 5. Claude Worldview Audit (if discernment > 0) ──

  let claudeAudited = false;

  if (settings.discernment > 0) {
    // Only audit Jikan entries (Spirit Books already have faith_score)
    const jikanEntries = unified.filter((e) => e.source === "jikan");

    if (claudeApiKey && jikanEntries.length > 0) {
      try {
        const audits = await batchAudit(
          claudeApiKey,
          jikanEntries.map((e) => ({
            id: e.id,
            title: e.title,
            synopsis: e.synopsis,
            genres: e.genres,
          })),
          settings.discernment,
          600 // delay between API calls
        );

        // Apply audit results
        jikanEntries.forEach((entry) => {
          const audit = audits.get(entry.id);
          if (audit) {
            entry.faithScore = audit.faith_score;
            entry.audit = audit;
          }
        });

        claudeAudited = true;
      } catch (err) {
        console.error("Batch Claude audit failed, using heuristic:", err);
      }
    }
  }

  // ── 6. Compute final match scores ──

  unified.forEach((entry) => {
    entry.matchScore = computeFinalScore(
      entry.tasteMatch,
      entry.faithScore,
      settings.discernment
    );
  });

  // ── 7. Generate logic chips ──

  unified.forEach((entry) => {
    entry.logicChips = generateLogicChips(
      entry.tasteMatch,
      entry.faithScore,
      entry.audit,
      entry.tags,
      profile,
      settings.discernment
    );
  });

  // ── 8. Sort by matchScore descending ──

  unified.sort((a, b) => b.matchScore - a.matchScore);

  // ── 9. Trim to limit ──

  const results = unified.slice(0, limit);

  return {
    results,
    meta: {
      spiritBookCount: spiritResults.length,
      jikanCount: jikanResults.length,
      filteredOut,
      claudeAudited,
    },
  };
}

// ─────── Utility: Map slider positions to internal values ───────

/**
 * Maps the 4-stop UI slider (0–3) to internal discernment (0–10).
 *   Slider 0 ("Low")    → 0
 *   Slider 1 ("Medium") → 4
 *   Slider 2 ("High")   → 7
 *   Slider 3 ("Devout")  → 10
 */
export function sliderToDiscernment(sliderValue: number): number {
  const map: Record<number, number> = { 0: 0, 1: 4, 2: 7, 3: 10 };
  return map[sliderValue] ?? 0;
}

/**
 * Maps the 4-stop UI maturity slider (0–3) directly.
 * No conversion needed — it's already 0–3.
 */
export function sliderToMaturity(sliderValue: number): number {
  return Math.max(0, Math.min(3, sliderValue));
}
