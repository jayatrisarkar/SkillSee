import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLibrary } from "@/context/LibraryContext";
import { useColors } from "@/context/ThemeContext";

const PROFILE_KEY = "@library:profile";
const ONBOARDED_KEY = "@skillflow:onboarded";
const NOTIF_KEY = "@skillflow:notif_enabled";
const THEME_KEY = "@skillflow:theme";

export default function PrivacyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, categories, clearAllItems, resetCategories } = useLibrary();
  const [isClearing, setIsClearing] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  async function handleClearContent() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Clear All Content",
      `This will permanently delete all ${items.length} saved item${items.length !== 1 ? "s" : ""}. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            setIsClearing(true);
            await clearAllItems();
            setIsClearing(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Done", "All saved content has been cleared.");
          },
        },
      ]
    );
  }

  async function handleResetCategories() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Reset Categories",
      "This will restore the default categories. Custom categories will be removed, and items in those categories will be deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetCategories();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Done", "Categories have been reset to defaults.");
          },
        },
      ]
    );
  }

  async function handleClearProfile() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Reset Profile",
      "This will clear your name, avatar, and preferences. Your saved content will not be affected.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.multiRemove([PROFILE_KEY, NOTIF_KEY, THEME_KEY]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Done", "Profile and preferences have been reset.");
          },
        },
      ]
    );
  }

  async function handleDeleteEverything() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Delete Everything",
      "This will erase ALL your data — content, categories, profile, and settings. You'll start fresh. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: async () => {
            setIsClearing(true);
            await AsyncStorage.clear();
            setIsClearing(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Done", "All data has been erased. Restart the app to see changes.", [
              { text: "OK", onPress: () => router.replace("/") },
            ]);
          },
        },
      ]
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.foreground }]}>Privacy & Data</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Info banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>Your data stays on your device</Text>
            <Text style={[styles.infoBody, { color: colors.mutedForeground }]}>
              SkillFlow stores everything locally. Nothing is synced to a server or shared externally.
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <StatPill label="Saved Items" value={String(items.length)} color={colors.primary} />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <StatPill label="Categories" value={String(categories.length)} color="#A855F7" />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <StatPill
            label="Completed"
            value={String(items.filter((i) => i.status === "completed").length)}
            color="#10B981"
          />
        </View>

        {/* Data management */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DATA MANAGEMENT</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ActionRow
            icon="trash-outline"
            iconColor="#EF4444"
            label="Clear Saved Content"
            subtitle={`Remove all ${items.length} saved items`}
            onPress={handleClearContent}
            destructive
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ActionRow
            icon="refresh-outline"
            iconColor="#F59E0B"
            label="Reset Categories"
            subtitle="Restore default categories"
            onPress={handleResetCategories}
            destructive
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ActionRow
            icon="person-outline"
            iconColor="#64748B"
            label="Reset Profile"
            subtitle="Clear name, avatar & preferences"
            onPress={handleClearProfile}
            destructive
            colors={colors}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DANGER ZONE</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ActionRow
            icon="nuclear-outline"
            iconColor="#EF4444"
            label="Delete Everything"
            subtitle="Erase all app data and start fresh"
            onPress={handleDeleteEverything}
            destructive
            colors={colors}
          />
        </View>

        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>
    </View>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  const colors = useColors();
  return (
    <View style={styles.statPill}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function ActionRow({
  icon,
  iconColor,
  label,
  subtitle,
  onPress,
  destructive,
  colors,
}: {
  icon: string;
  iconColor: string;
  label: string;
  subtitle: string;
  onPress: () => void;
  destructive?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.actionIcon, { backgroundColor: iconColor + "18" }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.actionLabel, { color: destructive ? iconColor : colors.foreground }]}>
          {label}
        </Text>
        <Text style={[styles.actionSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  topTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  scroll: { padding: 16, gap: 12 },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 4,
  },
  infoTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  infoBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  statsRow: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: 4,
  },
  statPill: { flex: 1, alignItems: "center", paddingVertical: 14, gap: 2 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statDivider: { width: StyleSheet.hairlineWidth },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    marginTop: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: 4,
  },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  actionSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
