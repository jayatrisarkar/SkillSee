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

const FEATURES = [
  {
    icon: "cloud-outline" as const,
    color: "#6366F1",
    title: "Cloud Sync",
    description: "Your library backed up and synced across all your devices automatically.",
    badge: null,
  },
  {
    icon: "sparkles-outline" as const,
    color: "#A855F7",
    title: "AI Features",
    description: "Smart auto-categorization, content summaries, and personalized learning paths.",
    badge: "Coming Soon",
  },
  {
    icon: "albums-outline" as const,
    color: "#EC4899",
    title: "Advanced Organization",
    description: "Unlimited categories, nested folders, custom tags, and powerful filters.",
    badge: null,
  },
  {
    icon: "analytics-outline" as const,
    color: "#10B981",
    title: "Deep Insights",
    description: "Detailed progress reports, learning trends, and weekly skill reports.",
    badge: "Coming Soon",
  },
  {
    icon: "people-outline" as const,
    color: "#F59E0B",
    title: "Shared Playlists",
    description: "Collaborate and share curated playlists with friends, teams, or followers.",
    badge: "Coming Soon",
  },
  {
    icon: "download-outline" as const,
    color: "#22D3EE",
    title: "Export & Backup",
    description: "Export your full library to JSON, CSV, or PDF anytime.",
    badge: null,
  },
];

const PLANS = [
  {
    id: "monthly",
    label: "Monthly",
    price: "$4.99",
    per: "/ month",
    note: null,
    highlight: false,
  },
  {
    id: "annual",
    label: "Annual",
    price: "$29.99",
    per: "/ year",
    note: "Save 50%",
    highlight: true,
  },
];

export default function PremiumScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 20 : insets.top;
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");

  function handleUpgrade() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Close button */}
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
          SkillSee{" "}
          <Text style={styles.heroTitleGradient}>Premium</Text>
        </Text>
        <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
          Level up your learning. Unlock everything.
        </Text>

        {/* Plan selector */}
        <View style={[styles.planRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          {PLANS.map((plan) => {
            const active = selectedPlan === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planBtn,
                  active && styles.planBtnActive,
                  active && { backgroundColor: colors.primary },
                ]}
                onPress={() => {
                  setSelectedPlan(plan.id as "monthly" | "annual");
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.85}
              >
                {plan.note && (
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>{plan.note}</Text>
                  </View>
                )}
                <Text style={[styles.planLabel, { color: active ? "#FFFFFF" : colors.mutedForeground }]}>
                  {plan.label}
                </Text>
                <Text style={[styles.planPrice, { color: active ? "#FFFFFF" : colors.foreground }]}>
                  {plan.price}
                </Text>
                <Text style={[styles.planPer, { color: active ? "#FFFFFF99" : colors.mutedForeground }]}>
                  {plan.per}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Features */}
        <Text style={[styles.featuresLabel, { color: colors.mutedForeground }]}>WHAT YOU GET</Text>
        <View style={[styles.featuresList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {FEATURES.map((feat, i) => (
            <View
              key={feat.title}
              style={[
                styles.featureRow,
                { borderBottomColor: colors.border },
                i === FEATURES.length - 1 && styles.featureRowLast,
              ]}
            >
              <View style={[styles.featureIcon, { backgroundColor: feat.color + "18" }]}>
                <Ionicons name={feat.icon} size={20} color={feat.color} />
              </View>
              <View style={styles.featureText}>
                <View style={styles.featureTitleRow}>
                  <Text style={[styles.featureTitle, { color: colors.foreground }]}>{feat.title}</Text>
                  {feat.badge && (
                    <View style={[styles.comingSoonBadge, { backgroundColor: colors.primary + "22" }]}>
                      <Text style={[styles.comingSoonText, { color: colors.primary }]}>{feat.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>
                  {feat.description}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
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
              Upgrade to Premium ·{" "}
              {selectedPlan === "annual" ? "$29.99/yr" : "$4.99/mo"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.legalText, { color: colors.mutedForeground }]}>
          Cancel anytime. Secure payment via App Store or Google Play.{"\n"}
          Prices shown in USD.
        </Text>

        {/* Free tier reminder */}
        <View style={[styles.freeCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Ionicons name="checkmark-outline" size={16} color={colors.mutedForeground} />
          <Text style={[styles.freeCardText, { color: colors.mutedForeground }]}>
            Free plan keeps all your current saves — upgrade to unlock the rest.
          </Text>
        </View>
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
  content: { paddingHorizontal: 20, gap: 20, alignItems: "center" },

  heroBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroTitle: { fontSize: 30, fontFamily: "Inter_700Bold", letterSpacing: -0.8, textAlign: "center" },
  heroTitleGradient: { color: "#A855F7" },
  heroSubtitle: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 4 },

  planRow: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    padding: 6,
    gap: 6,
    alignSelf: "stretch",
  },
  planBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 2,
    position: "relative",
  },
  planBtnActive: { shadowColor: "#6366F1", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBadge: {
    position: "absolute",
    top: -10,
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  saveBadgeText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Inter_700Bold" },
  planLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  planPrice: { fontSize: 22, fontFamily: "Inter_700Bold" },
  planPer: { fontSize: 11, fontFamily: "Inter_400Regular" },

  featuresLabel: {
    alignSelf: "flex-start",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
  },
  featuresList: {
    alignSelf: "stretch",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
  },
  featureRowLast: { borderBottomWidth: 0 },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { flex: 1, gap: 2 },
  featureTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  comingSoonBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  comingSoonText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
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
  ctaBtnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },

  legalText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 17,
    marginTop: -8,
  },
  freeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "stretch",
  },
  freeCardText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
