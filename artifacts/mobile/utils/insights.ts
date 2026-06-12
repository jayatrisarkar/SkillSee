import { type Category, type ContentItem } from "@/context/LibraryContext";

export interface InsightStats {
  totalSaved: number;
  totalCompleted: number;
  totalLearning: number;
  totalArchived: number;
  completionRate: number;
  streak: number;
  savesThisWeek: number;
  savesThisMonth: number;
  completedThisWeek: number;
  mostActiveCategory: Category | null;
  mostSavedCategory: Category | null;
  weeklyActivity: number[];
  monthlyActivity: number[];
  heatmapData: number[];
  categoryDistribution: { category: Category; count: number; percentage: number }[];
  totalTags: number;
  estimatedHours: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const DAY = 86400000;

export function computeStreak(items: ContentItem[]): number {
  if (items.length === 0) return 0;
  const today = startOfDay(Date.now());
  const days = new Set(items.map((it) => startOfDay(it.createdAt)));
  let streak = 0;
  let cursor = today;
  while (days.has(cursor) || (streak === 0 && days.has(cursor - DAY))) {
    if (days.has(cursor)) {
      streak++;
    } else {
      cursor -= DAY;
      if (!days.has(cursor)) break;
      streak++;
    }
    cursor -= DAY;
  }
  return streak;
}

export function computeStats(items: ContentItem[], categories: Category[]): InsightStats {
  const active = items.filter((it) => !it.isArchived);
  const totalSaved = active.length;
  const totalCompleted = active.filter((it) => it.status === "completed").length;
  const totalLearning = active.filter((it) => it.status === "learning").length;
  const totalArchived = items.filter((it) => it.isArchived).length;
  const completionRate = totalSaved > 0 ? totalCompleted / totalSaved : 0;
  const streak = computeStreak(items);

  const now = Date.now();
  const weekAgo = now - 7 * DAY;
  const monthAgo = now - 30 * DAY;

  const savesThisWeek = active.filter((it) => it.createdAt >= weekAgo).length;
  const savesThisMonth = active.filter((it) => it.createdAt >= monthAgo).length;
  const completedThisWeek = active.filter(
    (it) => it.status === "completed" && it.updatedAt >= weekAgo
  ).length;

  const weeklyActivity: number[] = Array(7).fill(0);
  for (const it of active) {
    const diffDays = Math.floor((now - it.createdAt) / DAY);
    if (diffDays >= 0 && diffDays < 7) {
      weeklyActivity[6 - diffDays]++;
    }
  }

  const monthlyActivity: number[] = Array(8).fill(0);
  for (const it of active) {
    const diffWeeks = Math.floor((now - it.createdAt) / (7 * DAY));
    if (diffWeeks >= 0 && diffWeeks < 8) {
      monthlyActivity[7 - diffWeeks]++;
    }
  }

  const heatmapData: number[] = Array(49).fill(0);
  for (const it of active) {
    const diffDays = Math.floor((now - it.createdAt) / DAY);
    if (diffDays >= 0 && diffDays < 49) {
      heatmapData[48 - diffDays]++;
    }
  }

  const countByCat = new Map<string, number>();
  for (const it of active) {
    countByCat.set(it.categoryId, (countByCat.get(it.categoryId) ?? 0) + 1);
  }

  const sortedCats = [...countByCat.entries()].sort((a, b) => b[1] - a[1]);
  const mostSavedCategory = sortedCats[0]
    ? (categories.find((c) => c.id === sortedCats[0][0]) ?? null)
    : null;

  const recentActivity = new Map<string, number>();
  const recentItems = active.filter((it) => it.createdAt >= monthAgo);
  for (const it of recentItems) {
    recentActivity.set(it.categoryId, (recentActivity.get(it.categoryId) ?? 0) + 1);
  }
  const sortedRecent = [...recentActivity.entries()].sort((a, b) => b[1] - a[1]);
  const mostActiveCategory = sortedRecent[0]
    ? (categories.find((c) => c.id === sortedRecent[0][0]) ?? null)
    : null;

  const categoryDistribution = categories
    .map((cat) => ({ category: cat, count: countByCat.get(cat.id) ?? 0 }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((d) => ({ ...d, percentage: totalSaved > 0 ? d.count / totalSaved : 0 }));

  const allTags = new Set(active.flatMap((it) => it.tags));

  return {
    totalSaved,
    totalCompleted,
    totalLearning,
    totalArchived,
    completionRate,
    streak,
    savesThisWeek,
    savesThisMonth,
    completedThisWeek,
    mostActiveCategory,
    mostSavedCategory,
    weeklyActivity,
    monthlyActivity,
    heatmapData,
    categoryDistribution,
    totalTags: allTags.size,
    estimatedHours: Math.round(totalCompleted * 0.25 * 10) / 10,
  };
}

export function generateInsights(stats: InsightStats, items: ContentItem[], categories: Category[]): string[] {
  const insights: string[] = [];
  const active = items.filter((it) => !it.isArchived);

  if (stats.mostSavedCategory && stats.savesThisMonth > 0) {
    const catName = stats.mostSavedCategory.name;
    insights.push(`You saved ${stats.savesThisMonth} item${stats.savesThisMonth !== 1 ? "s" : ""} this month — most in ${catName}.`);
  }

  if (stats.mostActiveCategory) {
    insights.push(`${stats.mostActiveCategory.name} is your most active learning category right now.`);
  }

  if (stats.completedThisWeek > 0) {
    insights.push(`You completed ${stats.completedThisWeek} item${stats.completedThisWeek !== 1 ? "s" : ""} this week — great progress!`);
  }

  if (stats.streak >= 3) {
    insights.push(`You're on a ${stats.streak}-day learning streak. Keep the momentum going!`);
  } else if (stats.streak === 0 && active.length > 0) {
    insights.push("Start a new streak today by saving something you want to learn.");
  }

  if (stats.completionRate > 0) {
    const pct = Math.round(stats.completionRate * 100);
    if (pct >= 50) {
      insights.push(`Your completion rate is ${pct}% — you're a great finisher!`);
    } else {
      insights.push(`Your completion rate is ${pct}%. Try completing a few saved items today.`);
    }
  }

  const now = Date.now();
  const staleDays = 10;
  for (const cat of categories) {
    const catItems = active.filter((it) => it.categoryId === cat.id);
    if (catItems.length > 0) {
      const latest = Math.max(...catItems.map((it) => it.createdAt));
      const daysSince = Math.floor((now - latest) / DAY);
      if (daysSince >= staleDays) {
        insights.push(`You haven't added to ${cat.name} in ${daysSince} days — revisit it soon!`);
        break;
      }
    }
  }

  const learningItems = active.filter((it) => it.status === "learning");
  if (learningItems.length > 0) {
    insights.push(`You have ${learningItems.length} item${learningItems.length !== 1 ? "s" : ""} in progress. Keep going!`);
  }

  if (stats.totalSaved === 0) {
    insights.push("Save your first piece of content to start building your knowledge vault.");
  }

  return insights.slice(0, 6);
}

export function computeAchievements(items: ContentItem[], categories: Category[]): Achievement[] {
  const active = items.filter((it) => !it.isArchived);
  const completed = active.filter((it) => it.status === "completed");
  const streak = computeStreak(items);
  const customCats = categories.filter((c) => !c.isDefault);
  const allTags = new Set(active.flatMap((it) => it.tags));

  const countByCat = new Map<string, number>();
  for (const it of active) {
    countByCat.set(it.categoryId, (countByCat.get(it.categoryId) ?? 0) + 1);
  }

  return [
    {
      id: "first_save",
      title: "First Save",
      description: "Save your first piece of content",
      icon: "bookmark",
      color: "#F59E0B",
      earned: active.length >= 1,
    },
    {
      id: "saves_10",
      title: "Collector",
      description: "Save 10 items",
      icon: "library",
      color: "#6366F1",
      earned: active.length >= 10,
    },
    {
      id: "saves_50",
      title: "Archivist",
      description: "Save 50 items",
      icon: "archive",
      color: "#8B5CF6",
      earned: active.length >= 50,
    },
    {
      id: "first_complete",
      title: "First Win",
      description: "Complete your first item",
      icon: "checkmark-circle",
      color: "#10B981",
      earned: completed.length >= 1,
    },
    {
      id: "complete_10",
      title: "Finisher",
      description: "Complete 10 items",
      icon: "trophy",
      color: "#10B981",
      earned: completed.length >= 10,
    },
    {
      id: "complete_50",
      title: "Master Learner",
      description: "Complete 50 tutorials",
      icon: "medal",
      color: "#F59E0B",
      earned: completed.length >= 50,
    },
    {
      id: "streak_3",
      title: "On a Roll",
      description: "Maintain a 3-day streak",
      icon: "flame",
      color: "#EF4444",
      earned: streak >= 3,
    },
    {
      id: "streak_7",
      title: "7-Day Streak",
      description: "7 consecutive days of saving",
      icon: "flame",
      color: "#EF4444",
      earned: streak >= 7,
    },
    {
      id: "streak_30",
      title: "Unstoppable",
      description: "30-day learning streak",
      icon: "rocket",
      color: "#EC4899",
      earned: streak >= 30,
    },
    {
      id: "custom_category",
      title: "Organizer",
      description: "Create a custom category",
      icon: "folder",
      color: "#F97316",
      earned: customCats.length >= 1,
    },
    {
      id: "multi_category",
      title: "Well-Rounded",
      description: "Save to 5 different categories",
      icon: "grid",
      color: "#22D3EE",
      earned: countByCat.size >= 5,
    },
    {
      id: "tag_master",
      title: "Tag Master",
      description: "Use 10 unique tags",
      icon: "pricetag",
      color: "#A855F7",
      earned: allTags.size >= 10,
    },
    {
      id: "note_taker",
      title: "Note Taker",
      description: "Add notes to 5 items",
      icon: "document-text",
      color: "#3B82F6",
      earned: active.filter((it) => it.notes.trim().length > 0).length >= 5,
    },
    {
      id: "finance_expert",
      title: "Finance Expert",
      description: "Save 10 finance items",
      icon: "trending-up",
      color: "#10B981",
      earned: (countByCat.get("cat_finance") ?? 0) >= 10,
    },
    {
      id: "coding_explorer",
      title: "Coding Explorer",
      description: "Save 10 coding items",
      icon: "code-slash",
      color: "#22D3EE",
      earned: (countByCat.get("cat_coding") ?? 0) >= 10,
    },
    {
      id: "fitness_learner",
      title: "Fitness Learner",
      description: "Save 10 fitness items",
      icon: "barbell",
      color: "#EF4444",
      earned: (countByCat.get("cat_fitness") ?? 0) >= 10,
    },
  ];
}
