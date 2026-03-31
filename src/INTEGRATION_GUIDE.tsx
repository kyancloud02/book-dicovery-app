// ─────────────────────────────────────────────────────────────
// INTEGRATION GUIDE
// How to wire the scoring engine into your Identity app.
// ─────────────────────────────────────────────────────────────
//
// This file shows the key integration points. Copy the relevant
// pieces into your existing App component.
//
// FILE STRUCTURE:
//   src/
//   ├── api/
//   │   └── jikan.ts              ← Jikan API client
//   ├── db/
//   │   └── spiritBooks.ts        ← Local "By The Spirit" database
//   ├── engine/
//   │   ├── claudeAudit.ts        ← Claude worldview analysis
//   │   └── scoringEngine.ts      ← Core scoring + merge logic
//   ├── hooks/
//   │   └── useRecommendations.ts ← React hook for the UI
//   └── App.tsx                   ← Your existing UI
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { useRecommendations, type UISettings } from "./hooks/useRecommendations";
import { sliderToDiscernment } from "./engine/scoringEngine";

/*
  STEP 1: Add your Claude API key.
  
  ⚠️  NEVER put this in client code in production.
  Use a Supabase Edge Function, Vercel API route, or 
  Cloudflare Worker as a proxy. For local dev, use .env:
*/
const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY || "";

/*
  STEP 2: In your App component, replace the static DATA array
  with the useRecommendations hook:
*/
function AppIntegrationExample() {
  // These map to your existing Settings modal sliders (0–3)
  const [uiSettings, setUISettings] = useState<UISettings>({
    discernmentSlider: 2,  // "High"
    maturitySlider: 1,     // "Teen"
  });

  // The hook handles everything: fetching, scoring, filtering
  const { results, loading, error, meta, search, refresh } =
    useRecommendations(uiSettings, CLAUDE_API_KEY);

  /*
    STEP 3: Wire search input to the `search` function:
    
    <input
      onChange={(e) => search(e.target.value)}
      placeholder="Search titles, authors, themes..."
    />
  */

  /*
    STEP 4: Wire the Settings modal sliders to `setUISettings`:
    
    <DiscernmentSlider
      value={uiSettings.discernmentSlider}
      onChange={(v) => setUISettings(s => ({ ...s, discernmentSlider: v }))}
    />
    <MaturitySlider
      value={uiSettings.maturitySlider}
      onChange={(v) => setUISettings(s => ({ ...s, maturitySlider: v }))}
    />
  */

  /*
    STEP 5: Map `results` to your RecommendationCard component:
    
    {results.map((item, i) => (
      <RecommendationCard
        key={item.id}
        item={{
          ...item,
          matchPercent: item.matchScore,        // 0–100
          logicChips:  item.logicChips,          // string[]
          faithScore:  item.faithScore,          // 0–10
          faithLabel:  getFaithLabel(item.faithScore),
          coverIndex:  i % COVERS.length,
        }}
        index={i}
        visible={!loading}
      />
    ))}
  */

  /*
    STEP 6: Show loading and meta info:
    
    {loading && <Spinner />}
    {meta && (
      <p>
        {meta.spiritBookCount} curated + {meta.jikanCount} from MAL
        {meta.filteredOut > 0 && ` · ${meta.filteredOut} filtered by maturity`}
        {meta.claudeAudited && " · AI-scored"}
      </p>
    )}
  */

  return null; // This is just a guide — see comments above
}

// ─────── Helpers for the UI ───────

/** Convert faith_score (0–10) to a display label */
export function getFaithLabel(score: number): string {
  if (score >= 9)   return "Exceptional";
  if (score >= 7.5) return "Very High";
  if (score >= 6)   return "High Alignment";
  if (score >= 4)   return "Moderate";
  if (score >= 2)   return "Low Alignment";
  return "Misaligned";
}

/** Convert discernment slider (0–3) to display label */
export function getDiscernmentLabel(slider: number): string {
  return ["Low", "Medium", "High", "Devout"][slider] || "Low";
}

/** Convert maturity slider (0–3) to display label */
export function getMaturityLabel(slider: number): string {
  return ["All Ages", "Teen", "Young Adult", "Mature"][slider] || "All Ages";
}

/*
  ─────────────────────────────────────────────────────────────
  ENVIRONMENT SETUP
  ─────────────────────────────────────────────────────────────

  1. Create a `.env` file in your project root:

     VITE_CLAUDE_API_KEY=sk-ant-...your-key...

  2. Install no extra dependencies — the engine uses only
     native fetch() which is available in all modern browsers
     and Node 18+.

  3. The Jikan API is free and requires no API key.
     Rate limit: ~3 requests/second (handled automatically).

  4. For production, create a backend proxy for Claude:

     // Example: Supabase Edge Function
     // supabase/functions/claude-audit/index.ts
     
     import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
     
     serve(async (req) => {
       const { title, synopsis, genres, discernment } = await req.json();
       const res = await fetch("https://api.anthropic.com/v1/messages", {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           "x-api-key": Deno.env.get("CLAUDE_API_KEY")!,
           "anthropic-version": "2023-06-01",
         },
         body: JSON.stringify({
           model: "claude-sonnet-4-20250514",
           max_tokens: 600,
           messages: [{ role: "user", content: buildPrompt(...) }],
         }),
       });
       return new Response(await res.text(), {
         headers: { "Content-Type": "application/json" },
       });
     });

  ─────────────────────────────────────────────────────────────
*/

export default AppIntegrationExample;
