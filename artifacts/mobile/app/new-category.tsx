import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AVAILABLE_COLORS, IconPicker } from "@/components/IconPicker";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useLibrary } from "@/context/LibraryContext";
import { useColors } from "@/hooks/useColors";
import { useSubscription } from "@/lib/revenuecat";

export const FREE_CATEGORY_LIMIT = 10;

export default function NewCategoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addCategory, categories } = useLibrary();
  const { isSubscribed } = useSubscription();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("book-outline");
  const [color, setColor] = useState(AVAILABLE_COLORS[0]);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const atLimit = !isSubscribed && categories.length >= FREE_CATEGORY_LIMIT;

  function handleCreate() {
    if (!name.trim()) return;
    if (atLimit) {
      setShowUpgrade(true);
      return;
    }
    addCategory(name.trim(), icon, color);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <UpgradeModal
        visible={showUpgrade}
        onDismiss={() => setShowUpgrade(false)}
      />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>New Category</Text>
        <TouchableOpacity
          onPress={handleCreate}
          style={[styles.createBtn, { backgroundColor: name.trim() ? colors.primary : colors.secondary }]}
          disabled={!name.trim()}
        >
          <Text style={[styles.createBtnText, { color: name.trim() ? "#FFFFFF" : colors.mutedForeground }]}>
            Create
          </Text>
        </TouchableOpacity>
      </View>

      {/* Free limit banner */}
      {!isSubscribed && (
        <TouchableOpacity
          style={[styles.limitBanner, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/premium")}
          activeOpacity={0.8}
        >
          <Ionicons name="albums-outline" size={15} color="#6366F1" />
          <Text style={[styles.limitBannerText, { color: colors.mutedForeground }]}>
            {categories.length}/{FREE_CATEGORY_LIMIT} categories used
          </Text>
          {atLimit && (
            <View style={styles.limitBadge}>
              <Text style={styles.limitBadgeText}>Limit reached · Upgrade</Text>
            </View>
          )}
          {!atLimit && (
            <Text style={[styles.limitLink, { color: "#6366F1" }]}>Go Premium →</Text>
          )}
        </TouchableOpacity>
      )}

      <ScrollView
        contentContainerStyle={[styles.form, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.preview}>
          <View style={[styles.previewIcon, { backgroundColor: color + "22" }]}>
            <Ionicons name={icon as any} size={36} color={color} />
          </View>
          <TextInput
            value={name}
            onChangeText={setName}
            style={[styles.nameInput, { color: colors.foreground, borderBottomColor: colors.border }]}
            placeholder="Category name"
            placeholderTextColor={colors.mutedForeground}
            maxLength={30}
            autoFocus
          />
        </View>

        <IconPicker
          selectedIcon={icon}
          selectedColor={color}
          onSelectIcon={setIcon}
          onSelectColor={setColor}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  cancelText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  createBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  createBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },

  limitBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  limitBannerText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  limitBadge: {
    backgroundColor: "#6366F115",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  limitBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#6366F1" },
  limitLink: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  form: { padding: 20, gap: 24 },
  preview: { alignItems: "center", gap: 16, paddingBottom: 8 },
  previewIcon: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  nameInput: {
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    borderBottomWidth: 1,
    paddingBottom: 8,
    width: "80%",
  },
});
