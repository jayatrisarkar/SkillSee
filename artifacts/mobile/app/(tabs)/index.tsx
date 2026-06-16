import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryCard } from "@/components/CategoryCard";
import { ContentCard } from "@/components/ContentCard";
import { EmptyState } from "@/components/EmptyState";
import { WelcomeModal } from "@/components/WelcomeModal";
import { useLibrary } from "@/context/LibraryContext";
import { useProfile } from "@/context/ProfileContext";
import { useColors } from "@/hooks/useColors";
import { computeStats, generateInsights } from "@/utils/insights";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { categories, items, deleteItem } = useLibrary();
  const { profile } = useProfile();

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const stats = useMemo(() => computeStats(items, categories), [items, categories]);
  const insights = useMemo(() => generateInsights(stats, items, categories), [stats, items, categories]);
  const topInsight = insights[0];

  const categoryData = useMemo(
    () =>
      categories.map((cat) => ({
        ...cat,
        count: items.filter((it) => it.categoryId === cat.id && !it.isArchived).length,
      })),
    [categories, items]
  );

  const inProgressItems = useMemo(
    () => items.filter((it) => it.status === "learning" && !it.isArchived).slice(0, 3),
    [items]
  );

  const firstName = profile.name.split(" ")[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WelcomeModal />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topInset + 12,
            paddingBottom: Platform.OS === "web" ? 34 + 84 + 16 : insets.bottom + 100,
          },
        ]}
      >
        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <View style={styles.greetingBlock}>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              {getGreeting()}, {firstName} 👋
            </Text>
            <View style={styles.titleRow}>
              <Text style={[styles.titleBrand, { color: colors.primary }]}>Skill</Text>
              <Text style={[styles.titleBrand, { color: colors.foreground }]}>Flow</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            activeOpacity={0.8}
          >
            <View style={[styles.avatarSmall, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
              <Text style={[styles.avatarInitials, { color: colors.primary }]}>
                {profile.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Quick Stats ── */}
        <View style={styles.quickStats}>
          <View style={[styles.quickStatPill, { backgroundColor: "#EF444415", borderColor: "#EF444430" }]}>
            <Ionicons name="flame" size={14} color="#EF4444" />
            <Text style={[styles.quickStatText, { color: "#EF4444" }]}>
              {stats.streak}d streak
            </Text>
          </View>
          <View style={[styles.quickStatPill, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Ionicons name="bookmark-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.quickStatText, { color: colors.mutedForeground }]}>
              {stats.savesThisWeek} this week
            </Text>
          </View>
          <View style={[styles.quickStatPill, { backgroundColor: "#10B98115", borderColor: "#10B98130" }]}>
            <Ionicons name="checkmark-circle-outline" size={14} color="#10B981" />
            <Text style={[styles.quickStatText, { color: "#10B981" }]}>
              {stats.totalCompleted} done
            </Text>
          </View>
        </View>

        {/* ── AI Insight ── */}
        {topInsight && (
          <TouchableOpacity
            style={[styles.insightBanner, { backgroundColor: colors.card, borderColor: colors.primary + "44" }]}
            onPress={() => router.push("/(tabs)/insights")}
            activeOpacity={0.85}
          >
            <View style={[styles.insightIconWrap, { backgroundColor: colors.primary + "18" }]}>
              <Ionicons name="bulb-outline" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.insightBannerText, { color: colors.foreground }]} numberOfLines={2}>
              {topInsight}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}

        {/* ── Continue Learning ── */}
        {inProgressItems.length > 0 && (
          <View>
            <View style={styles.rowHeader}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CONTINUE LEARNING</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.inProgressRow}>
              {inProgressItems.map((item) => {
                const cat = categories.find((c) => c.id === item.categoryId);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.inProgressCard, {
                      backgroundColor: colors.card,
                      borderColor: (cat?.color ?? colors.primary) + "55",
                      borderLeftColor: cat?.color ?? colors.primary,
                    }]}
                    onPress={() => router.push(`/content/${item.id}`)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.inProgressTitle, { color: colors.foreground }]} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={[styles.inProgressCat, { color: cat?.color ?? colors.primary }]}>
                      {cat?.name ?? ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── Categories ── */}
        <View style={styles.rowHeader}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CATEGORIES</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/categories")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>Manage</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.catGrid}>
          {categoryData.map((cat) => (
            <View key={cat.id} style={styles.catCardWrap}>
              <CategoryCard
                name={cat.name}
                icon={cat.icon}
                color={cat.color}
                count={cat.count}
                onPress={() => router.push(`/category/${cat.id}`)}
              />
            </View>
          ))}
        </View>

        {/* ── Empty State ── */}
        {items.length === 0 && (
          <EmptyState
            icon="archive-outline"
            title="Your vault is empty"
            description="Save videos, links, articles, and tutorials to build your personal knowledge vault."
            actionLabel="Save Your First Item"
            onAction={() => router.push("/add")}
          />
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greetingBlock: { gap: 2 },
  greeting: { fontSize: 13, fontFamily: "Inter_500Medium", letterSpacing: 0.2 },
  titleRow: { flexDirection: "row", alignItems: "center" },
  titleBrand: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.8 },
  avatarSmall: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  avatarInitials: { fontSize: 16, fontFamily: "Inter_700Bold" },
  quickStats: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  quickStatPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickStatText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  insightBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  insightIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  insightBannerText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 20 },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: -4,
  },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  inProgressRow: { gap: 12, paddingVertical: 4 },
  inProgressCard: {
    width: 180,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    gap: 6,
  },
  inProgressTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 18 },
  inProgressCat: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catCardWrap: { width: "48%" },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
