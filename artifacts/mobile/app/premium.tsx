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

const PREMIUM_FEATURES = [
  { icon: "cloud-outline" as const, color: "#6366F1", title: "Cloud Backup", description: "Your library safely backed up. Never lose your saved content." },
  { icon: "phone-portrait-outline" as const, color: "#8B5CF6", title: "Cross-Device Sync", description: "Access your library on any phone or tablet, instantly synced." },
  { icon: "albums-outline" as const, color: "#A855F7", title: "Unlimited Categories", description: "Organize without limits — as many custom categories as you need." },
  { icon: "options-outline" as const, color: "#EC4899", title: "Advanced Filters", description: "Filter by date, status, platform, category, and more." },
  { icon: "download-outline" as const, color: "#10B981", title: "Export Library", description: "Export your full library as JSON, CSV, or PDF anytime." },
];

const AI_FEATURES = [
  { icon: "sparkles-outline" as const, color: "#F59E0B", title: "AI Auto-Categorization", description: "AI reads your saved links and sorts them automatically." },
  { icon: "document-text-outline" as const, color: "#F97316", title: "AI Summaries", description: "Get a quick AI-written summary of any video or article you save." },
  { icon: "bulb-outline" as const, color: "#EF4444", title: "AI Recommendations", description: "Personalized suggestions based on what you're learning." },
  { icon: "search-circle-outline" as const, color: "#22D3EE", title: "Smart Search", description: "Search inside video transcripts and article content." },
];

const FREE_FEATURES = [
  "Save unlimited links & videos",
  "Up to 5 custom categories",
  "Basic search",
  "Basic progress tracking",
];

// RevenueCat standard package identifiers
const PKG_MONTHLY = "$rc_monthly";
const PKG_ANNUAL = "$rc_annual";

function pkgIsMonthly(pkg: PurchasesPackage) {
  return (pkg.identifier as string) === PKG_MONTHLY;
}
function pkgIsAnnual(pkg: PurchasesPackage) {
  return (pkg.identifier as string) === PKG_ANNUAL;
}

function pkgLabel(pkg: PurchasesPackage): string {
  if (pkgIsMonthly(pkg)) return "Monthly";
  if (pkgIsAnnual(pkg)) return "Yearly";
  return pkg.product.title;
}

function pkgPer(pkg: PurchasesPackage): string {
  if (pkgIsMonthly(pkg)) return "/ month";
  if (pkgIsAnnual(pkg)) return "/ year";
  return "";
}

