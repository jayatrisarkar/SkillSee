import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { PurchasesPackage } from "react-native-purchases";

import { useColors } from "@/hooks/useColors";
import { useSubscription } from "@/lib/revenuecat";
import { ConfirmModal } from "@/components/ConfirmModal";

// ── Feature definitions ──────────────────────────────────────────────────────

interface FeatureDef {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  title: string;
  description: string;
  free: boolean;
}

const FEATURES: FeatureDef[] = [
  {
    icon: "albums-outline",
    color: "#6366F1",
    title: "Unlimited Categories",
    description: "Create as many categories as you need with no cap.",
    free: false,
  },
  {
    icon: "color-palette-outline",
    color: "#A855F7",
    title: "Premium Customization",
    description: "Pick any icon and any color for every category.",
    free: false,
  },
  {
    icon: "cloud-outline",
    color: "#22D3EE",
    title: "Cloud Backup",
    description: "Your library backed up and synced across devices.",
    free: false,
  },
  {
    icon: "options-outline",
    color: "#EC4899",
    title: "Advanced Filters",
    description: "Filter by date, status, platform, category, and more.",
    free: false,
  },
  {
    icon: "sparkles-outline",
    color: "#F59E0B",
    title: "Future AI Tools",
    description: "Auto-categorization, smart summaries, and AI recommendations.",
    free: false,
  },
];

const FREE_FEATURES = [
  { icon: "bookmark-outline" as const, text: "Unlimited saved links" },
  { icon: "create-outline" as const, text: "Notes on every link" },
  { icon: "search-outline" as const, text: "Search your library" },
  { icon: "school-outline" as const, text: "Learning & Completed status" },
  { icon: "sunny-outline" as const, text: "Dark & Light mode" },
  { icon: "albums-outline" as const, text: "Up to 10 categories" },
];

// ── Screen ────────────────────────────────────────────────────────────────────

type PlanKey = "monthly" | "yearly";

