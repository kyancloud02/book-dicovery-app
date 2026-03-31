// ─────────────────────────────────────────────────────────────
// db/spiritBooks.ts
// Local database for "By The Spirit Books" — curated titles
// that always carry high faith alignment scores.
// ─────────────────────────────────────────────────────────────

export interface SpiritBook {
  id: string;
  title: string;
  author: string;
  type: "novel" | "manga" | "light-novel";
  synopsis: string;
  faith_score: number;           // 0–10, always high for curated entries
  maturity_rating: MaturiyRating;
  genres: string[];
  tags: string[];                // thematic tags for taste-matching
  cover_url?: string;
  year: number;
  pages?: number;
  volumes?: number;
  source: "spirit-books";       // always this — distinguishes from Jikan
}

export type MaturiyRating = "all-ages" | "teen" | "young-adult" | "mature";

// ─────── Curated Library ───────

export const SPIRIT_BOOKS: SpiritBook[] = [
  {
    id: "sb-001",
    title: "The Wingfeather Saga: On the Edge of the Dark Sea of Darkness",
    author: "Andrew Peterson",
    type: "novel",
    synopsis:
      "In the land of Skree, the Igiby children discover they are heirs to a forgotten kingdom and must flee the fanged overlords who hunt them. A story woven with sacrifice, courage, and the stubborn persistence of hope in a broken world.",
    faith_score: 9.5,
    maturity_rating: "all-ages",
    genres: ["Fantasy", "Adventure"],
    tags: ["Redemption", "Family Bond", "Sacrificial Love", "Good vs. Evil", "Identity"],
    year: 2008,
    pages: 325,
    source: "spirit-books",
  },
  {
    id: "sb-002",
    title: "The Screwtape Letters",
    author: "C.S. Lewis",
    type: "novel",
    synopsis:
      "A senior demon writes instructional letters to his nephew on how to corrupt a human soul. Lewis inverts the demonic perspective to illuminate the quiet spiritual war fought in everyday choices, temptation, and grace.",
    faith_score: 10,
    maturity_rating: "teen",
    genres: ["Satire", "Theology", "Fiction"],
    tags: ["Spiritual Warfare", "Moral Consequence", "Temptation", "Grace", "Redemptive Archetype"],
    year: 1942,
    pages: 175,
    source: "spirit-books",
  },
  {
    id: "sb-003",
    title: "A Severe Mercy",
    author: "Sheldon Vanauken",
    type: "novel",
    synopsis:
      "A true account of a love so consuming it nearly becomes idolatrous, and the divine mercy that shatters it open. Letters from C.S. Lewis guide the narrator through grief toward a faith deeper than romance.",
    faith_score: 9.8,
    maturity_rating: "young-adult",
    genres: ["Memoir", "Romance", "Theology"],
    tags: ["Sacrificial Love", "Loss & Grief", "Divine Mercy", "Conversion", "Beauty"],
    year: 1977,
    pages: 233,
    source: "spirit-books",
  },
  {
    id: "sb-004",
    title: "Till We Have Faces",
    author: "C.S. Lewis",
    type: "novel",
    synopsis:
      "A retelling of the Cupid and Psyche myth from the perspective of the ugly elder sister. Orual's rage against the gods becomes a mirror for the self-deception that keeps mortals from seeing—and being seen by—the divine.",
    faith_score: 9.7,
    maturity_rating: "young-adult",
    genres: ["Mythology", "Fantasy", "Literary Fiction"],
    tags: ["Self-Deception", "Divine Encounter", "Redemptive Archetype", "Suffering", "Identity"],
    year: 1956,
    pages: 313,
    source: "spirit-books",
  },
  {
    id: "sb-005",
    title: "Hinds' Feet on High Places",
    author: "Hannah Hurnard",
    type: "novel",
    synopsis:
      "Much-Afraid, a crippled girl, is called by the Good Shepherd to journey to the High Places. Along the way, companions named Sorrow and Suffering teach her that the path to joy is never the one she expected.",
    faith_score: 9.6,
    maturity_rating: "all-ages",
    genres: ["Allegory", "Fantasy"],
    tags: ["Faith Journey", "Trust", "Suffering", "Transformation", "Joy"],
    year: 1955,
    pages: 240,
    source: "spirit-books",
  },
  {
    id: "sb-006",
    title: "Perelandra",
    author: "C.S. Lewis",
    type: "novel",
    synopsis:
      "Ransom is sent to Venus to prevent a second Fall of Man. On a paradisal floating world, he faces a Tempter armed not with force but with relentless, exhausting persuasion—and must decide what faithfulness costs when no one is watching.",
    faith_score: 9.9,
    maturity_rating: "teen",
    genres: ["Science Fiction", "Theology", "Fantasy"],
    tags: ["Temptation", "Obedience", "Heroic Boldness", "Good vs. Evil", "Innocence"],
    year: 1943,
    pages: 222,
    source: "spirit-books",
  },
  {
    id: "sb-007",
    title: "The Pilgrim's Progress",
    author: "John Bunyan",
    type: "novel",
    synopsis:
      "Christian flees the City of Destruction with a burden on his back. His journey to the Celestial City passes through the Slough of Despond, Vanity Fair, and Doubting Castle—each an allegory for the trials every believer faces.",
    faith_score: 10,
    maturity_rating: "all-ages",
    genres: ["Allegory", "Adventure"],
    tags: ["Faith Journey", "Perseverance", "Redemption", "Spiritual Warfare", "Hope"],
    year: 1678,
    pages: 336,
    source: "spirit-books",
  },
  {
    id: "sb-008",
    title: "Silence",
    author: "Shūsaku Endō",
    type: "novel",
    synopsis:
      "A Portuguese Jesuit priest travels to seventeenth-century Japan to find his apostate mentor. Under relentless persecution, he confronts the most devastating question faith can ask: why does God remain silent when His people suffer?",
    faith_score: 9.0,
    maturity_rating: "mature",
    genres: ["Historical Fiction", "Literary Fiction", "Theology"],
    tags: ["Suffering", "Doubt & Faith", "Martyrdom", "Divine Silence", "Moral Consequence"],
    year: 1966,
    pages: 201,
    source: "spirit-books",
  },
  {
    id: "sb-009",
    title: "The Mark of the Lion Series: A Voice in the Wind",
    author: "Francine Rivers",
    type: "novel",
    synopsis:
      "Hadassah, a young Jewish slave in first-century Rome, quietly lives out her faith amid gladiatorial spectacle and imperial cruelty. Her gentle witness transforms the lives of those around her—even as it costs her everything.",
    faith_score: 9.4,
    maturity_rating: "young-adult",
    genres: ["Historical Fiction", "Romance"],
    tags: ["Martyrdom", "Quiet Witness", "Sacrificial Love", "Courage", "Redemption"],
    year: 1993,
    pages: 500,
    source: "spirit-books",
  },
  {
    id: "sb-010",
    title: "Rurouni Kenshin (Restored Edition)",
    author: "Nobuhiro Watsuki",
    type: "manga",
    synopsis:
      "A legendary swordsman who vowed never to kill again wanders Meiji-era Japan seeking atonement. Kenshin's reverse-blade sword becomes a symbol of the tension between justice and mercy, violence and peace.",
    faith_score: 7.5,
    maturity_rating: "teen",
    genres: ["Action", "Historical", "Drama"],
    tags: ["Atonement", "Non-Violence", "Redemptive Archetype", "Perseverance", "Justice & Mercy"],
    year: 1994,
    volumes: 28,
    source: "spirit-books",
  },
  {
    id: "sb-011",
    title: "Frieren: Beyond Journey's End",
    author: "Kanehito Yamada",
    type: "manga",
    synopsis:
      "An elven mage outlives her mortal companions after defeating the Demon King. Decades later she retraces their journey, slowly learning what it means to understand a human heart before time erases every trace.",
    faith_score: 8.0,
    maturity_rating: "teen",
    genres: ["Fantasy", "Adventure", "Drama"],
    tags: ["Legacy of Good", "Quiet Devotion", "Memory", "Selflessness", "Found Family"],
    year: 2020,
    volumes: 12,
    source: "spirit-books",
  },
  {
    id: "sb-012",
    title: "March Comes in Like a Lion",
    author: "Chica Umino",
    type: "manga",
    synopsis:
      "A teenage shogi prodigy burdened by loneliness discovers warmth through three sisters who open their home and hearts. A meditation on depression, resilience, and the slow courage of letting yourself be loved.",
    faith_score: 8.2,
    maturity_rating: "teen",
    genres: ["Drama", "Slice of Life"],
    tags: ["Found Family", "Perseverance", "Gentle Strength", "Healing", "Community"],
    year: 2007,
    volumes: 17,
    source: "spirit-books",
  },
];

// ─────── Query Helpers ───────

/** Return all books that pass the maturity filter */
export function filterByMaturity(
  books: SpiritBook[],
  maxMaturity: number // 0=all-ages, 1=teen, 2=young-adult, 3=mature
): SpiritBook[] {
  const levels: Record<MaturiyRating, number> = {
    "all-ages": 0,
    teen: 1,
    "young-adult": 2,
    mature: 3,
  };
  return books.filter((b) => levels[b.maturity_rating] <= maxMaturity);
}

/** Full-text search across title, synopsis, author, tags */
export function searchSpiritBooks(query: string): SpiritBook[] {
  if (!query.trim()) return SPIRIT_BOOKS;
  const q = query.toLowerCase();
  return SPIRIT_BOOKS.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.synopsis.toLowerCase().includes(q) ||
      b.tags.some((t) => t.toLowerCase().includes(q)) ||
      b.genres.some((g) => g.toLowerCase().includes(q))
  );
}
