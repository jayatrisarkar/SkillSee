// ── Platform Detection ─────────────────────────────────────────────────────────

export type SourcePlatform =
  | "YouTube"
  | "Instagram"
  | "TikTok"
  | "Facebook"
  | "Twitter/X"
  | "Threads"
  | "LinkedIn"
  | "Website";

export function detectPlatform(url: string): SourcePlatform {
  if (/youtu\.be|youtube\.com/i.test(url)) return "YouTube";
  if (/instagram\.com/i.test(url)) return "Instagram";
  if (/tiktok\.com/i.test(url)) return "TikTok";
  if (/facebook\.com|fb\.watch|fb\.com/i.test(url)) return "Facebook";
  if (/threads\.net/i.test(url)) return "Threads";
  if (/twitter\.com|x\.com/i.test(url)) return "Twitter/X";
  if (/linkedin\.com/i.test(url)) return "LinkedIn";
  return "Website";
}

export const PLATFORM_COLORS: Record<SourcePlatform, string> = {
  YouTube: "#FF0000",
  Instagram: "#E1306C",
  TikTok: "#010101",
  Facebook: "#1877F2",
  "Twitter/X": "#000000",
  Threads: "#1C1C1C",
  LinkedIn: "#0A66C2",
  Website: "#6366F1",
};

// ── Keyword Categorization ────────────────────────────────────────────────────
//
// categorizeContent(title, description, url) → { categoryId, confidence }
//
// This function is designed to be swapped for an AI API call later.
// Keep the signature identical when replacing with AI.

interface CategoryMatch {
  categoryId: string;
  keywords: string[];
}

const KEYWORD_MAP: CategoryMatch[] = [
  {
    categoryId: "cat_coding",
    keywords: [
      "python", "javascript", "typescript", "react", "coding", "programming",
      "developer", "software", "code", "html", "css", "java", "golang", "rust",
      "nodejs", "frontend", "backend", "fullstack", "web dev", "app dev",
      "algorithm", "data structure", "api", "devops", "github", "git", "docker",
      "kubernetes", "aws", "cloud computing", "machine learning", "ai model",
      "neural network", "deep learning", "sql", "database",
    ],
  },
  {
    categoryId: "cat_fitness",
    keywords: [
      "gym", "workout", "fitness", "exercise", "training", "bodybuilding",
      "weight", "muscle", "cardio", "yoga", "pilates", "crossfit", "strength",
      "hiit", "abs", "calisthenics", "running", "marathon", "lifting",
      "protein", "nutrition", "diet", "calories", "physique", "bulk", "cut",
    ],
  },
  {
    categoryId: "cat_finance",
    keywords: [
      "stock", "trading", "investing", "finance", "crypto", "bitcoin",
      "money", "wealth", "budget", "forex", "dividend", "etf", "portfolio",
      "retirement", "passive income", "real estate", "financial", "economy",
      "inflation", "interest rate", "options", "futures", "hedge fund",
      "venture capital", "startup funding", "roi", "compound interest",
    ],
  },
  {
    categoryId: "cat_instruments",
    keywords: [
      "guitar", "piano", "drum", "bass", "violin", "music theory",
      "instrument", "chord", "scale", "music production", "beat", "dj",
      "synthesizer", "ukulele", "trumpet", "saxophone", "cello", "flute",
      "mixing", "mastering", "ableton", "fl studio", "audio engineer",
    ],
  },
  {
    categoryId: "cat_dance",
    keywords: [
      "dance", "dancing", "choreography", "ballet", "hip hop dance",
      "salsa", "breakdance", "zumba", "bachata", "contemporary dance",
      "ballroom", "tap dance", "pole dance", "street dance", "krump",
    ],
  },
  {
    categoryId: "cat_singing",
    keywords: [
      "singing", "vocal", "voice", "karaoke", "singer", "belting",
      "falsetto", "breath control", "pitch", "vocal training", "singing lesson",
      "opera", "choir", "acapella", "vocal coach", "voice lesson",
    ],
  },
  {
    categoryId: "cat_cooking",
    keywords: [
      "cooking", "recipe", "food", "baking", "chef", "cuisine", "meal",
      "kitchen", "cook", "dinner", "breakfast", "lunch", "dessert",
      "pastry", "restaurant", "ingredient", "dish", "grilling", "sauce",
      "soup", "vegan", "vegetarian", "keto", "gluten free",
    ],
  },
  {
    categoryId: "cat_art",
    keywords: [
      "art", "drawing", "painting", "sketch", "illustration", "design",
      "graphic", "digital art", "watercolor", "oil painting", "sculpture",
      "photography", "creative", "photoshop", "figma", "procreate",
      "portrait", "landscape", "abstract", "comic", "manga", "animation",
      "3d modeling", "blender", "zbrush",
    ],
  },
];

export interface CategorizeResult {
  categoryId: string;
  confidence: "high" | "low";
}

/**
 * Categorize content by keyword matching.
 * Replace this function body with an AI API call (same signature) when ready.
 */
export function categorizeContent(
  title: string,
  description: string,
  url: string
): CategorizeResult {
  const text = `${title} ${description} ${url}`.toLowerCase();

  for (const { categoryId, keywords } of KEYWORD_MAP) {
    if (keywords.some((kw) => text.includes(kw))) {
      return { categoryId, confidence: "high" };
    }
  }

  return { categoryId: "cat_learning", confidence: "low" };
}
