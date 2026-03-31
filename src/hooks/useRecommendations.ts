// ─────────────────────────────────────────────────────────────
// hooks/useRecommendations.ts
// React hook that connects the scoring engine to your UI.
// Handles debounced search, loading states, and settings sync.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getRecommendations,
  sliderToDiscernment,
  sliderToMaturity,
  type ScoredRecommendation,
  type RecommendationResponse,
  type UserTasteProfile,
} from "../engine/scoringEngine";

// ─────── Types ───────

export interface UISettings {
  discernmentSlider: number;  // 0–3 (Low, Medium, High, Devout)
  maturitySlider: number;     // 0–3 (All Ages, Teen, Young Adult, Mature)
}

export interface UseRecommendationsReturn {
  results: ScoredRecommendation[];
  loading: boolean;
  error: string | null;
  meta: RecommendationResponse["meta"] | null;
  search: (query: string) => void;
  refresh: () => void;
}

// ─────── Default Taste Profile ───────
// In production, this would come from user onboarding or saved prefs.

const DEFAULT_PROFILE: UserTasteProfile = {
  favoriteGenres: ["Fantasy", "Drama", "Adventure", "Sci-Fi"],
  favoriteTags: ["Redemption", "Found Family", "Sacrificial Love", "Perseverance"],
  dislikedGenres: ["Ecchi", "Harem"],
};

// ─────── Hook ───────

export function useRecommendations(
  uiSettings: UISettings,
  claudeApiKey?: string,
  profile: UserTasteProfile = DEFAULT_PROFILE,
  debounceMs = 400
): UseRecommendationsReturn {
  const [results, setResults] = useState<ScoredRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<RecommendationResponse["meta"] | null>(null);
  const [query, setQuery] = useState("");

  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const abortRef = useRef<AbortController>();

  const fetchResults = useCallback(
    async (searchQuery: string) => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const response = await getRecommendations({
          query: searchQuery,
          settings: {
            discernment: sliderToDiscernment(uiSettings.discernmentSlider),
            maturity: sliderToMaturity(uiSettings.maturitySlider),
          },
          profile,
          claudeApiKey,
        });

        setResults(response.results);
        setMeta(response.meta);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to fetch recommendations");
          console.error("useRecommendations error:", err);
        }
      } finally {
        setLoading(false);
      }
    },
    [
      uiSettings.discernmentSlider,
      uiSettings.maturitySlider,
      claudeApiKey,
      profile,
    ]
  );

  // Debounced search
  const search = useCallback(
    (q: string) => {
      setQuery(q);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fetchResults(q), debounceMs);
    },
    [fetchResults, debounceMs]
  );

  // Refresh with current query
  const refresh = useCallback(() => {
    fetchResults(query);
  }, [fetchResults, query]);

  // Initial load + re-fetch when settings change
  useEffect(() => {
    fetchResults(query);
    return () => {
      timerRef.current && clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, [uiSettings.discernmentSlider, uiSettings.maturitySlider]);

  return { results, loading, error, meta, search, refresh };
}
