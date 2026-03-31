// ─────────────────────────────────────────────────────────────
// api/jikan.ts
// Jikan API v4 integration — fetches anime/manga from MyAnimeList
// through the free Jikan REST API (https://docs.api.jikan.moe/)
// ─────────────────────────────────────────────────────────────

export interface JikanEntry {
  mal_id: number;
  title: string;
  title_japanese?: string;
  synopsis: string | null;
  score: number | null;
  type: string;           // "TV", "Movie", "OVA", "Manga", etc.
  episodes: number | null;
  volumes: number | null;
  status: string;
  rating: string | null;  // "G", "PG", "PG-13", "R - 17+", "R+", "Rx"
  year: number | null;
  genres: { mal_id: number; name: string }[];
  themes: { mal_id: number; name: string }[];
  demographics: { mal_id: number; name: string }[];
  images: {
    jpg: { image_url: string; large_image_url: string };
  };
  source: "jikan";
}

export interface NormalizedEntry {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  type: "anime" | "manga" | "light-novel" | "novel";
  synopsis: string;
  genres: string[];
  tags: string[];              // combined genres + themes + demographics
  rating_raw: string | null;   // original Jikan rating string
  maturity_level: number;      // 0–3 mapped from rating
  score: number;               // MAL score 0–10
  episodes?: number;
  volumes?: number;
  year: number;
  cover_url: string;
  source: "jikan";
  faith_score?: number;        // populated later by Claude audit
}

// ─────── Rate Limiter (Jikan allows ~3 req/sec) ───────

let lastRequest = 0;
const MIN_INTERVAL = 350; // ms between requests

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const wait = Math.max(0, MIN_INTERVAL - (now - lastRequest));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
  return fetch(url);
}

// ─────── Maturity Mapping ───────

/**
 * Maps Jikan's rating string to our 0–3 maturity scale.
 *   0 = All Ages   (G, PG, unrated)
 *   1 = Teen       (PG-13)
 *   2 = Young Adult (R - 17+)
 *   3 = Mature     (R+, Rx)
 */
export function mapMaturity(rating: string | null): number {
  if (!rating) return 0;
  const r = rating.toLowerCase();
  if (r.includes("rx") || r.includes("r+")) return 3;
  if (r.includes("r -") || r.includes("r-17") || r.includes("17+")) return 2;
  if (r.includes("pg-13") || r.includes("pg13")) return 1;
  return 0; // G, PG, or anything unrecognized
}

// ─────── Normalize ───────

function normalize(entry: any): NormalizedEntry {
  const allTags = [
    ...(entry.genres || []).map((g: any) => g.name),
    ...(entry.themes || []).map((t: any) => t.name),
    ...(entry.demographics || []).map((d: any) => d.name),
  ];

  const isLightNovel =
    entry.type === "Lightnovel" ||
    entry.type === "Light Novel" ||
    (entry.type === "Manga" &&
      allTags.some((t: string) => t.toLowerCase().includes("light novel")));

  let entryType: NormalizedEntry["type"] = "anime";
  if (isLightNovel) entryType = "light-novel";
  else if (entry.type === "Manga" || entry.type === "Novel") entryType = "manga";

  return {
    id: `jikan-${entry.mal_id}`,
    title: entry.title || "Unknown",
    subtitle: entry.title_japanese || undefined,
    author: "", // Jikan anime endpoint doesn't reliably provide this
    type: entryType,
    synopsis: entry.synopsis || "No synopsis available.",
    genres: (entry.genres || []).map((g: any) => g.name),
    tags: allTags,
    rating_raw: entry.rating || null,
    maturity_level: mapMaturity(entry.rating),
    score: entry.score || 0,
    episodes: entry.episodes || undefined,
    volumes: entry.volumes || undefined,
    year: entry.year || new Date().getFullYear(),
    cover_url:
      entry.images?.jpg?.large_image_url ||
      entry.images?.jpg?.image_url ||
      "",
    source: "jikan",
  };
}

// ─────── Search ───────

export interface JikanSearchParams {
  query: string;
  type?: "anime" | "manga";
  limit?: number;       // max 25 per Jikan
  page?: number;
  orderBy?: "score" | "popularity" | "title";
  sfw?: boolean;        // safe-for-work filter
}

export async function searchJikan(
  params: JikanSearchParams
): Promise<NormalizedEntry[]> {
  const {
    query,
    type = "anime",
    limit = 15,
    page = 1,
    orderBy = "score",
    sfw = true,
  } = params;

  const base =
    type === "anime"
      ? "https://api.jikan.moe/v4/anime"
      : "https://api.jikan.moe/v4/manga";

  const url = new URL(base);
  if (query) url.searchParams.set("q", query);
  url.searchParams.set("limit", String(Math.min(limit, 25)));
  url.searchParams.set("page", String(page));
  url.searchParams.set("order_by", orderBy);
  url.searchParams.set("sort", "desc");
  if (sfw) url.searchParams.set("sfw", "true");

  try {
    const res = await rateLimitedFetch(url.toString());
    if (!res.ok) {
      console.error(`Jikan API error: ${res.status}`);
      return [];
    }
    const json = await res.json();
    return (json.data || []).map(normalize);
  } catch (err) {
    console.error("Jikan fetch failed:", err);
    return [];
  }
}

/** Fetch top anime/manga — useful for the default feed */
export async function fetchTopEntries(
  type: "anime" | "manga" = "anime",
  limit = 15
): Promise<NormalizedEntry[]> {
  const base =
    type === "anime"
      ? "https://api.jikan.moe/v4/top/anime"
      : "https://api.jikan.moe/v4/top/manga";

  const url = new URL(base);
  url.searchParams.set("limit", String(Math.min(limit, 25)));
  url.searchParams.set("sfw", "true");

  try {
    const res = await rateLimitedFetch(url.toString());
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).map(normalize);
  } catch (err) {
    console.error("Jikan top fetch failed:", err);
    return [];
  }
}

/** Fetch a single entry by MAL ID */
export async function fetchById(
  malId: number,
  type: "anime" | "manga" = "anime"
): Promise<NormalizedEntry | null> {
  const url = `https://api.jikan.moe/v4/${type}/${malId}/full`;
  try {
    const res = await rateLimitedFetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return normalize(json.data);
  } catch {
    return null;
  }
}
