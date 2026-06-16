import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const PLANS = [
  {
    id: "monthly",
    label: "Monthly",
    price: "$2.99",
    per: "/ month",
    subtext: "Billed monthly",
    note: null,
    highlight: false,
  },
  {
    id: "yearly",
    label: "Yearly",
    price: "$24.99",
    per: "/ year",
    subtext: "$2.08 / month",
    note: "Save 30%",
    highlight: true,
  },
  {
    id: "lifetime",
    label: "Lifetime",
    price: "$44.99",
    per: "once",
    subtext: "Pay once, own forever",
    note: "Best Value",
    highlight: false,
  },
];

const FREE_FEATURES = [
  { icon: "bookmark-outline" as const, color: "#6366F1", text: "Save unlimited links & videos" },
  { icon: "grid-outline" as const, color: "#6366F1", text: "Up to 5 custom categories" },
  { icon: "search-outline" as const, color: "#6366F1", text: "Basic search" },
  { icon: "bar-chart-outline" as const, color: "#6366F1", text: "Basic progress tracking" },
];

const PREMIUM_NOW = [
  {
    icon: "cloud-outline" as const,
    color: "#6366F1",
    title: "Cloud Backup",
    description: "Your library safely backed up. Never lose your saved content.",
  },
  {
    icon: "phone-portrait-outline" as const,
    color: "#8B5CF6",
    title: "Cross-Device Sync",
    description: "Access your library on any phone or tablet, instantly synced.",
  },
  {
    icon: "albums-outline" as const,
    color: "#A855F7",
    title: "Unlimited Categories",
    description: "Organize without limits — as many custom categories as you need.",
  },
  {
    icon: "options-outline" as const,
    color: "#EC4899",
    title: "Advanced Filters",
    description: "Filter by date, status, platform, category, and more.",
  },
  {
    icon: "download-outline" as const,
    color: "#10B981",
    title: "Export Library",
    description: "Export your full library as JSON, CSV, or PDF anytime.",
  },
];

const PREMIUM_SOON = [
  {
    icon: "sparkles-outline" as const,
    color: "#F59E0B",
    title: "AI Auto-Categorization",
    description: "AI reads your saved links and sorts them into the right categories automatically.",
  },
  {
    icon: "document-text-outline" as const,
    color: "#F97316",
    title: "AI Summaries",
    description: "Get a quick AI-written summary of any video or article you save.",
  },
  {
    icon: "bulb-outline" as const,
    color: "#EF4444",
    title: "AI Learning Recommendations",
    description: "Personalized suggestions based on what you're learning and your goals.",
  },
  {
    icon: "search-circle-outline" as const,
    color: "#22D3EE",
    title: "Smart Search",
    description: "Search inside video transcripts and article content, not just titles.",
  },
];

