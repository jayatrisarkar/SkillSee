import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AchievementBadge } from "@/components/AchievementBadge";
import { useLibrary } from "@/context/LibraryContext";
import { useProfile } from "@/context/ProfileContext";
import { useColors } from "@/hooks/useColors";
import { computeAchievements, computeStats } from "@/utils/insights";

interface SettingRowProps {
  icon: string;
  label: string;
  color?: string;
  onPress?: () => void;
  value?: string;
  destructive?: boolean;
}

function SettingRow({ icon, label, color, onPress, value, destructive }: SettingRowProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIconWrap, { backgroundColor: (color ?? colors.mutedForeground) + "22" }]}>
        <Ionicons name={icon as any} size={18} color={color ?? colors.mutedForeground} />
      </View>
      <Text style={[styles.settingLabel, { color: destructive ? colors.destructive : colors.foreground }]}>
        {label}
      </Text>
      {value ? (
        <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>{value}</Text>
      ) : null}
      <Ionicons
        name="chevron-forward"
        size={16}
        color={destructive ? colors.destructive : colors.mutedForeground}
      />
    </TouchableOpacity>
  );
}

function StatBubble({ value, label }: { value: string; label: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statBubble, { backgroundColor: colors.secondary }]}>
      <Text style={[styles.statBubbleValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statBubbleLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, updateProfile } = useProfile();
  const { items, categories } = useLibrary();

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const stats = useMemo(() => computeStats(items, categories), [items, categories]);
  const achievements = useMemo(() => computeAchievements(items, categories), [items, categories]);
  const earnedCount = achievements.filter((a) => a.earned).length;
  const customCats = categories.filter((c) => !c.isDefault);

  async function pickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo access to set a profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      updateProfile({ avatarUri: result.assets[0].uri });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
      <View style={styles.profileHeader}>
        <TouchableOpacity style={styles.avatarWrap} onPress={pickAvatar} activeOpacity={0.8}>
          {profile.avatarUri ? (
            <Image source={{ uri: profile.avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: colors.primary + "33" }]}>
              <Text style={[styles.initials, { color: colors.primary }]}>{initials || "?"}</Text>
            </View>
          )}
          <View style={[styles.cameraBtn, { backgroundColor: colors.primary }]}>
            <Ionicons name="camera" size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <Text style={[styles.profileName, { color: colors.foreground }]}>{profile.name}</Text>
        <Text style={[styles.profileUsername, { color: colors.mutedForeground }]}>{profile.username}</Text>
        {profile.email ? (
          <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>{profile.email}</Text>
        ) : null}
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          onPress={() => router.push("/edit-profile")}
        >
          <Ionicons name="pencil-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.editBtnText, { color: colors.mutedForeground }]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PERSONAL STATISTICS</Text>
      <View style={styles.statsGrid}>
        <StatBubble value={String(stats.totalSaved)} label="Total Saves" />
        <StatBubble value={String(stats.totalCompleted)} label="Completed" />
        <StatBubble value={`${stats.streak}d`} label="Streak" />
        <StatBubble value={String(categories.length)} label="Categories" />
        <StatBubble value={String(customCats.length)} label="Custom Cats" />
        <StatBubble value={`${stats.estimatedHours}h`} label="Est. Learned" />
      </View>

      <View style={[styles.achievementHeader]}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACHIEVEMENTS</Text>
        <Text style={[styles.earnedCount, { color: colors.primary }]}>{earnedCount}/{achievements.length}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeRow}>
        {achievements.map((a) => (
          <AchievementBadge key={a.id} achievement={a} />
        ))}
      </ScrollView>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>MANAGE</Text>
      <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow
          icon="grid-outline"
          label="Manage Categories"
          color={colors.primary}
          onPress={() => router.push("/(tabs)/categories")}
        />
        <SettingRow
          icon="bookmark-outline"
          label="Manage Saved Content"
          color="#F59E0B"
          onPress={() => router.push("/(tabs)/search")}
        />
        <SettingRow
          icon="download-outline"
          label="Export Library"
          color="#10B981"
          onPress={() =>
            Alert.alert("Export Library", "Export as JSON with all your saved content and notes.", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Export",
                onPress: () => Alert.alert("Coming Soon", "Export feature coming in the next update."),
              },
            ])
          }
        />
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SETTINGS</Text>
      <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow
          icon="notifications-outline"
          label="Notification Settings"
          color="#8B5CF6"
          onPress={() => Alert.alert("Coming Soon", "Push notification settings coming soon.")}
        />
        <SettingRow
          icon="moon-outline"
          label="Dark Mode"
          color="#64748B"
          value="On"
          onPress={() => Alert.alert("Dark Mode", "The app uses your system appearance setting.")}
        />
        <SettingRow
          icon="lock-closed-outline"
          label="Privacy Settings"
          color="#64748B"
          onPress={() => Alert.alert("Privacy", "All your data is stored locally on your device.")}
        />
        <SettingRow
          icon="settings-outline"
          label="Account Settings"
          color="#64748B"
          onPress={() => router.push("/edit-profile")}
        />
      </View>

      <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow
          icon="log-out-outline"
          label="Log Out"
          destructive
          onPress={() =>
            Alert.alert("Log Out", "Your data is stored locally. Logging out won't delete it.", [
              { text: "Cancel", style: "cancel" },
              { text: "Log Out", style: "destructive", onPress: () => {} },
            ])
          }
        />
      </View>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>
        Content Library v1.0 · Built with ❤️
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
  profileHeader: { alignItems: "center", paddingVertical: 16, gap: 6 },
  avatarWrap: { position: "relative", marginBottom: 8 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontSize: 32, fontFamily: "Inter_700Bold" },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0D1117",
  },
  profileName: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  profileUsername: { fontSize: 14, fontFamily: "Inter_400Regular" },
  profileEmail: { fontSize: 13, fontFamily: "Inter_400Regular" },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 8,
  },
  editBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: -4,
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statBubble: {
    width: "30%",
    flexGrow: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  statBubbleValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statBubbleLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  achievementHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  earnedCount: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  badgeRow: { gap: 12, paddingVertical: 4 },
  settingsGroup: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  settingIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  settingValue: { fontSize: 13, fontFamily: "Inter_400Regular" },
  version: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 8 },
});
