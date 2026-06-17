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

export default function PremiumScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 20 : insets.top;

  const { offerings, isSubscribed, purchase, restore, isPurchasing, isRestoring, isLoading } =
    useSubscription();

  const [confirmPkg, setConfirmPkg] = useState<PurchasesPackage | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Use monthly package from RevenueCat, fall back to null (price shown from RC or hardcoded)
  const monthlyPkg = offerings?.current?.availablePackages.find(
    (p) => (p.identifier as string) === "$rc_monthly"
  ) ?? null;

  const displayPrice = monthlyPkg?.product.priceString ?? "$1.99";

  async function handlePurchase() {
    if (!monthlyPkg) {
      setErrorMsg("Subscription not available right now. Please try again later.");
      return;
    }
    if (__DEV__) {
      setConfirmPkg(monthlyPkg);
      return;
    }
    await doPurchase(monthlyPkg);
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
        message={`Simulate buying:\n\n${confirmPkg?.product.title ?? "Premium Monthly"} — ${confirmPkg?.product.priceString ?? displayPrice}/month`}
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

        {/* Price chip */}
        <View style={[styles.priceChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.priceChipAmount, { color: colors.foreground }]}>
            {isLoading ? "—" : displayPrice}
          </Text>
          <Text style={[styles.priceChipPer, { color: colors.mutedForeground }]}>/month</Text>
          <View style={styles.priceChipDot} />
          <Text style={[styles.priceChipCancel, { color: colors.mutedForeground }]}>Cancel anytime</Text>
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
                  {isLoading ? "Loading…" : `Upgrade for ${displayPrice}/month`}
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

  priceChip: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  priceChipAmount: { fontSize: 26, fontFamily: "Inter_700Bold" },
  priceChipPer: { fontSize: 14, fontFamily: "Inter_400Regular" },
  priceChipDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#6366F1",
    marginBottom: 4,
    marginHorizontal: 4,
  },
  priceChipCancel: { fontSize: 13, fontFamily: "Inter_400Regular" },

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