export default function PremiumScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 20 : insets.top;
  const [selectedPlan, setSelectedPlan] = useState<string>("yearly");

  function handleUpgrade() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  const selected = PLANS.find((p) => p.id === selectedPlan)!;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.closeBtn, { top: topInset + 12 }]}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={22} color={colors.mutedForeground} />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset + 52, paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* Hero */}
        <LinearGradient
          colors={["#6366F1", "#A855F7", "#EC4899"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBadge}
        >
          <Ionicons name="diamond" size={28} color="#FFFFFF" />
        </LinearGradient>

        <Text style={[styles.heroTitle, { color: colors.foreground }]}>
          SkillSee <Text style={styles.heroAccent}>Premium</Text>
        </Text>
        <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
          Affordable for students. Powerful for everyone.
        </Text>

        {/* Plan selector */}
        <View style={styles.planRow}>
          {PLANS.map((plan) => {
            const active = selectedPlan === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  { backgroundColor: colors.card, borderColor: active ? colors.primary : colors.border },
                  active && styles.planCardActive,
                ]}
                onPress={() => {
                  setSelectedPlan(plan.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.85}
              >
                {plan.note && (
                  <View style={[styles.noteBadge, { backgroundColor: plan.id === "yearly" ? "#10B981" : "#F59E0B" }]}>
                    <Text style={styles.noteBadgeText}>{plan.note}</Text>
                  </View>
                )}
                <Text style={[styles.planLabel, { color: active ? colors.primary : colors.mutedForeground }]}>
                  {plan.label}
                </Text>
                <Text style={[styles.planPrice, { color: colors.foreground }]}>{plan.price}</Text>
                <Text style={[styles.planPer, { color: colors.mutedForeground }]}>{plan.per}</Text>
                <Text style={[styles.planSubtext, { color: colors.mutedForeground }]}>{plan.subtext}</Text>
                {active && (
                  <View style={[styles.checkDot, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Free tier */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.tierBadge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.tierBadgeText, { color: colors.mutedForeground }]}>FREE</Text>
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Always included</Text>
          </View>
          {FREE_FEATURES.map((f) => (
            <View key={f.text} style={styles.simpleRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={[styles.simpleText, { color: colors.mutedForeground }]}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Premium now */}
        <View style={styles.sectionHeader}>
          <LinearGradient colors={["#6366F1", "#A855F7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.tierBadgePremium}>
            <Text style={styles.tierBadgeTextPremium}>PREMIUM</Text>
          </LinearGradient>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Available now</Text>
        </View>
        <View style={[styles.featuresList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {PREMIUM_NOW.map((feat, i) => (
            <View
              key={feat.title}
              style={[
                styles.featureRow,
                { borderBottomColor: colors.border },
                i === PREMIUM_NOW.length - 1 && styles.featureRowLast,
              ]}
            >
              <View style={[styles.featureIcon, { backgroundColor: feat.color + "18" }]}>
                <Ionicons name={feat.icon} size={20} color={feat.color} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.foreground }]}>{feat.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>{feat.description}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            </View>
          ))}
        </View>

        {/* AI features coming soon */}
        <View style={styles.sectionHeader}>
          <View style={[styles.tierBadgeAI, { backgroundColor: "#F59E0B22" }]}>
            <Ionicons name="sparkles" size={10} color="#F59E0B" />
            <Text style={[styles.tierBadgeAIText, { color: "#F59E0B" }]}>AI · COMING SOON</Text>
          </View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Included when ready</Text>
        </View>
        <View style={[styles.featuresList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {PREMIUM_SOON.map((feat, i) => (
            <View
              key={feat.title}
              style={[
                styles.featureRow,
                { borderBottomColor: colors.border },
                i === PREMIUM_SOON.length - 1 && styles.featureRowLast,
              ]}
            >
              <View style={[styles.featureIcon, { backgroundColor: feat.color + "18" }]}>
                <Ionicons name={feat.icon} size={20} color={feat.color} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.foreground }]}>{feat.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>{feat.description}</Text>
              </View>
              <Ionicons name="time-outline" size={18} color={colors.mutedForeground} />
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity onPress={handleUpgrade} activeOpacity={0.85} style={styles.ctaWrap}>
          <LinearGradient
            colors={["#6366F1", "#A855F7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Ionicons name="diamond-outline" size={18} color="#FFFFFF" />
            <Text style={styles.ctaBtnText}>
              Start Premium · {selected.price} {selected.id === "lifetime" ? "lifetime" : selected.per}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.legalText, { color: colors.mutedForeground }]}>
          {selected.id !== "lifetime"
            ? "Cancel anytime. Renews automatically."
            : "One-time payment. No subscription, no renewal."}{"\n"}
          Secure payment via App Store or Google Play · Prices in USD.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtn: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingHorizontal: 20, gap: 18, alignItems: "center" },

  heroBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.8, textAlign: "center" },
  heroAccent: { color: "#A855F7" },
  heroSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, marginBottom: 2 },

  planRow: { flexDirection: "row", gap: 10, alignSelf: "stretch" },
  planCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 2,
    position: "relative",
  },
  planCardActive: { shadowColor: "#6366F1", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  noteBadge: {
    position: "absolute",
    top: -10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  noteBadgeText: { color: "#FFFFFF", fontSize: 9, fontFamily: "Inter_700Bold" },
  planLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  planPrice: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 2 },
  planPer: { fontSize: 10, fontFamily: "Inter_400Regular" },
  planSubtext: { fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center" },
  checkDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  section: { alignSelf: "stretch", borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "stretch" },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  tierBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tierBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  tierBadgePremium: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tierBadgeTextPremium: { color: "#FFFFFF", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  tierBadgeAI: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tierBadgeAIText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },

  simpleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  simpleText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },

  featuresList: { alignSelf: "stretch", borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: 1 },
  featureRowLast: { borderBottomWidth: 0 },
  featureIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  featureText: { flex: 1, gap: 2 },
  featureTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  featureDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },

  ctaWrap: { alignSelf: "stretch" },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
    borderRadius: 16,
  },
  ctaBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_700Bold" },

  legalText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 17,
    marginTop: -6,
  },
});