export default function PremiumScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 20 : insets.top;

  const { offerings, isSubscribed, purchase, restore, isPurchasing, isRestoring, isLoading } =
    useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("yearly");
  const [confirmPkg, setConfirmPkg] = useState<PurchasesPackage | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const monthlyPkg = offerings?.current?.availablePackages.find(
    (p) => (p.identifier as string) === "$rc_monthly"
  ) ?? null;

  const yearlyPkg = offerings?.current?.availablePackages.find(
    (p) => (p.identifier as string) === "$rc_annual"
  ) ?? null;

  const activePkg = selectedPlan === "yearly" ? yearlyPkg : monthlyPkg;
  const monthlyPrice = monthlyPkg?.product.priceString ?? "$1.99";
  const yearlyPrice = yearlyPkg?.product.priceString ?? "$14.99";
  const ctaLabel =
    selectedPlan === "yearly"
      ? `Upgrade for ${yearlyPrice}/year`
      : `Upgrade for ${monthlyPrice}/month`;

  async function handlePurchase() {
    if (!activePkg) {
      setErrorMsg("Subscription not available right now. Please try again later.");
      return;
    }
    if (__DEV__) {
      setConfirmPkg(activePkg);
      return;
    }
    await doPurchase(activePkg);
  }

  async function doPurchase(pkg: PurchasesPackage) {
    try {
      setErrorMsg(null);
      await purchase(pkg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccessVisible(true);
    } catch (e: any) {
      if (e?.userCancelled) return;
      setErrorMsg(e?.message ?? "Purchase failed. Please try again.");
    }
  }

  async function handleRestore() {
    try {
      setErrorMsg(null);
      await restore();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Restore failed. Please try again.");
    }
  }

  // ── Already subscribed ──────────────────────────────────────────────────────
  if (isSubscribed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.closeBtn, { top: topInset + 12 }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={22} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View style={styles.subscribedWrap}>
          <LinearGradient
            colors={["#6366F1", "#A855F7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBadge}
          >
            <Ionicons name="diamond" size={28} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            You're{" "}
            <Text style={styles.heroAccent}>Premium</Text>
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
            All features are unlocked. Thank you for supporting SkillSee!
          </Text>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85} style={styles.ctaWrap}>
            <LinearGradient
              colors={["#6366F1", "#A855F7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaBtn}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.ctaBtnText}>Back to App</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Main paywall ────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Dev-mode test purchase confirmation */}
      <ConfirmModal
        visible={!!confirmPkg}
        title="Test Purchase"
        message={`Simulate buying:\n\n${confirmPkg?.product.title ?? "Premium"} — ${confirmPkg?.product.priceString ?? (selectedPlan === "yearly" ? yearlyPrice : monthlyPrice)}`}
        actions={[
          {
            label: "Confirm Purchase",
            primary: true,
            onPress: () => {
              const pkg = confirmPkg!;
              setConfirmPkg(null);
              doPurchase(pkg);
            },
          },
          { label: "Cancel", onPress: () => setConfirmPkg(null) },
        ]}
        onDismiss={() => setConfirmPkg(null)}
      />

      {/* Success */}
      <ConfirmModal
        visible={successVisible}
        title="Welcome to Premium! 🎉"
        message="Your subscription is active. All features are now unlocked."
        actions={[
          {
            label: "Let's go!",
            primary: true,
            onPress: () => { setSuccessVisible(false); router.back(); },
          },
        ]}
        onDismiss={() => { setSuccessVisible(false); router.back(); }}
      />

      {/* Error */}
      <ConfirmModal
        visible={!!errorMsg}
        title="Something went wrong"
        message={errorMsg ?? ""}
        actions={[{ label: "OK", onPress: () => setErrorMsg(null) }]}
        onDismiss={() => setErrorMsg(null)}
      />

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
          <Text style={styles.heroAccent}>Premium</Text>
        </Text>
        <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
          Organize your learning without limits.
        </Text>

        {/* Plan selector */}
        <View style={[styles.planSelector, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Yearly option */}
          <TouchableOpacity
            onPress={() => setSelectedPlan("yearly")}
            activeOpacity={0.8}
            style={[
              styles.planOption,
              selectedPlan === "yearly" && styles.planOptionActive,
              selectedPlan === "yearly" && { borderColor: "#6366F1" },
            ]}
          >
            <View style={styles.planTopRow}>
              <View style={styles.planRadioWrap}>
                <View style={[styles.planRadioOuter, { borderColor: selectedPlan === "yearly" ? "#6366F1" : colors.mutedForeground }]}>
                  {selectedPlan === "yearly" && <View style={styles.planRadioInner} />}
                </View>
                <Text style={[styles.planLabel, { color: colors.foreground }]}>Yearly</Text>
              </View>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>Save 37%</Text>
              </View>
            </View>
            <Text style={[styles.planPrice, { color: colors.foreground }]}>
              {isLoading ? "—" : yearlyPrice}
              <Text style={[styles.planPricePer, { color: colors.mutedForeground }]}>/year</Text>
            </Text>
            <Text style={[styles.planSub, { color: colors.mutedForeground }]}>
              ~$1.25/month · Best value
            </Text>
          </TouchableOpacity>

          <View style={[styles.planDivider, { backgroundColor: colors.border }]} />

          {/* Monthly option */}
          <TouchableOpacity
            onPress={() => setSelectedPlan("monthly")}
            activeOpacity={0.8}
            style={[
              styles.planOption,
              selectedPlan === "monthly" && styles.planOptionActive,
              selectedPlan === "monthly" && { borderColor: "#6366F1" },
            ]}
          >
            <View style={styles.planRadioWrap}>
              <View style={[styles.planRadioOuter, { borderColor: selectedPlan === "monthly" ? "#6366F1" : colors.mutedForeground }]}>
                {selectedPlan === "monthly" && <View style={styles.planRadioInner} />}
              </View>
              <Text style={[styles.planLabel, { color: colors.foreground }]}>Monthly</Text>
            </View>
            <Text style={[styles.planPrice, { color: colors.foreground }]}>
              {isLoading ? "—" : monthlyPrice}
              <Text style={[styles.planPricePer, { color: colors.mutedForeground }]}>/month</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Premium features */}
        <View style={styles.sectionHeader}>
          <LinearGradient
            colors={["#6366F1", "#A855F7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.premiumBadge}
          >
            <Text style={styles.premiumBadgeText}>PREMIUM</Text>
          </LinearGradient>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Everything unlocked</Text>
        </View>

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
                <Text style={[styles.featureTitle, { color: colors.foreground }]}>{feat.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>{feat.description}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            </View>
          ))}
        </View>

        {/* Free tier */}
        <View style={styles.sectionHeader}>
          <View style={[styles.freeBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.freeBadgeText, { color: colors.mutedForeground }]}>FREE</Text>
          </View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Always included</Text>
        </View>

        <View style={[styles.freeList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {FREE_FEATURES.map((f, i) => (
            <View
              key={f.text}
              style={[
                styles.freeRow,
                { borderBottomColor: colors.border },
                i === FREE_FEATURES.length - 1 && styles.featureRowLast,
              ]}
            >
              <Ionicons name={f.icon} size={17} color={colors.mutedForeground} />
              <Text style={[styles.freeText, { color: colors.mutedForeground }]}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={handlePurchase}
          activeOpacity={0.85}
          style={styles.ctaWrap}
          disabled={isPurchasing || isRestoring}
        >
          <LinearGradient
            colors={["#6366F1", "#A855F7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="diamond-outline" size={18} color="#FFFFFF" />
                <Text style={styles.ctaBtnText}>
                  {isLoading ? "Loading…" : ctaLabel}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.legalText, { color: colors.mutedForeground }]}>
          Cancel anytime. Renews automatically each month.{"\n"}
          Payment via App Store or Google Play · Prices in USD.
        </Text>

        <TouchableOpacity
          onPress={handleRestore}
          disabled={isRestoring}
          activeOpacity={0.7}
          style={styles.restoreBtn}
        >
          {isRestoring ? (
            <ActivityIndicator color={colors.mutedForeground} size="small" />
          ) : (
            <Text style={[styles.restoreText, { color: colors.mutedForeground }]}>
              Restore purchases
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

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
  subscribedWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },

  heroBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
    textAlign: "center",
  },
  heroAccent: { color: "#A855F7" },
  heroSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },

  planSelector: {
    alignSelf: "stretch",
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  planOption: {
    padding: 16,
    gap: 4,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    margin: 4,
  },
  planOptionActive: {
    backgroundColor: "#6366F108",
  },
  planTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planRadioWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  planRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  planRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#6366F1",
  },
  planLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  planPrice: { fontSize: 22, fontFamily: "Inter_700Bold", marginLeft: 30 },
  planPricePer: { fontSize: 13, fontFamily: "Inter_400Regular" },
  planSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginLeft: 30 },
  planDivider: { height: 1, marginHorizontal: 12 },
  saveBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  saveBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "stretch",
  },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  premiumBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  premiumBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  freeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  freeBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },

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
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { flex: 1, gap: 2 },
  featureTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  featureDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },

  freeList: {
    alignSelf: "stretch",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  freeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  freeText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },

  ctaWrap: { alignSelf: "stretch", marginTop: 4 },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
    borderRadius: 16,
    minHeight: 58,
  },
  ctaBtnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },

  legalText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 17,
    marginTop: -4,
  },
  restoreBtn: { paddingVertical: 8 },
  restoreText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textDecorationLine: "underline",
  },
});
