import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AchievementBadge } from "@/components/AchievementBadge";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useLibrary } from "@/context/LibraryContext";
import { useProfile } from "@/context/ProfileContext";
import { type ThemeMode, useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";
import { computeAchievements, computeStats } from "@/utils/insights";
import {
  disableNotifications,
  getNotificationsEnabled,
  requestAndEnableNotifications,
} from "@/utils/notifications";

interface SettingRowProps {
  icon: string;
  label: string;
  color?: string;
  onPress?: () => void;
  value?: string;
  destructive?: boolean;
  right?: React.ReactNode;
}

function SettingRow({ icon, label, color, onPress, value, destructive, right }: SettingRowProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
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
      {right ?? (
        onPress && !right ? (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={destructive ? colors.destructive : colors.mutedForeground}
          />
        ) : null
      )}
    </TouchableOpacity>
  );
}

function StatBubble({ value, label }: { value: string; label: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statBubble, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
      <Text style={[styles.statBubbleValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statBubbleLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const THEME_OPTIONS: { key: ThemeMode; label: string; icon: string }[] = [
  { key: "light", label: "Light", icon: "sunny-outline" },
  { key: "dark", label: "Dark", icon: "moon-outline" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, updateProfile } = useProfile();
  const { items, categories, isSyncing, syncNow } = useLibrary();
  const { themeMode, setThemeMode } = useTheme();
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const [notifEnabled, setNotifEnabled] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    getNotificationsEnabled().then(setNotifEnabled);
  }, []);

  async function handleToggleNotif(val: boolean) {
    if (val) {
      const granted = await requestAndEnableNotifications();
      if (!granted) return; // silently skip on web — no Alert
      setNotifEnabled(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await disableNotifications();
      setNotifEnabled(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  const stats = useMemo(() => computeStats(items, categories), [items, categories]);
  const achievements = useMemo(() => computeAchievements(items, categories), [items, categories]);
  const earnedCount = achievements.filter((a) => a.earned).length;
  const customCats = categories.filter((c) => !c.isDefault);

  async function handleExport() {
    const exportData = {
      exportedAt: new Date().toISOString(),
      app: "SkillSee",
      version: 1,
      profile: { name: profile.name, username: profile.username, email: profile.email },
      categories: categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color })),
      items: items.map((it) => ({
        id: it.id,
        title: it.title,
        url: it.url,
        categoryId: it.categoryId,
        completed: it.status === "completed",
        savedAt: new Date(it.createdAt).toISOString(),
        notes: it.notes ?? "",
      })),
    };
    const json = JSON.stringify(exportData, null, 2);
    const filename = `skillsee-${new Date().toISOString().slice(0, 10)}.json`;

    if (Platform.OS === "web") {
      // Trigger browser file download
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      await Share.share({ message: json, title: "SkillSee Library Export" });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function pickAvatar() {
    // On web, permissions are always granted via browser file picker
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      let uri = result.assets[0].uri;
      // On web, blob: URLs are session-only — convert to base64 data URL so
      // it survives page reloads when stored in AsyncStorage.
      if (Platform.OS === "web" && uri.startsWith("blob:")) {
        try {
          const resp = await fetch(uri);
          const blob = await resp.blob();
          uri = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch {
          // fall back to blob URI if conversion fails
        }
      }
      updateProfile({ avatarUri: uri });
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
    <>
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
      <Text style={[styles.screenTitle, { color: colors.foreground }]}>Profile</Text>

      {/* ── Profile Card ── */}
      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.avatarWrap} onPress={pickAvatar} activeOpacity={0.8}>
          {profile.avatarUri ? (
            <Image source={{ uri: profile.avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: colors.primary + "22" }]}>
              <Text style={[styles.initials, { color: colors.primary }]}>{initials || "?"}</Text>
            </View>
          )}
          <View style={[styles.cameraBtn, { backgroundColor: colors.primary, borderColor: colors.background }]}>
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

      {/* ── Stats ── */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Statistics</Text>
      <View style={styles.statsGrid}>
        <StatBubble value={String(stats.totalSaved)} label="Total Saves" />
        <StatBubble value={String(stats.totalCompleted)} label="Completed" />
        <StatBubble value={`${stats.streak}d`} label="Streak" />
        <StatBubble value={String(categories.length)} label="Categories" />
        <StatBubble value={String(customCats.length)} label="Custom" />
        <StatBubble value={`${stats.estimatedHours}h`} label="Est. Hours" />
      </View>

      {/* ── Achievements ── */}
      <View style={styles.achievementHeader}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Achievements</Text>
        <Text style={[styles.earnedCount, { color: colors.primary }]}>{earnedCount}/{achievements.length}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeRow}>
        {achievements.map((a) => (
          <AchievementBadge key={a.id} achievement={a} />
        ))}
      </ScrollView>

      {/* ── Manage ── */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Manage</Text>
      <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Appearance toggle */}
        <View style={[styles.themeSettingRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.settingIconWrap, { backgroundColor: colors.primary + "22" }]}>
            <Ionicons name="contrast-outline" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.settingLabel, { color: colors.foreground }]}>Appearance</Text>
          <View style={styles.themePills}>
            {THEME_OPTIONS.map((opt) => {
              const isActive =
                themeMode === opt.key || (themeMode === "system" && opt.key === "dark");
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.themePill,
                    {
                      backgroundColor: isActive ? colors.primary : colors.secondary,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => {
                    setThemeMode(opt.key);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={opt.icon as any}
                    size={14}
                    color={isActive ? "#FFFFFF" : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.themePillText,
                      { color: isActive ? "#FFFFFF" : colors.mutedForeground },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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
          icon="diamond-outline"
          label="Upgrade to SkillSee Premium"
          color="#A855F7"
          onPress={() => router.push("/premium")}
        />
      </View>

      {/* ── Settings ── */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Settings</Text>
      <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.settingIconWrap, { backgroundColor: "#8B5CF622" }]}>
            <Ionicons name="notifications-outline" size={18} color="#8B5CF6" />
          </View>
          <Text style={[styles.settingLabel, { color: colors.foreground }]}>Daily Reminders</Text>
          <Switch
            value={notifEnabled}
            onValueChange={handleToggleNotif}
            trackColor={{ false: colors.secondary, true: colors.primary + "99" }}
            thumbColor={notifEnabled ? colors.primary : colors.mutedForeground}
            ios_backgroundColor={colors.secondary}
          />
        </View>
        <SettingRow
          icon="lock-closed-outline"
          label="Privacy & Data"
          color="#64748B"
          onPress={() => router.push("/privacy")}
        />
        <SettingRow
          icon="settings-outline"
          label="Account Settings"
          color="#64748B"
          onPress={() => router.push("/edit-profile")}
        />
      </View>

      {/* Cloud Sync / Auth */}
      <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {isSignedIn ? (
          <>
            <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.settingIconWrap, { backgroundColor: "#10B98122" }]}>
                <Ionicons name="cloud-done-outline" size={18} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>Cloud Sync</Text>
                <Text style={[{ fontSize: 12, color: colors.mutedForeground }]}>
                  {user?.primaryEmailAddress?.emailAddress ?? "Signed in"}
                </Text>
              </View>
              {isSyncing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <TouchableOpacity onPress={syncNow} style={{ padding: 4 }}>
                  <Ionicons name="refresh-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            <SettingRow
              icon="log-out-outline"
              label="Log Out"
              destructive
              onPress={() => setShowLogout(true)}
            />
          </>
        ) : (
          <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: "transparent" }]}
            onPress={() => router.push("/sign-in")}
            activeOpacity={0.7}
          >
            <View style={[styles.settingIconWrap, { backgroundColor: "#6366F122" }]}>
              <Ionicons name="cloud-outline" size={18} color="#6366F1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: "#6366F1" }]}>Sign In to Sync</Text>
              <Text style={[{ fontSize: 12, color: colors.mutedForeground }]}>
                Back up your library across devices
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>
        SkillSee v1.0 · Save. Learn. Master.
      </Text>
    </ScrollView>
    <ConfirmModal
      visible={showLogout}
      title="Log Out"
      message="Your saved library will remain on this device. You can sign back in anytime to re-sync."
      actions={[
        { label: "Cancel", onPress: () => setShowLogout(false) },
        {
          label: "Log Out",
          destructive: true,
          onPress: async () => {
            setShowLogout(false);
            await signOut();
          },
        },
      ]}
      onDismiss={() => setShowLogout(false)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
  screenTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 4 },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  avatarWrap: { position: "relative", marginBottom: 4 },
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
  },
  profileName: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
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
    marginTop: 6,
  },
  editBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
    marginTop: 6,
    marginBottom: -2,
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statBubble: {
    width: "30%",
    flexGrow: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statBubbleValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statBubbleLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: -2,
  },
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
  themeSettingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  themePills: { flexDirection: "row", gap: 6 },
  themePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  themePillText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  version: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 8, marginBottom: 4 },
});