export default function PremiumScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 20 : insets.top;

  const { offerings, isSubscribed, purchase, restore, isPurchasing, isRestoring, isLoading } =
    useSubscription();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmPkg, setConfirmPkg] = useState<PurchasesPackage | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const packages = offerings?.current?.availablePackages ?? [];

  // Sort: monthly first, then annual, then rest
  const sorted = [...packages].sort((a, b) => {
    const order = [PKG_MONTHLY, PKG_ANNUAL];
    const ai = order.indexOf(a.identifier as string);
    const bi = order.indexOf(b.identifier as string);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const selectedPkg =
    sorted.find((p) => p.identifier === selectedId) ??
    sorted.find((p) => pkgIsAnnual(p)) ??
    sorted[0] ??
    null;

  function savingsLabel(pkg: PurchasesPackage): string | null {
    if (!pkgIsAnnual(pkg)) return null;
    const monthly = sorted.find(pkgIsMonthly);
    if (!monthly) return "Save ~16%";
    const yearlyIfMonthly = monthly.product.price * 12;
    const pct = Math.round(((yearlyIfMonthly - pkg.product.price) / yearlyIfMonthly) * 100);
    return pct > 0 ? `Save ${pct}%` : null;
  }

  function monthlyEquiv(pkg: PurchasesPackage): string | null {
    if (!pkgIsAnnual(pkg)) return null;
    return `$${(pkg.product.price / 12).toFixed(2)} / mo`;
  }

  async function handlePurchase(pkg: PurchasesPackage) {
    if (__DEV__) {
      setConfirmPkg(pkg);
      return;
    }
    await doPurchase(pkg);
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

  // ── Already subscribed ───────────────────────────────────────────────
  if (isSubscribed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={[styles.closeBtn, { top: topInset + 12 }]} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="close" size={22} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View style={styles.alreadyWrap}>
          <LinearGradient colors={["#6366F1", "#A855F7", "#EC4899"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBadge}>
            <Ionicons name="diamond" size={28} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            You're <Text style={styles.heroAccent}>Premium</Text>
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
            All features are unlocked. Thank you for supporting SkillSee!
          </Text>
          <TouchableOpacity style={styles.ctaWrap} onPress={() => router.back()} activeOpacity={0.85}>
            <LinearGradient colors={["#6366F1", "#A855F7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.ctaBtnText}>Back to App</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Dev-mode purchase confirmation */}
      <ConfirmModal
        visible={!!confirmPkg}
        title="Test Purchase"
        message={`This is a test-store purchase.\n\n${confirmPkg?.product.title ?? ""} — ${confirmPkg?.product.priceString ?? ""}`}
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
        message="Your subscription is active. All premium features are now unlocked."
        actions={[{ label: "Let's go!", primary: true, onPress: () => { setSuccessVisible(false); router.back(); } }]}
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

      <TouchableOpacity style={[styles.closeBtn, { top: topInset + 12 }]} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="close" size={22} color={colors.mutedForeground} />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: topInset + 52, paddingBottom: insets.bottom + 40 }]}
      >
        {/* Hero */}
        <LinearGradient colors={["#6366F1", "#A855F7", "#EC4899"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBadge}>
          <Ionicons name="diamond" size={28} color="#FFFFFF" />
        </LinearGradient>
        <Text style={[styles.heroTitle, { color: colors.foreground }]}>
          SkillSee <Text style={styles.heroAccent}>Premium</Text>
        </Text>
        <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
          Affordable for students. Powerful for everyone.
        </Text>

        {/* Plan selector */}
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading plans…</Text>
          </View>
        ) : sorted.length === 0 ? (
          <View style={[styles.noPlansWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="alert-circle-outline" size={22} color={colors.mutedForeground} />
            <Text style={[styles.noPlansText, { color: colors.mutedForeground }]}>Plans unavailable. Check back soon.</Text>
          </View>
        ) : (
          <View style={styles.planRow}>
            {sorted.map((pkg) => {
              const active = selectedPkg?.identifier === pkg.identifier;
              const savings = savingsLabel(pkg);
              const equiv = monthlyEquiv(pkg);
              return (
                <TouchableOpacity
                  key={pkg.identifier as string}
                  style={[
                    styles.planCard,
                    { backgroundColor: colors.card, borderColor: active ? "#6366F1" : colors.border },
                    active && styles.planCardActive,
                  ]}
                  onPress={() => {
                    setSelectedId(pkg.identifier as string);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.85}
                >
                  {savings && (
                    <View style={styles.noteBadge}>
                      <Text style={styles.noteBadgeText}>{savings}</Text>
                    </View>
                  )}
                  <Text style={[styles.planLabel, { color: active ? "#6366F1" : colors.mutedForeground }]}>
                    {pkgLabel(pkg)}
                  </Text>
                  <Text style={[styles.planPrice, { color: colors.foreground }]}>
                    {pkg.product.priceString}
                  </Text>
                  <Text style={[styles.planPer, { color: colors.mutedForeground }]}>
                    {pkgPer(pkg)}
                  </Text>
                  {equiv && (
                    <Text style={[styles.planSubtext, { color: colors.mutedForeground }]}>{equiv}</Text>
                  )}
                  {active && (
                    <View style={styles.checkDot}>
                      <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Free tier */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.tierBadge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.tierBadgeText, { color: colors.mutedForeground }]}>FREE</Text>
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Always included</Text>
          </View>
          {FREE_FEATURES.map((f) => (
            <View key={f} style={styles.simpleRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={[styles.simpleText, { color: colors.mutedForeground }]}>{f}</Text>
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
          {PREMIUM_FEATURES.map((feat, i) => (
            <View key={feat.title} style={[styles.featureRow, { borderBottomColor: colors.border }, i === PREMIUM_FEATURES.length - 1 && styles.featureRowLast]}>
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

        {/* AI coming soon */}
        <View style={styles.sectionHeader}>
          <View style={[styles.tierBadgeAI, { backgroundColor: "#F59E0B22" }]}>
            <Ionicons name="sparkles" size={10} color="#F59E0B" />
            <Text style={[styles.tierBadgeAIText, { color: "#F59E0B" }]}>AI · COMING SOON</Text>
          </View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Included when ready</Text>
        </View>
        <View style={[styles.featuresList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {AI_FEATURES.map((feat, i) => (
            <View key={feat.title} style={[styles.featureRow, { borderBottomColor: colors.border }, i === AI_FEATURES.length - 1 && styles.featureRowLast]}>
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
        {sorted.length > 0 && selectedPkg && (
          <TouchableOpacity
            onPress={() => handlePurchase(selectedPkg)}
            activeOpacity={0.85}
            style={styles.ctaWrap}
            disabled={isPurchasing || isRestoring}
          >
            <LinearGradient colors={["#6366F1", "#A855F7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
              {isPurchasing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="diamond-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.ctaBtnText}>
                    Start Premium · {selectedPkg.product.priceString}
                    {pkgIsMonthly(selectedPkg) ? " / mo" : pkgIsAnnual(selectedPkg) ? " / yr" : ""}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        <Text style={[styles.legalText, { color: colors.mutedForeground }]}>
          Cancel anytime. Renews automatically.{"\n"}
          Secure payment via App Store or Google Play · Prices in USD.
        </Text>

        <TouchableOpacity onPress={handleRestore} disabled={isRestoring} activeOpacity={0.7} style={styles.restoreBtn}>
          {isRestoring ? (
            <ActivityIndicator color={colors.mutedForeground} size="small" />
          ) : (
            <Text style={[styles.restoreText, { color: colors.mutedForeground }]}>Restore purchases</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtn: { position: "absolute", right: 16, zIndex: 10, width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 20, gap: 18, alignItems: "center" },
  alreadyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 },

  heroBadge: { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  heroTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.8, textAlign: "center" },
  heroAccent: { color: "#A855F7" },
  heroSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, marginBottom: 2 },

  loadingWrap: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 20 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  noPlansWrap: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, borderRadius: 14, borderWidth: 1, alignSelf: "stretch" },
  noPlansText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },

  planRow: { flexDirection: "row", gap: 10, alignSelf: "stretch" },
  planCard: { flex: 1, alignItems: "center", paddingVertical: 14, paddingHorizontal: 6, borderRadius: 14, borderWidth: 1.5, gap: 2, position: "relative" },
  planCardActive: { shadowColor: "#6366F1", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  noteBadge: { position: "absolute", top: -10, backgroundColor: "#10B981", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  noteBadgeText: { color: "#FFFFFF", fontSize: 9, fontFamily: "Inter_700Bold" },
  planLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  planPrice: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 2 },
  planPer: { fontSize: 10, fontFamily: "Inter_400Regular" },
  planSubtext: { fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center" },
  checkDot: { position: "absolute", top: 8, right: 8, width: 16, height: 16, borderRadius: 8, backgroundColor: "#6366F1", alignItems: "center", justifyContent: "center" },

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
  ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 18, borderRadius: 16, minHeight: 58 },
  ctaBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_700Bold" },

  legalText: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 17, marginTop: -6 },
  restoreBtn: { paddingVertical: 8 },
  restoreText: { fontSize: 13, fontFamily: "Inter_400Regular", textDecorationLine: "underline" },
});
