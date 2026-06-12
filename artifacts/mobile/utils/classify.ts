interface Category {
  id: string;
  name: string;
}

const categoryKeywords: Record<string, string[]> = {
  dance: ["dance", "dancing", "choreography", "ballet", "hip hop", "salsa", "tango", "breakdance"],
  singing: ["singing", "vocal", "voice lesson", "karaoke", "choir", "opera", "song cover"],
  instruments: ["guitar", "piano", "drums", "violin", "bass", "ukulele", "trumpet", "instrument", "music lesson", "chord"],
  coding: ["code", "coding", "programming", "javascript", "python", "react", "typescript", "tutorial", "developer", "software", "api", "database", "algorithm", "github"],
  finance: ["finance", "investing", "stock", "crypto", "bitcoin", "trading", "portfolio", "budget", "money", "wealth", "dividend", "etf", "forex"],
  fitness: ["gym", "fitness", "workout", "exercise", "training", "muscle", "weight", "cardio", "yoga", "pilates", "running", "crossfit"],
  cooking: ["cook", "recipe", "baking", "kitchen", "food", "meal", "chef", "culinary", "restaurant", "dish"],
  art: ["art", "drawing", "painting", "sketch", "illustration", "design", "creative", "watercolor", "digital art", "anime", "manga"],
  learning: ["learn", "study", "course", "lecture", "education", "tutorial", "how to", "exam", "academic"],
};

const domainCategories: Record<string, string> = {
  "youtube.com": "",
  "youtu.be": "",
  "github.com": "coding",
  "stackoverflow.com": "coding",
  "leetcode.com": "coding",
  "coursera.org": "learning",
  "udemy.com": "learning",
  "skillshare.com": "learning",
  "tradingview.com": "finance",
  "investopedia.com": "finance",
  "myfitnesspal.com": "fitness",
};

function extractDomain(url: string): string {
  try {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s?#]+)/);
    return match ? match[1].toLowerCase() : "";
  } catch {
    return "";
  }
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

export function classifyContent(title: string, url: string, categories: Category[]): string {
  const titleTokens = tokenize(title);
  const domain = extractDomain(url);

  const domainCategory = domainCategories[domain];
  if (domainCategory) {
    const cat = categories.find((c) => c.name.toLowerCase().includes(domainCategory));
    if (cat) return cat.id;
  }

  const scores: Record<string, number> = {};

  for (const [key, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    for (const token of titleTokens) {
      for (const keyword of keywords) {
        if (keyword.includes(token) || token.includes(keyword)) {
          score += keyword === token ? 3 : 1;
        }
      }
    }
    const urlLower = url.toLowerCase();
    for (const keyword of keywords) {
      if (urlLower.includes(keyword)) {
        score += 2;
      }
    }
    scores[key] = score;
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (!best || best[1] === 0) {
    const learningCat = categories.find((c) => c.name.toLowerCase() === "learning");
    return learningCat?.id ?? categories[0]?.id ?? "";
  }

  const keyName = best[0];
  const nameMappings: Record<string, string[]> = {
    dance: ["dance"],
    singing: ["singing"],
    instruments: ["instrument"],
    coding: ["coding", "code"],
    finance: ["finance"],
    fitness: ["fitness", "gym"],
    cooking: ["cooking", "cook"],
    art: ["art"],
    learning: ["learning"],
  };

  const searchTerms = nameMappings[keyName] ?? [keyName];
  const matched = categories.find((c) =>
    searchTerms.some((term) => c.name.toLowerCase().includes(term))
  );

  if (matched) return matched.id;

  const learningCat = categories.find((c) => c.name.toLowerCase() === "learning");
  return learningCat?.id ?? categories[0]?.id ?? "";
}
