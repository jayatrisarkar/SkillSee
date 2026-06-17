import { Ionicons } from "@expo/vector-icons";
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

import { ActivityHeatmap } from "@/components/charts/ActivityHeatmap";
import { BarChart } from "@/components/charts/BarChart";
import { ProgressRing } from "@/components/charts/ProgressRing";
import { useLibrary } from "@/context/LibraryContext";
import { useColors } from "@/hooks/useColors";
import { computeStats, generateInsights } from "@/utils/insights";

const INSIGHT_ICON_MAP: Record<number, string> = {
  0: "trending-up-outline",
  1: "star-outline",
  2: "trophy-outline",
  3: "flame-outline",
  4: "bar-chart-outline",
  5: "bulb-outline",
};

const DAY_LABELS = ["7d", "6d", "5d", "4d", "3d", "2d", "1d", "Now"]
  .slice(1)
  .map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d.getDay()];
  });

const WEEK_LABELS = Array.from({ length: 8 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (7 - i) * 7);
  return i === 7 ? "Now" : `W${i + 1}`;
});

function StatCard({ value, label, color, icon }: { value: string; label: string; color: string; icon: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIconWrap, { backgroundColor: color + "22" }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {children}
    </View>
  );
}

export default function InsightsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, categories } = useLibrary();

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const stats = useMemo(() => computeStats(items, categories), [items, categories]);
  const insights = useMemo(() => generateInsights(stats, items, categories), [stats, items, categories]);

  const completionPct = Math.round(stats.completionRate * 100);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topInset + 16,
          paddingBottom: Platform.OS === "web" ? 34 + 84 + 16 : insets.bottom + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>Insights</Text>
          <Text style={[styles.screenSub, { color: colors.mutedForeground }]}>Your learning overview</Text>
        </View>
        <View style={[styles.streakBadge, { backgroundColor: "#EF444415" }]}>
          <Ionicons name="flame" size={15} color="#EF4444" />
          <Text style={styles.streakText}>{stats.streak}d</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatCard value={String(stats.totalSaved)} label="Total Saved" color={colors.primary} icon="bookmark-outline" />
        <StatCard value={String(stats.totalCompleted)} label="Completed" color="#10B981" icon="checkmark-circle-outline" />
        <StatCard value={String(stats.totalLearning)} label="In Progress" color="#3B82F6" icon="book-outline" />
      </View>

      <SectionCard title="Completion Rate">
        <View style={styles.completionRow}>
          <ProgressRing
            progress={stats.completionRate}
            size={140}
            strokeWidth={14}
            color={colors.primary}
            trackColor={colors.secondary}
            label="done"
          />
          <View style={styles.completionStats}>
            <View style={styles.completionStat}>
              <Text style={[styles.completionStatValue, { color: colors.foreground }]}>{stats.totalCompleted}</Text>
              <Text style={[styles.completionStatLabel, { color: "#10B981" }]}>Completed</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.completionStat}>
              <Text style={[styles.completionStatValue, { color: colors.foreground }]}>{stats.totalLearning}</Text>
              <Text style={[styles.completionStatLabel, { color: "#3B82F6" }]}>Learning</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.completionStat}>
              <Text style={[styles.completionStatValue, { color: colors.foreground }]}>
                {stats.totalSaved - stats.totalCompleted - stats.totalLearning}
              </Text>
              <Text style={[styles.completionStatLabel, { color: colors.mutedForeground }]}>Not started</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.completionStat}>
              <Text style={[styles.completionStatValue, { color: colors.foreground }]}>{stats.totalArchived}</Text>
              <Text style={[styles.completionStatLabel, { color: colors.mutedForeground }]}>Archived</Text>
            </View>
          </View>
        </View>
      </SectionCard>

      {insights.length > 0 && (
        <View>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>AI INSIGHTS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.insightScroll}
          >
            {insights.map((text, i) => (
              <View
                key={i}
                style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.primary + "33" }]}
              >
                <View style={[styles.insightIcon, { backgroundColor: colors.primary + "22" }]}>
                  <Ionicons name={INSIGHT_ICON_MAP[i % 6] as any} size={18} color={colors.primary} />
                </View>
                <Text style={[styles.insightText, { color: colors.foreground }]}>{text}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <SectionCard title="Weekly Activity">
        <Text style={[styles.chartSub, { color: colors.mutedForeground }]}>
          {stats.savesThisWeek} saves in the last 7 days
        </Text>
        <View style={styles.chartWrap}>
          <BarChart
            data={stats.weeklyActivity}
            labels={DAY_LABELS}
            color={colors.primary}
            height={100}
          />
        </View>
      </SectionCard>

      <SectionCard title="Monthly Progress">
        <Text style={[styles.chartSub, { color: colors.mutedForeground }]}>
          {stats.savesThisMonth} saves in the last 30 days
        </Text>
        <View style={styles.chartWrap}>
          <BarChart
            data={stats.monthlyActivity}
            labels={WEEK_LABELS}
            color="#F59E0B"
            height={100}
          />
        </View>
      </SectionCard>

      <SectionCard title="Learning Heatmap">
        <Text style={[styles.chartSub, { color: colors.mutedForeground }]}>
          Last 7 weeks of activity
        </Text>
        <View style={styles.chartWrap}>
          <ActivityHeatmap data={stats.heatmapData} color={colors.primary} />
        </View>
      </SectionCard>

      {stats.categoryDistribution.length > 0 && (
        <SectionCard title="Category Distribution">
          <View style={styles.distList}>
            {stats.categoryDistribution.map(({ category, count, percentage }) => (
              <View key={category.id} style={styles.distRow}>
                <View style={[styles.distDot, { backgroundColor: category.color }]} />
                <Text style={[styles.distName, { color: colors.foreground }]} numberOfLines={1}>
                  {category.name}
                </Text>
                <View style={styles.distBarWrap}>
                  <View
                    style={[
                      styles.distBar,
                      { backgroundColor: category.color, width: `${Math.max(percentage * 100, 4)}%` },
                    ]}
                  />
                </View>
                <Text style={[styles.distCount, { color: colors.mutedForeground }]}>{count}</Text>
              </View>
            ))}
          </View>
        </SectionCard>
      )}

      <View style={styles.quickStats}>
        <View style={[styles.quickStatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="pricetag-outline" size={20} color={colors.accent} />
          <Text style={[styles.quickStatValue, { color: colors.foreground }]}>{stats.totalTags}</Text>
          <Text style={[styles.quickStatLabel, { color: colors.mutedForeground }]}>Tags used</Text>
        </View>
        <View style={[styles.quickStatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="time-outline" size={20} color="#8B5CF6" />
          <Text style={[styles.quickStatValue, { color: colors.foreground }]}>{stats.estimatedHours}h</Text>
          <Text style={[styles.quickStatLabel, { color: colors.mutedForeground }]}>Est. learned</Text>
        </View>
        <View style={[styles.quickStatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="trophy-outline" size={20} color="#F59E0B" />
          <Text style={[styles.quickStatValue, { color: colors.foreground }]}>{stats.completedThisWeek}</Text>
          <Text style={[styles.quickStatLabel, { color: colors.mutedForeground }]}>Done this wk</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  screenTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  screenSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#EF4444" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    alignItems: "flex-start",
  },
  statIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  completionRow: { flexDirection: "row", alignItems: "center", gap: 20 },
  completionStats: { flex: 1, gap: 10 },
  completionStat: { gap: 2 },
  completionStatValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  completionStatLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  divider: { height: 1 },
  label: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 10 },
  insightScroll: { gap: 12, paddingRight: 16 },
  insightCard: {
    width: 220,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  insightIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  insightText: { fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 20 },
  chartSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: -4 },
  chartWrap: { alignItems: "center" },
  distList: { gap: 12 },
  distRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  distDot: { width: 8, height: 8, borderRadius: 4 },
  distName: { width: 80, fontSize: 13, fontFamily: "Inter_500Medium" },
  distBarWrap: { flex: 1, height: 8, backgroundColor: "#1E293B", borderRadius: 4, overflow: "hidden" },
  distBar: { height: 8, borderRadius: 4 },
  distCount: { fontSize: 13, fontFamily: "Inter_600SemiBold", width: 28, textAlign: "right" },
  quickStats: { flexDirection: "row", gap: 10, marginBottom: 8 },
  quickStatCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  quickStatValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  quickStatLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
});
