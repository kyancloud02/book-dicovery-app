# Identity — Fiction & Anime Recommendation Engine

A faith-aligned fiction/anime recommendation app with a sophisticated content taxonomy, worldview scoring, and silent virtue profiling system.

## Project Structure

```
src/
├── App.jsx                    ← Complete integrated app (runs as artifact or in Vite)
├── INTEGRATION_GUIDE.tsx      ← How to wire modular engine into your own UI
├── api/
│   └── jikan.ts               ← Jikan API v4 client (MyAnimeList)
├── db/
│   └── spiritBooks.ts         ← "By The Spirit Books" curated database
├── engine/
│   ├── claudeAudit.ts         ← Claude Worldview Audit (API + heuristic fallback)
│   └── scoringEngine.ts       ← Core scoring, merging, filtering pipeline
└── hooks/
    └── useRecommendations.ts  ← React hook connecting engine to UI
```

## Architecture

### Content Taxonomy (per entry)
- **Lead Gender**: Male / Female / Ensemble
- **Dynamics**: Solo / Duo / Team / Harem (3+ romantic interests = Harem)
- **Sensuality**: None / Low / Moderate / High
- **Occult Level**: 1–5 (1=no magic, 3=fantasy magic, 5=demonic pacts as good)
- **Core Virtues**: 3 faith-bridge keywords (e.g., Sacrificial, Merciful, Truth-Seeker)
- **Core Hooks**: 3 structural genres (e.g., World Building, Political Intrigue)
- **Maturity Rating**: G / PG / PG-13 / R
- **Tone**: Emotional register (Epic, Tender, Intense, etc.)

### 3-Step Scoring Pipeline

1. **GUG Content Check** (hard gate)
   - Sexual content → Discernment = 0
   - Occult-positive content → Discernment = 0
   - Strictness scales with Discernment slider (Off/Low/Medium/High)

2. **Worldview Audit** (1–100)
   - Kingdom Values (Phil 4:8): sacrifice, honor, truth, grace, mercy
   - Tavern Talk: moral consequence, oaths, inner struggle, faith
   - Violence: sadistic (penalty) vs redemptive (bonus)

3. **Final Score**
   - Discernment Off: `matchScore = tasteMatch`
   - Discernment On: `matchScore = max(taste×0.6 + audit×0.4, taste×0.85) + virtueBoost + likedBonus`

### Silent Virtue Profiling (The Bridge)
- When user likes a show, system extracts Core Virtues from its taxonomy
- Virtues accumulate into a hidden Flavor Profile
- Spirit Books with matching virtues surface in a "From your taste" bridge banner
- "More like this" temporarily boosts that item's virtues in the profile

### Feed System
- **Trending**: Top-scored, profile-neutral, with Discovery wildcards
- **For You**: Based on current virtue profile (recent likes)
- **Classics**: Based on all-time likes (only shows when different from For You)
- Long-press any tab to refresh that feed

### Taste DNA
- Analyzes liked items across all taxonomy dimensions
- Generates natural-language portrait in Settings modal
- Shows lead preference, dynamics, tone, hooks, virtues, clean content %, occult comfort

## Setup

### As Vite + React + Tailwind project:
```bash
npm create vite@latest identity -- --template react
cd identity
npm install lucide-react
# Copy src/ files into your project
npm run dev
```

### Environment (for production Claude audit):
```
VITE_CLAUDE_API_KEY=sk-ant-...
```

Use a backend proxy (Supabase Edge Function, Vercel API route) for the Claude API key — never expose in client code.

## Key Files

| File | Purpose |
|------|---------|
| `App.jsx` | Self-contained app with embedded corpus, all scoring, full UI |
| `spiritBooks.ts` | Curated faith-aligned titles with virtues and taxonomy |
| `jikan.ts` | Jikan API integration with rate limiting and normalization |
| `claudeAudit.ts` | Claude API worldview analysis with heuristic fallback |
| `scoringEngine.ts` | Full pipeline: fetch → merge → filter → score → rank |
| `useRecommendations.ts` | React hook with debounced search and settings sync |
